import React, { useState } from "react";
import { 
  useListDepartments,
  useDeleteDepartment,
  useCreateDepartment,
  useUpdateDepartment
} from "@workspace/api-client-react";
import { Department, DepartmentInput } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListDepartmentsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDepartments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: departments, isLoading } = useListDepartments();
  const deleteDepartment = useDeleteDepartment();
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [formData, setFormData] = useState<Partial<DepartmentInput>>({ name: "", slug: "", iconUrl: "" });

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartment.mutateAsync({ id });
        toast({ title: "Department deleted successfully" });
        queryClient.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });
      } catch (e) {
        toast({ title: "Failed to delete", variant: "destructive" });
      }
    }
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({ name: "", slug: "", iconUrl: "" });
    setIsModalOpen(true);
  };

  const openEdit = (dept: Department) => {
    setEditing(dept);
    setFormData({ name: dept.name, slug: dept.slug, iconUrl: dept.iconUrl || "" });
    setIsModalOpen(true);
  };

  const handleSave = async (): Promise<void> => {
    try {
      if (!formData.name || !formData.slug) {
        toast({ title: "Name and Slug are required", variant: "destructive" });
        return;
      }

      if (editing) {
        await updateDept.mutateAsync({ id: editing.id, data: formData as any });
      } else {
        await createDept.mutateAsync({ data: formData as DepartmentInput });
      }
      toast({ title: "Saved successfully" });
      queryClient.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });
      setIsModalOpen(false);
    } catch (e) {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">Manage Departments</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Department</Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Total Jobs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : departments?.map(dept => (
              <TableRow key={dept.id}>
                <TableCell>
                  {dept.iconUrl ? <img src={dept.iconUrl} alt="icon" className="h-8 w-8 object-contain" /> : <div className="h-8 w-8 bg-muted rounded"></div>}
                </TableCell>
                <TableCell className="font-medium text-secondary">{dept.name}</TableCell>
                <TableCell className="text-muted-foreground">{dept.slug}</TableCell>
                <TableCell>{dept.jobCount}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => openEdit(dept)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(dept.id)} className="hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Department" : "Add Department"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon URL</label>
              <Input value={formData.iconUrl} onChange={e => setFormData({...formData, iconUrl: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createDept.isPending || updateDept.isPending}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}