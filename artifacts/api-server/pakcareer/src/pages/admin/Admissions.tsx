import React, { useState } from "react";
import { 
  useListAdmissions, useDeleteAdmission, useCreateAdmission, useUpdateAdmission 
} from "@workspace/api-client-react";
import { Admission, AdmissionInput } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListAdmissionsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function AdminAdmissions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: list, isLoading } = useListAdmissions({ limit: 100 });
  const del = useDeleteAdmission();
  const create = useCreateAdmission();
  const update = useUpdateAdmission();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Admission | null>(null);
  const [formData, setFormData] = useState<Partial<AdmissionInput>>({ title: "", institution: "", isScholarship: false });

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure?")) {
      try {
        await del.mutateAsync({ id });
        toast({ title: "Deleted successfully" });
        queryClient.invalidateQueries({ queryKey: getListAdmissionsQueryKey() });
      } catch (e) { toast({ title: "Failed to delete", variant: "destructive" }); }
    }
  };

  const openAdd = () => { setEditing(null); setFormData({ title: "", institution: "", isScholarship: false }); setIsModalOpen(true); };
  const openEdit = (item: Admission) => { setEditing(item); setFormData({ title: item.title, institution: item.institution, description: item.description || "", deadline: item.deadline || "", applyUrl: item.applyUrl || "", isScholarship: item.isScholarship, logoUrl: item.logoUrl || "" }); setIsModalOpen(true); };

  const handleSave = async (): Promise<void> => {
    try {
      if (!formData.title || !formData.institution) { toast({ title: "Required fields missing", variant: "destructive" }); return; }
      if (editing) await update.mutateAsync({ id: editing.id, data: formData as any });
      else await create.mutateAsync({ data: formData as AdmissionInput });
      toast({ title: "Saved successfully" });
      queryClient.invalidateQueries({ queryKey: getListAdmissionsQueryKey() });
      setIsModalOpen(false);
    } catch (e) { toast({ title: "Failed to save", variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">Manage Admissions & Scholarships</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Record</Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Institution</TableHead><TableHead>Type</TableHead><TableHead>Deadline</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow> : list?.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-secondary">{item.title}</TableCell>
                <TableCell>{item.institution}</TableCell>
                <TableCell><Badge variant="outline" className={item.isScholarship ? 'bg-purple-100 text-purple-700' : ''}>{item.isScholarship ? 'Scholarship' : 'Admission'}</Badge></TableCell>
                <TableCell>{item.deadline ? format(new Date(item.deadline), 'dd MMM yyyy') : 'N/A'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(item.id)} className="hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <Input placeholder="Institution" value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} />
            <Input placeholder="Apply URL" value={formData.applyUrl || ''} onChange={e => setFormData({...formData, applyUrl: e.target.value})} />
            <Input type="date" value={formData.deadline ? formData.deadline.substring(0,10) : ''} onChange={e => setFormData({...formData, deadline: e.target.value ? new Date(e.target.value).toISOString() : ''})} />
            <div className="flex items-center gap-2">
              <Switch checked={formData.isScholarship} onCheckedChange={c => setFormData({...formData, isScholarship: c})} />
              <label className="text-sm font-medium">Is this a Scholarship?</label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={create.isPending || update.isPending}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}