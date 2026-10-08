import React, { useState } from "react";
import { Link } from "wouter";
import { useListPapers } from "@workspace/api-client-react";
import { FileDigit, Search, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Papers() {
  const [search, setSearch] = useState("");
  
  const { data: papers, isLoading } = useListPapers({
    search: search || undefined,
    limit: 50
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <FileDigit className="h-8 w-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
          Past Papers PDF
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Download past papers for FPSC, PPSC, CSS, PMS and other competitive exams.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm mb-8 flex gap-2 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by subject, organization or year..." 
            className="pl-10 h-12 border-0 bg-muted/30 focus-visible:ring-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="divide-y">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-6 flex gap-4 animate-pulse">
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : papers?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No past papers found matching your search.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {papers?.map(paper => (
              <div key={paper.id} className="p-5 md:p-6 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 text-sm font-bold text-primary tracking-wider uppercase">
                    {paper.organization} {paper.year ? `(${paper.year})` : ''}
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-1 group-hover:text-primary transition-colors">
                    {paper.title}
                  </h3>
                  <div className="text-muted-foreground text-sm font-medium flex gap-4">
                    <span>Subject: {paper.subject}</span>
                    <span className="hidden sm:inline">&bull;</span>
                    <span className="hidden sm:inline">Category: {paper.category}</span>
                  </div>
                </div>
                {paper.fileUrl && (
                  <div className="shrink-0">
                    <a href={paper.fileUrl} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="w-full md:w-auto hover:bg-primary hover:text-primary-foreground hover:border-primary">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
