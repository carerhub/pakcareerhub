import React, { useState } from "react";
import { 
  useListResults, useDeleteResult, useCreateResult, useUpdateResult 
} from "@workspace/api-client-react";
import { Result, ResultInput } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListResultsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AdminResults() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: list, isLoading } = useListResults({ limit: 100 });
  const del = useDeleteResult();
  const create = useCreateResult();
  const update = useUpdateResult();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Result | null>(null);
  const [formData, setFormData] = useState<Partial<ResultInput>>({ title: "", organization: "", type: "result", publishedAt: new Date().toISOString() });

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure?")) {
      try {
        await del.mutateAsync({ id });
        toast({ title: "Deleted successfully" });
        queryClient.invalidateQueries({ queryKey: getListResultsQueryKey() });
      } catch (e) { toast({ title: "Failed to delete", variant: "destructive" }); }
    }
  };

  const openAdd = () => { setEditing(null); setFormData({ title: "", organization: "", type: "result", publishedAt: new Date().toISOString() }); setIsModalOpen(true); };
  const openEdit = (item: Result) => { setEditing(item); setFormData({ title: item.title, organization: item.organization, type: item.type, publishedAt: item.publishedAt, description: item.description || "", fileUrl: item.fileUrl || "" }); setIsModalOpen(true); };

  const handleSave = async (): Promise<void> => {
    try {
      if (!formData.title || !formData.organization) { toast({ title: "Required fields missing", variant: "destructive" }); return; }
      if (editing) await update.mutateAsync({ id: editing.id, data: formData as any });
      else await create.mutateAsync({ data: formData as ResultInput });
      toast({ title: "Saved successfully" });
      queryClient.invalidateQueries({ queryKey: getListResultsQueryKey() });
      setIsModalOpen(false);
    } catch (e) { toast({ title: "Failed to save", variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">Manage Results & Slips</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Record</Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Organization</TableHead><TableHead>Type</TableHead><TableHead>Published</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow> : list?.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-secondary">{item.title}</TableCell>
                <TableCell>{item.organization}</TableCell>
                <TableCell><Badge variant="outline">{item.type.replace('_', ' ')}</Badge></TableCell>
                <TableCell>{format(new Date(item.publishedAt), 'dd MMM yyyy')}</TableCell>
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
            <Input placeholder="Organization" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} />
            <Select value={formData.type} onValueChange={(val: any) => setFormData({...formData, type: val})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="result">Result</SelectItem>
                <SelectItem value="roll_no_slip">Roll No Slip</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="File URL" value={formData.fileUrl || ''} onChange={e => setFormData({...formData, fileUrl: e.target.value})} />
            <Input type="date" value={formData.publishedAt ? formData.publishedAt.substring(0,10) : ''} onChange={e => setFormData({...formData, publishedAt: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString()})} />
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