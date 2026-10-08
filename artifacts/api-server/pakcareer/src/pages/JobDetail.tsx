import React from "react";
import { Link } from "wouter";
import { useGetJob, getGetJobQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, MapPin, Clock, CalendarDays, Wallet, 
  User, GraduationCap, BriefcaseBusiness, Share2, 
  ExternalLink, ChevronLeft, AlertCircle, Download
} from "lucide-react";
import { format } from "date-fns";

export default function JobDetail({ id }: { id: string }) {
  const jobId = Number(id);
  const { data: job, isLoading, isError } = useGetJob(jobId, {
    query: {
      enabled: !!jobId,
      queryKey: getGetJobQueryKey(jobId)
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl animate-pulse">
        <div className="h-8 w-24 bg-muted mb-8 rounded"></div>
        <div className="h-32 bg-muted mb-8 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="h-64 bg-muted rounded-xl"></div>
            <div className="h-48 bg-muted rounded-xl"></div>
          </div>
          <div className="h-96 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-xl">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
        <p className="text-muted-foreground mb-6">The job you are looking for does not exist or has been removed.</p>
        <Link href="/jobs" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
          Browse All Jobs
        </Link>
      </div>
    );
  }

  const isGovt = job.jobType === "government";
  const formattedDeadline = job.deadline && !Number.isNaN(Date.parse(job.deadline))
    ? format(new Date(job.deadline), 'dd MMMM, yyyy')
    : (job.deadline || "Not specified");
  const structuredFields = [
    { label: "Department / Organization", value: job.departmentName || job.organization },
    { label: "Job Title", value: job.title },
    { label: "Post Name", value: job.postName },
    { label: "Vacancies", value: job.vacancies },
    { label: "BPS / Grade / Scale", value: job.bps },
    { label: "Qualification", value: job.qualification },
    { label: "Education Requirements", value: job.education },
    { label: "Experience", value: job.experience },
    { label: "Age Limit", value: job.ageMin || job.ageMax ? `${job.ageMin || "18"} to ${job.ageMax || "Any"} Years` : null },
    { label: "Gender", value: job.gender },
    { label: "Quota", value: job.quota },
    { label: "Domicile", value: job.domicile },
    { label: "Province / Region", value: job.province },
    { label: "Job Location", value: job.location || job.cityName },
    { label: "Salary / Pay Package", value: job.salaryPackage || ((job.salaryMin || job.salaryMax) ? `${job.salaryMin ? `Rs. ${job.salaryMin.toLocaleString()}` : ""}${job.salaryMin && job.salaryMax ? " - " : ""}${job.salaryMax ? `Rs. ${job.salaryMax.toLocaleString()}` : ""}` : null) },
    { label: "Application Fee", value: job.applicationFee },
    { label: "Application Start Date", value: job.applicationStartDate },
    { label: "Last Date to Apply", value: formattedDeadline },
  ].filter((item) => item.value !== null && item.value !== undefined && item.value !== "");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link href="/jobs" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Jobs
      </Link>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
          <div className="flex gap-6 items-center">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-xl border bg-muted/20 p-2 flex items-center justify-center shrink-0 bg-white">
              {job.logoUrl ? (
                <img src={job.logoUrl} alt={job.organization} className="w-full h-full object-contain" />
              ) : (
                <Building2 className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={isGovt ? "bg-primary hover:bg-primary/90" : "bg-blue-600 hover:bg-blue-700"}>
                  {isGovt ? "Government Job" : "Private Job"}
                </Badge>
                {job.departmentName && (
                  <Badge variant="outline">{job.departmentName}</Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-2 leading-tight">
                {job.title}
              </h1>
              <p className="text-lg text-muted-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 shrink-0" />
                {job.organization}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {job.applyUrl && (
              <a href={job.applyUrl} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                  Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            )}
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-4">
              <Share2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {structuredFields.length > 0 && (
            <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-secondary mb-4 border-b pb-4">Job Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {structuredFields.map((item) => (
                  <div key={item.label}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                    <p className="mt-1 text-sm text-foreground/80">{String(item.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(job.requiredDocuments || job.importantInstructions || job.termsConditions) && (
            <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm space-y-5">
              {job.requiredDocuments && (
                <div>
                  <h2 className="text-xl font-bold text-secondary mb-3">Required Documents</h2>
                  <div className="prose prose-sm max-w-none text-foreground/80" dangerouslySetInnerHTML={{ __html: job.requiredDocuments }} />
                </div>
              )}
              {job.importantInstructions && (
                <div>
                  <h2 className="text-xl font-bold text-secondary mb-3">Important Instructions</h2>
                  <div className="prose prose-sm max-w-none text-foreground/80" dangerouslySetInnerHTML={{ __html: job.importantInstructions }} />
                </div>
              )}
              {job.termsConditions && (
                <div>
                  <h2 className="text-xl font-bold text-secondary mb-3">Terms & Conditions</h2>
                  <div className="prose prose-sm max-w-none text-foreground/80" dangerouslySetInnerHTML={{ __html: job.termsConditions }} />
                </div>
              )}
            </div>
          )}

          {job.description && (
            <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-secondary mb-4 border-b pb-4">Job Description</h2>
              <div className="prose prose-sm md:prose-base max-w-none text-foreground/80" dangerouslySetInnerHTML={{ __html: job.description }} />
            </div>
          )}
          
          {job.requirements && (
            <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-secondary mb-4 border-b pb-4">Requirements & Eligibility</h2>
              <div className="prose prose-sm md:prose-base max-w-none text-foreground/80" dangerouslySetInnerHTML={{ __html: job.requirements }} />
            </div>
          )}

          {job.howToApply && (
            <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-secondary mb-4 border-b pb-4">How to Apply</h2>
              <div className="prose prose-sm md:prose-base max-w-none text-foreground/80" dangerouslySetInnerHTML={{ __html: job.howToApply }} />
            </div>
          )}

          {job.advertisementUrl && (
            <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-secondary">Original Advertisement</h2>
                  <p className="text-sm text-muted-foreground mt-1">{job.advertisementName || "View the original job advertisement"}</p>
                </div>
                <div className="flex gap-2">
                  <a href={job.advertisementUrl} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm"><ExternalLink className="mr-2 h-4 w-4" /> View</Button>
                  </a>
                  <a href={job.advertisementUrl} download={job.advertisementName || "job-advertisement"} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Download</Button>
                  </a>
                </div>
              </div>
              {job.advertisementMimeType === "application/pdf" ? (
                <iframe src={job.advertisementUrl} title="Original job advertisement" className="h-[620px] w-full rounded-xl border bg-muted/10" />
              ) : (
                <img src={job.advertisementUrl} alt={job.advertisementName || "Original job advertisement"} className="max-h-[720px] w-full rounded-xl border bg-muted/10 object-contain" />
              )}
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-lg mb-6 border-b pb-4 text-secondary">Job Overview</h3>
            
            <ul className="space-y-5">
              <li className="flex gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded text-primary shrink-0">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-secondary">Last Date</p>
                  <p className="text-sm text-destructive font-medium mt-0.5">{formattedDeadline}</p>
                </div>
              </li>
              
              <li className="flex gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded text-primary shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-secondary">Location</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{job.cityName || "Multiple Cities, Pakistan"}</p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded text-primary shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-secondary">Employment Type</p>
                  <p className="text-sm text-muted-foreground mt-0.5 capitalize">{job.employmentType.replace('_', ' ')}</p>
                </div>
              </li>

              {(job.salaryMin || job.salaryMax) && (
                <li className="flex gap-4">
                  <div className="mt-1 bg-primary/10 p-2 rounded text-primary shrink-0">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary">Salary</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {job.salaryMin ? `Rs. ${job.salaryMin.toLocaleString()}` : ''}
                      {job.salaryMin && job.salaryMax ? ' - ' : ''}
                      {job.salaryMax ? `Rs. ${job.salaryMax.toLocaleString()}` : ''}
                    </p>
                  </div>
                </li>
              )}

              {job.education && (
                <li className="flex gap-4">
                  <div className="mt-1 bg-primary/10 p-2 rounded text-primary shrink-0">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary">Education</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{job.education}</p>
                  </div>
                </li>
              )}

              {job.experience && (
                <li className="flex gap-4">
                  <div className="mt-1 bg-primary/10 p-2 rounded text-primary shrink-0">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary">Experience</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{job.experience}</p>
                  </div>
                </li>
              )}

              {(job.ageMin || job.ageMax) && (
                <li className="flex gap-4">
                  <div className="mt-1 bg-primary/10 p-2 rounded text-primary shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary">Age Limit</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {job.ageMin || '18'} to {job.ageMax || 'Any'} Years
                    </p>
                  </div>
                </li>
              )}
            </ul>

            {job.applyUrl && (
              <div className="mt-8 pt-6 border-t">
                <a href={job.applyUrl} target="_blank" rel="noreferrer" className="block w-full">
                  <Button className="w-full text-base h-12" size="lg">Apply For This Job</Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
