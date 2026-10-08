import React, { useState } from "react";
import { Link } from "wouter";
import { useListBlogPosts } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";

export default function Blog() {
  const { data: posts, isLoading } = useListBlogPosts({ limit: 20 });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
          Career Advice & News
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Preparation guides, interview tips, and latest educational news across Pakistan.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-80 rounded-xl bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : posts?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No blog posts published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts?.map(post => (
            <Link key={post.id} href={`/blog/${post.id}`} className="group block h-full">
              <Card className="h-full overflow-hidden border-border/60 hover:shadow-lg transition-all hover:-translate-y-1">
                {post.imageUrl ? (
                  <div className="h-48 w-full overflow-hidden bg-muted">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-secondary/5 flex items-center justify-center">
                    <span className="text-secondary/20 font-bold text-4xl">PCH</span>
                  </div>
                )}
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 rounded-md">
                    {post.category}
                  </Badge>
                  <h2 className="text-xl font-bold text-secondary mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-5">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/80 mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      {post.author}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
