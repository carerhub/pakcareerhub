import React, { useState, useRef } from "react";
import { 
  useListJobs, useDeleteJob, useCreateJob, useUpdateJob,
  useListDepartments, useListCities, useListCategories,
  useRequestAdvertisementUploadUrl, useCreateJobsFromAdvertisement
} from "@workspace/api-client-react";
import { Job, JobInput } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Archive, Edit, Trash2, Plus, Search, Upload, X, RotateCcw, Clock3, FileText, ExternalLink, ShieldAlert, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { getListJobsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Textarea } from "@/components/ui/textarea";

export default function AdminJobs() {
  const [search, setSearch] = useState("");
  const [jobView, setJobView] = useState<"active" | "draft" | "unpublished" | "archived">("active");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: jobsRes, isLoading } = useListJobs({
    limit: 50,
    search: search || undefined,
    status: jobView === "active" ? "all" : jobView,
  });
  const { data: depts } = useListDepartments();
  const { data: cities } = useListCities();
  const { data: categories } = useListCategories();

  const deleteJob = useDeleteJob();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const requestUpload = useRequestAdvertisementUploadUrl();
  const createAdvertisementDrafts = useCreateJobsFromAdvertisement();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [advertisementModalOpen, setAdvertisementModalOpen] = useState(false);
  const [advertisementFile, setAdvertisementFile] = useState<File | null>(null);
  const [advertisementPreview, setAdvertisementPreview] = useState("");
  const [reviewDrafts, setReviewDrafts] = useState<Job[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);

  const [formData, setFormData] = useState<Partial<JobInput>>({
    title: "",
    organization: "",
    jobType: "government",
    employmentType: "full_time",
    description: "",
    requirements: "",
    howToApply: "",
    applyUrl: "",
  });
  const isReviewingAdvertisement = reviewDrafts.length > 0;
  const currentReviewJob = reviewDrafts[reviewIndex] || null;

  const jobToForm = (job: Job): Partial<JobInput> => ({
    title: job.title,
    organization: job.organization,
    jobType: job.jobType,
    employmentType: job.employmentType,
    departmentId: job.departmentId,
    cityId: job.cityId,
    categoryId: job.categoryId,
    description: job.description || "",
    requirements: job.requirements || "",
    howToApply: job.howToApply || "",
    applyUrl: job.applyUrl || "",
    deadline: job.deadline || "",
    logoUrl: job.logoUrl || "",
    isFeatured: job.isFeatured,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryPackage: job.salaryPackage || "",
    vacancies: job.vacancies ?? undefined,
    postName: job.postName || "",
    bps: job.bps || "",
    qualification: job.qualification || "",
    education: job.education || "",
    experience: job.experience || "",
    gender: job.gender || "",
    domicile: job.domicile || "",
    quota: job.quota || "",
    province: job.province || "",
    location: job.location || "",
    applicationFee: job.applicationFee || "",
    applicationStartDate: job.applicationStartDate || "",
    requiredDocuments: job.requiredDocuments || "",
    advertisementNumber: job.advertisementNumber || "",
    referenceNumber: job.referenceNumber || "",
    contactInformation: job.contactInformation || "",
    importantInstructions: job.importantInstructions || "",
    termsConditions: job.termsConditions || "",
  });

  const updateField = (key: keyof JobInput, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const normalizeContentType = (file: File) => {
    if (file.type) return file.type === "image/jpg" ? "image/jpeg" : file.type;
    const extension = file.name.toLowerCase().split(".").pop();
    return extension === "pdf" ? "application/pdf" : extension === "webp" ? "image/webp" : extension === "png" ? "image/png" : "image/jpeg";
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Image must be under 2MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogoPreview(base64);
      setFormData(prev => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview("");
    setFormData(prev => ({ ...prev, logoUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJob.mutateAsync({ id });
        toast({ title: "Job deleted successfully" });
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
      } catch {
        toast({ title: "Failed to delete job", variant: "destructive" });
      }
    }
  };

  const addMonths = (date: Date, months: number) => {
    const result = new Date(date);
    const dayOfMonth = result.getDate();
    result.setDate(1);
    result.setMonth(result.getMonth() + months);
    const lastDayOfMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    result.setDate(Math.min(dayOfMonth, lastDayOfMonth));
    return result;
  };

  const handleArchive = async (id: number) => {
    try {
      await updateJob.mutateAsync({ id, data: { status: "archived" } });
      toast({ title: "Job archived" });
      queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
    } catch {
      toast({ title: "Failed to archive job", variant: "destructive" });
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await updateJob.mutateAsync({ id, data: { status: "unpublished" } });
      toast({ title: "Job unpublished" });
      queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
    } catch {
      toast({ title: "Failed to unpublish job", variant: "destructive" });
    }
  };

  const handleRepublish = async (id: number) => {
    try {
      await updateJob.mutateAsync({ id, data: { status: "published", expiresAt: addMonths(new Date(), 12).toISOString() } });
      toast({ title: "Job republished" });
      queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
    } catch {
      toast({ title: "Failed to republish job", variant: "destructive" });
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await updateJob.mutateAsync({
        id,
        data: { status: "active", expiresAt: addMonths(new Date(), 12).toISOString() },
      });
      toast({ title: "Job restored for 12 months" });
      queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
    } catch {
      toast({ title: "Failed to restore job", variant: "destructive" });
    }
  };

  const handleExtend = async (job: Job) => {
    try {
      const currentExpiry = new Date(job.expiresAt);
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
      await updateJob.mutateAsync({
        id: job.id,
        data: { status: "active", expiresAt: addMonths(baseDate, 12).toISOString() },
      });
      toast({ title: "Job expiry extended by 12 months" });
      queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
    } catch {
      toast({ title: "Failed to extend job expiry", variant: "destructive" });
    }
  };

  const openAdd = () => {
    setEditingJob(null);
    setLogoPreview("");
    setFormData({
      title: "",
      organization: "",
      jobType: "government",
      employmentType: "full_time",
      description: "",
      requirements: "",
      howToApply: "",
      applyUrl: "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (job: Job) => {
    setEditingJob(job);
    setLogoPreview(job.logoUrl || "");
    setFormData(jobToForm(job));
    setIsModalOpen(true);
  };

  const openAdvertisementModal = () => {
    setAdvertisementFile(null);
    setAdvertisementPreview("");
    setAdvertisementModalOpen(true);
  };

  const handleAdvertisementSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const contentType = normalizeContentType(file);
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(contentType)) {
      toast({ title: "Use a JPG, JPEG, PNG, WEBP, or PDF advertisement.", variant: "destructive" });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast({ title: "Advertisement must be under 15MB.", variant: "destructive" });
      return;
    }
    setAdvertisementFile(file);
    setAdvertisementPreview(URL.createObjectURL(file));
  };

  const handleProcessAdvertisement = async () => {
    if (!advertisementFile) {
      toast({ title: "Choose an advertisement first.", variant: "destructive" });
      return;
    }
    try {
      const contentType = normalizeContentType(advertisementFile);
      const upload = await requestUpload.mutateAsync({
        data: { name: advertisementFile.name, size: advertisementFile.size, contentType: contentType as "image/jpeg" | "image/png" | "image/webp" | "application/pdf" },
      });
      const uploadResponse = await fetch(upload.uploadURL, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: advertisementFile,
      });
      if (!uploadResponse.ok) throw new Error("Upload failed");
      const result = await createAdvertisementDrafts.mutateAsync({
        data: {
          objectPath: upload.objectPath,
          fileName: advertisementFile.name,
          contentType: contentType as "image/jpeg" | "image/png" | "image/webp" | "application/pdf",
          size: advertisementFile.size,
        },
      });
      if (!result.jobs.length) throw new Error("No draft was created");
      setReviewDrafts(result.jobs);
      setReviewIndex(0);
      setAdvertisementModalOpen(false);
      openEdit(result.jobs[0]);
      toast({
        title: `${result.jobs.length} draft${result.jobs.length === 1 ? "" : "s"} created`,
        description: "Review every extracted field before publishing.",
      });
      queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
    } catch (error) {
      toast({
        title: "Advertisement processing failed",
        description: error instanceof Error ? error.message : "Please verify the file and try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.organization) {
        toast({ title: "Title and Organization are required", variant: "destructive" });
        return;
      }
      if (editingJob) {
        const updated = await updateJob.mutateAsync({ id: editingJob.id, data: formData as any });
        setEditingJob(updated);
        if (isReviewingAdvertisement) {
          setReviewDrafts(prev => prev.map(job => job.id === updated.id ? updated : job));
          toast({ title: "Draft updated", description: "It remains private until you publish it." });
        } else {
          toast({ title: "Job updated successfully" });
        }
      } else {
        await createJob.mutateAsync({ data: formData as JobInput });
        toast({ title: "Job created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
      if (!isReviewingAdvertisement) setIsModalOpen(false);
    } catch {
      toast({ title: "Failed to save job", variant: "destructive" });
    }
  };

  const handlePublishDraft = async () => {
    if (!editingJob) return;
    if (!formData.title || !formData.organization || formData.title === "Requires Verification" || formData.organization === "Requires Verification") {
      toast({ title: "Verify the title and organization before publishing.", variant: "destructive" });
      return;
    }
    try {
      const updated = await updateJob.mutateAsync({
        id: editingJob.id,
        data: {
          ...formData,
          status: "published",
          verificationStatus: "reviewed",
          expiresAt: addMonths(new Date(), 12).toISOString(),
        } as any,
      });
      const remaining = reviewDrafts.filter(job => job.id !== updated.id);
      queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
      if (remaining.length > 0) {
        setReviewDrafts(remaining);
        setReviewIndex(0);
        openEdit(remaining[0]);
        toast({ title: "Job published", description: "Review the next advertisement draft." });
      } else {
        setReviewDrafts([]);
        setReviewIndex(0);
        setIsModalOpen(false);
        toast({ title: "Job published successfully" });
      }
    } catch {
      toast({ title: "Failed to publish job", variant: "destructive" });
    }
  };

  const closeEditor = () => {
    setIsModalOpen(false);
    setReviewDrafts([]);
    setReviewIndex(0);
  };

  const visibleJobs = jobsRes?.jobs.filter(job =>
    jobView === "active" ? job.status === "active" || job.status === "published" : job.status === jobView,
  ) || [];

  const extractedTextFields: Array<{ key: keyof JobInput; label: string; multiline?: boolean }> = [
    { key: "postName", label: "Post Name" },
    { key: "bps", label: "BPS / Grade / Scale" },
    { key: "qualification", label: "Qualification" },
    { key: "education", label: "Education Requirements" },
    { key: "experience", label: "Experience" },
    { key: "gender", label: "Gender" },
    { key: "domicile", label: "Domicile" },
    { key: "quota", label: "Quota" },
    { key: "province", label: "Province / Region" },
    { key: "location", label: "Job Location" },
    { key: "salaryPackage", label: "Salary / Pay Package" },
    { key: "applicationFee", label: "Application Fee" },
    { key: "applicationStartDate", label: "Application Start Date" },
    { key: "requiredDocuments", label: "Required Documents", multiline: true },
    { key: "advertisementNumber", label: "Advertisement Number" },
    { key: "referenceNumber", label: "Reference Number" },
    { key: "contactInformation", label: "Contact Information", multiline: true },
    { key: "importantInstructions", label: "Important Instructions", multiline: true },
    { key: "termsConditions", label: "Terms & Conditions", multiline: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">Manage Jobs</h1>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" onClick={openAdvertisementModal}>
            <FileText className="h-4 w-4 mr-2" /> Add from Advertisement
          </Button>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" /> Add New Job
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex w-fit rounded-lg border bg-white p-1 shadow-sm">
          <Button
            variant={jobView === "active" ? "default" : "ghost"}
            size="sm"
            onClick={() => setJobView("active")}
          >
            Active Jobs
          </Button>
          <Button
            variant={jobView === "draft" ? "default" : "ghost"}
            size="sm"
            onClick={() => setJobView("draft")}
          >
            Drafts
          </Button>
          <Button
            variant={jobView === "unpublished" ? "default" : "ghost"}
            size="sm"
            onClick={() => setJobView("unpublished")}
          >
            Unpublished
          </Button>
          <Button
            variant={jobView === "archived" ? "default" : "ghost"}
            size="sm"
            onClick={() => setJobView("archived")}
          >
            Archived Jobs
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
           Published jobs automatically archive 12 months after publication.
        </p>
      </div>

      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm max-w-md">
        <Search className="h-5 w-5 text-muted-foreground ml-2" />
        <Input
          placeholder="Search jobs..."
          className="border-0 focus-visible:ring-0 shadow-none h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : visibleJobs.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">No {jobView} jobs found.</TableCell></TableRow>
            ) : (
              visibleJobs.map(job => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium text-secondary">
                    <div className="flex items-center gap-2">
                      {job.logoUrl && (
                        <img
                          src={job.logoUrl}
                          alt={job.organization}
                          className="h-8 w-8 rounded object-contain border bg-white"
                        />
                      )}
                      {job.title}
                    </div>
                  </TableCell>
                  <TableCell>{job.organization}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={job.jobType === 'government' ? 'bg-primary/10 text-primary' : ''}>
                      {job.jobType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={job.status === "active" || job.status === "published" ? "default" : "secondary"}>
                      {job.status === "published" ? "Published" : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />
                      {format(new Date(job.expiresAt), 'dd MMM yyyy')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => openEdit(job)}>
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    {job.status === "active" || job.status === "published" ? (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Extend expiry by 12 months"
                          onClick={() => handleExtend(job)}
                          disabled={updateJob.isPending}
                        >
                          <Clock3 className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Archive job"
                          onClick={() => handleArchive(job.id)}
                          disabled={updateJob.isPending}
                        >
                          <Archive className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        {job.status === "published" && (
                          <Button
                            variant="outline"
                            size="icon"
                            title="Unpublish job"
                            onClick={() => handleUnpublish(job.id)}
                            disabled={updateJob.isPending}
                          >
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </>
                    ) : job.status === "archived" ? (
                      <Button
                        variant="outline"
                        size="icon"
                        title="Restore for 12 months"
                        onClick={() => handleRestore(job.id)}
                        disabled={updateJob.isPending}
                      >
                        <RotateCcw className="h-4 w-4 text-primary" />
                      </Button>
                    ) : job.status === "unpublished" ? (
                      <Button
                        variant="outline"
                        size="icon"
                        title="Republish job"
                        onClick={() => handleRepublish(job.id)}
                        disabled={updateJob.isPending}
                      >
                        <RotateCcw className="h-4 w-4 text-primary" />
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(job.id)}
                      className="hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={advertisementModalOpen} onOpenChange={setAdvertisementModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Job from Advertisement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
              Upload an advertisement to create private drafts. OCR only extracts what it can read; every draft must be reviewed before publishing.
            </div>
            <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/10 p-6 text-center hover:border-primary/50">
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <span className="font-medium">{advertisementFile?.name || "Choose advertisement file"}</span>
              <span className="mt-1 text-xs text-muted-foreground">JPG, JPEG, PNG, WEBP, or PDF · max 15MB</span>
              <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleAdvertisementSelect} />
            </label>
            {advertisementPreview && advertisementFile && (
              <div className="overflow-hidden rounded-lg border bg-muted/10">
                {normalizeContentType(advertisementFile) === "application/pdf" ? (
                  <iframe src={advertisementPreview} title="Advertisement preview" className="h-64 w-full" />
                ) : (
                  <img src={advertisementPreview} alt="Advertisement preview" className="max-h-64 w-full object-contain" />
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setAdvertisementModalOpen(false)}>Cancel</Button>
            <Button onClick={handleProcessAdvertisement} disabled={!advertisementFile || requestUpload.isPending || createAdvertisementDrafts.isPending}>
              {requestUpload.isPending || createAdvertisementDrafts.isPending ? "Reading advertisement..." : "Extract & Create Draft"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isReviewingAdvertisement ? `Review Advertisement Draft ${reviewIndex + 1} of ${reviewDrafts.length}` : editingJob ? "Edit Job" : "Add New Job"}</DialogTitle>
          </DialogHeader>

          {isReviewingAdvertisement && editingJob?.advertisementUrl && (
            <div className="rounded-xl border bg-muted/10 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Original advertisement</p>
                  <p className="text-xs text-muted-foreground">{editingJob.advertisementName || "Uploaded file"} · OCR status: {editingJob.extractionStatus || "completed"}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={editingJob.advertisementUrl} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> Open</a>
                </Button>
              </div>
              {editingJob.advertisementMimeType === "application/pdf" ? (
                <iframe src={editingJob.advertisementUrl} title="Original advertisement" className="h-80 w-full rounded-lg bg-white" />
              ) : (
                <img src={editingJob.advertisementUrl} alt="Original advertisement" className="max-h-80 w-full rounded-lg bg-white object-contain" />
              )}
              <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-900">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                OCR values can be wrong or incomplete. Confirm vacancy numbers, dates, BPS, quota, department, qualification, and application URL.
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Logo / Ad Image Upload */}
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Job / Organization Logo or Ad Image</label>
              <div className="flex items-start gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-24 w-24 rounded-lg object-contain border bg-muted/20"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 h-5 w-5 bg-destructive text-white rounded-full flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-24 w-24 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/10 transition-colors"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground text-center">Upload Logo</span>
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {logoPreview ? "Change Image" : "Upload Image"}
                  </Button>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 2MB. Will display as job logo and ad image.</p>
                  {/* Or URL input */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Or paste URL:</span>
                    <Input
                      className="h-7 text-xs"
                      placeholder="https://..."
                      value={formData.logoUrl && !formData.logoUrl.startsWith("data:") ? formData.logoUrl : ""}
                      onChange={e => {
                        setLogoPreview(e.target.value);
                        setFormData(prev => ({ ...prev, logoUrl: e.target.value }));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title *</label>
              <Input
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Assistant Director"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Organization *</label>
              <Input
                value={formData.organization}
                onChange={e => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                placeholder="e.g. FPSC"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Job Type</label>
              <Select
                value={formData.jobType}
                onValueChange={(val: any) => setFormData(prev => ({ ...prev, jobType: val }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Employment Type</label>
              <Select
                value={formData.employmentType}
                onValueChange={(val: any) => setFormData(prev => ({ ...prev, employmentType: val }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select
                value={formData.departmentId?.toString() || "none"}
                onValueChange={val => setFormData(prev => ({ ...prev, departmentId: val === "none" ? null : Number(val) }))}
              >
                <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {depts?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Select
                value={formData.cityId?.toString() || "none"}
                onValueChange={val => setFormData(prev => ({ ...prev, cityId: val === "none" ? null : Number(val) }))}
              >
                <SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {cities?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deadline</label>
              <Input
                type="date"
                value={formData.deadline ? formData.deadline.substring(0, 10) : ""}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Salary Range</label>
              <Input
                value={formData.salaryMin || formData.salaryMax ? `${formData.salaryMin || ""}${formData.salaryMin && formData.salaryMax ? " - " : ""}${formData.salaryMax || ""}` : ""}
                onChange={e => {
                  const values = e.target.value.replace(/,/g, "").match(/\d+/g) || [];
                  setFormData(prev => ({ ...prev, salaryMin: values[0] ? Number(values[0]) : undefined, salaryMax: values[1] ? Number(values[1]) : undefined }));
                }}
                placeholder="e.g. PKR 50,000 – 80,000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Vacancies</label>
              <Input
                type="number"
                value={formData.vacancies ?? ""}
                onChange={e => updateField("vacancies", e.target.value ? Number(e.target.value) : null)}
                placeholder="Not Found / Requires Verification"
              />
            </div>

            {isReviewingAdvertisement && extractedTextFields.map(field => (
              <div key={String(field.key)} className={field.multiline ? "col-span-2 space-y-2" : "space-y-2"}>
                <label className="text-sm font-medium">{field.label}</label>
                {field.multiline ? (
                  <Textarea
                    value={String(formData[field.key] ?? "")}
                    onChange={e => updateField(field.key, e.target.value)}
                    placeholder="Not Found / Requires Verification"
                    rows={3}
                  />
                ) : (
                  <Input
                    value={String(formData[field.key] ?? "")}
                    onChange={e => updateField(field.key, e.target.value)}
                    placeholder="Not Found / Requires Verification"
                  />
                )}
              </div>
            ))}

            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Job Description</label>
              <RichTextEditor
                value={formData.description || ""}
                onChange={val => setFormData(prev => ({ ...prev, description: val }))}
                placeholder="Describe the job role, responsibilities, and organization..."
                minHeight={200}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Requirements & Qualifications</label>
              <RichTextEditor
                value={formData.requirements || ""}
                onChange={val => setFormData(prev => ({ ...prev, requirements: val }))}
                placeholder="List the required qualifications, experience, and skills..."
                minHeight={150}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Apply Link (URL)</label>
              <Input
                type="url"
                value={formData.applyUrl || ""}
                onChange={e => setFormData(prev => ({ ...prev, applyUrl: e.target.value }))}
                placeholder="https://official-website.gov.pk/apply"
              />
              <p className="text-xs text-muted-foreground">This link appears as the Apply Now button below the job description.</p>
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">How to Apply Instructions</label>
              <RichTextEditor
                value={formData.howToApply || ""}
                onChange={val => setFormData(prev => ({ ...prev, howToApply: val }))}
                placeholder="Explain the application process..."
                minHeight={120}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={closeEditor}>Cancel</Button>
            <Button onClick={handleSave} disabled={createJob.isPending || updateJob.isPending}>
              {createJob.isPending || updateJob.isPending ? "Saving..." : isReviewingAdvertisement ? "Save Draft" : "Save Job"}
            </Button>
            {isReviewingAdvertisement && (
              <Button onClick={handlePublishDraft} disabled={updateJob.isPending}>
                {updateJob.isPending ? "Publishing..." : "Publish Job"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
