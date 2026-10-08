import React, { useState } from "react";
import { Link } from "wouter";
import { 
  useListResults,
  getListResultsQueryKey 
} from "@workspace/api-client-react";
import { FileCheck2, Search, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function Results() {
  const [search, setSearch] = useState("");
  
  const { data: results, isLoading } = useListResults({
    type: "result",
    search: search || undefined,
    limit: 50
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <FileCheck2 className="h-8 w-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
          Latest Results & Merit Lists
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find latest results for FPSC, PPSC, NTS, PTS, university exams, and other government recruitment tests across Pakistan.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm mb-8 flex gap-2 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search organization or exam name..." 
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
                <div className="w-16 h-16 bg-muted rounded-lg shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : results?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No results found matching your search.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {results?.map(result => (
              <div key={result.id} className="p-5 md:p-6 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 text-sm font-medium text-primary">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(result.publishedAt), 'dd MMM yyyy')}
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-1 group-hover:text-primary transition-colors">
                    {result.title}
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium">
                    {result.organization}
                  </p>
                </div>
                {result.fileUrl && (
                  <div className="shrink-0">
                    <a href={result.fileUrl} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="w-full md:w-auto hover:bg-primary hover:text-primary-foreground hover:border-primary">
                        <Download className="mr-2 h-4 w-4" /> View Result
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
