import React, { useState } from "react";
import { 
  useListPapers, useDeletePaper, useCreatePaper, useUpdatePaper 
} from "@workspace/api-client-react";
import { Paper, PaperInput } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListPapersQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPapers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: list, isLoading } = useListPapers({ limit: 100 });
  const del = useDeletePaper();
  const create = useCreatePaper();
  const update = useUpdatePaper();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Paper | null>(null);
  const [formData, setFormData] = useState<Partial<PaperInput>>({ title: "", organization: "", subject: "", category: "General", year: new Date().getFullYear() });

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure?")) {
      try {
        await del.mutateAsync({ id });
        toast({ title: "Deleted successfully" });
        queryClient.invalidateQueries({ queryKey: getListPapersQueryKey() });
      } catch (e) { toast({ title: "Failed to delete", variant: "destructive" }); }
    }
  };

  const openAdd = () => { setEditing(null); setFormData({ title: "", organization: "", subject: "", category: "General", year: new Date().getFullYear() }); setIsModalOpen(true); };
  const openEdit = (item: Paper) => { setEditing(item); setFormData({ title: item.title, organization: item.organization, subject: item.subject, category: item.category, year: item.year || undefined, fileUrl: item.fileUrl || "" }); setIsModalOpen(true); };

  const handleSave = async (): Promise<void> => {
    try {
      if (!formData.title || !formData.organization || !formData.subject) { toast({ title: "Required fields missing", variant: "destructive" }); return; }
      if (editing) await update.mutateAsync({ id: editing.id, data: formData as any });
      else await create.mutateAsync({ data: formData as PaperInput });
      toast({ title: "Saved successfully" });
      queryClient.invalidateQueries({ queryKey: getListPapersQueryKey() });
      setIsModalOpen(false);
    } catch (e) { toast({ title: "Failed to save", variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">Manage Past Papers</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Paper</Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Org/Subject</TableHead><TableHead>Year</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow> : list?.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-secondary">{item.title}</TableCell>
                <TableCell>{item.organization} - {item.subject}</TableCell>
                <TableCell>{item.year}</TableCell>
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
          <DialogHeader><DialogTitle>{editing ? "Edit Paper" : "Add Paper"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 grid grid-cols-2 gap-4">
            <div className="col-span-2"><Input placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
            <div className="col-span-1"><Input placeholder="Organization" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} /></div>
            <div className="col-span-1"><Input placeholder="Subject" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} /></div>
            <div className="col-span-1"><Input placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
            <div className="col-span-1"><Input type="number" placeholder="Year" value={formData.year || ''} onChange={e => setFormData({...formData, year: Number(e.target.value)})} /></div>
            <div className="col-span-2"><Input placeholder="File URL" value={formData.fileUrl || ''} onChange={e => setFormData({...formData, fileUrl: e.target.value})} /></div>
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