import React from "react";
import { Link } from "wouter";
import { useGetBlogPost, getGetBlogPostQueryKey } from "@workspace/api-client-react";
import { Calendar, User, ChevronLeft, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function BlogPostDetail({ id }: { id: string }) {
  const postId = Number(id);
  const { data: post, isLoading, isError } = useGetBlogPost(postId, {
    query: {
      enabled: !!postId,
      queryKey: getGetBlogPostQueryKey(postId)
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl animate-pulse">
        <div className="h-8 w-24 bg-muted mb-8 rounded"></div>
        <div className="h-10 bg-muted mb-4 rounded w-3/4"></div>
        <div className="h-6 bg-muted mb-8 rounded w-1/2"></div>
        <div className="h-96 bg-muted rounded-xl mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-xl">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
        <p className="text-muted-foreground mb-6">The blog post you are looking for does not exist or has been removed.</p>
        <Link href="/blog" className="text-primary font-medium hover:underline">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/blog" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Blog
      </Link>

      <div className="mb-10 text-center">
        <Badge variant="outline" className="mb-6 bg-primary/5 text-primary border-primary/20 text-sm py-1.5 px-4">
          {post.category}
        </Badge>
        <h1 className="text-3xl md:text-5xl font-extrabold text-secondary mb-6 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center justify-center gap-6 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {post.author}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(new Date(post.publishedAt), 'MMMM dd, yyyy')}
          </div>
        </div>
      </div>

      {post.imageUrl && (
        <div className="w-full h-[300px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-sm border border-border">
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="bg-white p-8 md:p-12 rounded-2xl border shadow-sm">
        {post.excerpt && (
          <p className="text-lg md:text-xl text-muted-foreground font-medium mb-8 leading-relaxed italic border-l-4 border-primary pl-6">
            {post.excerpt}
          </p>
        )}
        <div 
          className="prose prose-lg max-w-none text-foreground/80 prose-headings:text-secondary prose-a:text-primary prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      </div>
    </div>
  );
}
