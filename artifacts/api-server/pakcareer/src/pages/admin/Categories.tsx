import React, { useState } from "react";
import { 
  useListCategories, useDeleteCategory, useCreateCategory, useUpdateCategory 
} from "@workspace/api-client-react";
import { Category, CategoryInput } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: list, isLoading } = useListCategories();
  const del = useDeleteCategory();
  const create = useCreateCategory();
  const update = useUpdateCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<CategoryInput>>({ name: "", slug: "", iconUrl: "" });

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure?")) {
      try {
        await del.mutateAsync({ id });
        toast({ title: "Deleted successfully" });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      } catch (e) { toast({ title: "Failed to delete", variant: "destructive" }); }
    }
  };

  const openAdd = () => { setEditing(null); setFormData({ name: "", slug: "", iconUrl: "" }); setIsModalOpen(true); };
  const openEdit = (item: Category) => { setEditing(item); setFormData({ name: item.name, slug: item.slug, iconUrl: item.iconUrl || "" }); setIsModalOpen(true); };

  const handleSave = async (): Promise<void> => {
    try {
      if (!formData.name || !formData.slug) { toast({ title: "Required fields missing", variant: "destructive" }); return; }
      if (editing) await update.mutateAsync({ id: editing.id, data: formData as any });
      else await create.mutateAsync({ data: formData as CategoryInput });
      toast({ title: "Saved successfully" });
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      setIsModalOpen(false);
    } catch (e) { toast({ title: "Failed to save", variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">Manage Categories</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Jobs</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow> : list?.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-secondary">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.slug}</TableCell>
                <TableCell>{item.jobCount}</TableCell>
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
            <Input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <Input placeholder="Slug" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
            <Input placeholder="Icon URL" value={formData.iconUrl} onChange={e => setFormData({...formData, iconUrl: e.target.value})} />
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