import React, { useState } from "react";
import { 
  useListBlogPosts, useDeleteBlogPost, useCreateBlogPost, useUpdateBlogPost 
} from "@workspace/api-client-react";
import { BlogPost, BlogPostInput } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListBlogPostsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Badge } from "@/components/ui/badge";

export default function AdminBlog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: list, isLoading } = useListBlogPosts({ limit: 100 });
  const del = useDeleteBlogPost();
  const create = useCreateBlogPost();
  const update = useUpdateBlogPost();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<Partial<BlogPostInput>>({
    title: "",
    slug: "",
    category: "General",
    author: "Admin",
    content: "",
    excerpt: "",
    imageUrl: "",
    publishedAt: new Date().toISOString(),
  });

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await del.mutateAsync({ id });
        toast({ title: "Post deleted" });
        queryClient.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
      } catch {
        toast({ title: "Failed to delete", variant: "destructive" });
      }
    }
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({
      title: "",
      slug: "",
      category: "General",
      author: "Admin",
      content: "",
      excerpt: "",
      imageUrl: "",
      publishedAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: BlogPost) => {
    setEditing(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      category: item.category,
      author: item.author,
      content: item.content,
      excerpt: item.excerpt || "",
      imageUrl: item.imageUrl || "",
      publishedAt: item.publishedAt,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (): Promise<void> => {
    try {
      if (!formData.title || !formData.slug) {
        toast({ title: "Title and Slug are required", variant: "destructive" });
        return;
      }
      if (editing) {
        await update.mutateAsync({ id: editing.id, data: formData as any });
      } else {
        await create.mutateAsync({ data: formData as BlogPostInput });
      }
      toast({ title: "Post saved successfully" });
      queryClient.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
      setIsModalOpen(false);
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">Manage Blog Posts</h1>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> Write New Post
        </Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : list?.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-secondary">{item.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.category}</Badge>
                </TableCell>
                <TableCell>{item.author}</TableCell>
                <TableCell>{format(new Date(item.publishedAt), 'dd MMM yyyy')}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => openEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Blog Post" : "Write New Blog Post"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={e => {
                    const title = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      title,
                      slug: editing ? prev.slug : autoSlug(title),
                    }));
                  }}
                  placeholder="Enter post title..."
                />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Slug * (URL path)</label>
                <Input
                  value={formData.slug}
                  onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-friendly-slug"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g. General, Tips, News"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Author</label>
                <Input
                  value={formData.author}
                  onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Author name"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Featured Image URL</label>
                <Input
                  value={formData.imageUrl}
                  onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Excerpt (short summary)</label>
                <Input
                  value={formData.excerpt}
                  onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description shown in blog listing..."
                />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Content *</label>
                <RichTextEditor
                  value={formData.content || ""}
                  onChange={val => setFormData(prev => ({ ...prev, content: val }))}
                  placeholder="Write your blog post content here..."
                  minHeight={300}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? "Saving..." : "Publish Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
