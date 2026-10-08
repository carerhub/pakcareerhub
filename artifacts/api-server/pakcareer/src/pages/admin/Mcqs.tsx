import React, { useState } from "react";
import { 
  useListMcqs, useDeleteMcq, useCreateMcq, useUpdateMcq 
} from "@workspace/api-client-react";
import { Mcq, McqInput } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListMcqsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminMcqs() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: list, isLoading } = useListMcqs({ limit: 100 });
  const del = useDeleteMcq();
  const create = useCreateMcq();
  const update = useUpdateMcq();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Mcq | null>(null);
  const [formData, setFormData] = useState<Partial<McqInput>>({ 
    question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", category: "General", difficulty: "medium" 
  });

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure?")) {
      try {
        await del.mutateAsync({ id });
        toast({ title: "Deleted successfully" });
        queryClient.invalidateQueries({ queryKey: getListMcqsQueryKey() });
      } catch (e) { toast({ title: "Failed to delete", variant: "destructive" }); }
    }
  };

  const openAdd = () => { setEditing(null); setFormData({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", category: "General", difficulty: "medium" }); setIsModalOpen(true); };
  const openEdit = (item: Mcq) => { setEditing(item); setFormData({ question: item.question, optionA: item.optionA, optionB: item.optionB, optionC: item.optionC, optionD: item.optionD, correctAnswer: item.correctAnswer, category: item.category, difficulty: item.difficulty, explanation: item.explanation || "" }); setIsModalOpen(true); };

  const handleSave = async (): Promise<void> => {
    try {
      if (!formData.question || !formData.optionA) { toast({ title: "Required fields missing", variant: "destructive" }); return; }
      if (editing) await update.mutateAsync({ id: editing.id, data: formData as any });
      else await create.mutateAsync({ data: formData as McqInput });
      toast({ title: "Saved successfully" });
      queryClient.invalidateQueries({ queryKey: getListMcqsQueryKey() });
      setIsModalOpen(false);
    } catch (e) { toast({ title: "Failed to save", variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">Manage MCQs</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add MCQ</Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Question</TableHead><TableHead>Category</TableHead><TableHead>Ans</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow> : list?.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-secondary truncate max-w-xs">{item.question}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell><Badge>{item.correctAnswer}</Badge></TableCell>
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
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit MCQ" : "Add MCQ"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Question" value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Option A" value={formData.optionA} onChange={e => setFormData({...formData, optionA: e.target.value})} />
              <Input placeholder="Option B" value={formData.optionB} onChange={e => setFormData({...formData, optionB: e.target.value})} />
              <Input placeholder="Option C" value={formData.optionC} onChange={e => setFormData({...formData, optionC: e.target.value})} />
              <Input placeholder="Option D" value={formData.optionD} onChange={e => setFormData({...formData, optionD: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select value={formData.correctAnswer} onValueChange={(val: any) => setFormData({...formData, correctAnswer: val})}>
                <SelectTrigger><SelectValue placeholder="Correct Answer" /></SelectTrigger>
                <SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem><SelectItem value="D">D</SelectItem></SelectContent>
              </Select>
              <Select value={formData.difficulty} onValueChange={(val: any) => setFormData({...formData, difficulty: val})}>
                <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
              </Select>
            </div>
            <Input placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
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