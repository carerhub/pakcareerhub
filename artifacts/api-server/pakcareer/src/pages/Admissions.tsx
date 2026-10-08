import React from "react";
import { Link } from "wouter";
import { useListAdmissions } from "@workspace/api-client-react";
import { GraduationCap, MapPin, CalendarDays, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Admissions() {
  const { data: admissions, isLoading } = useListAdmissions({ limit: 50 });
  const filtered = admissions?.filter(a => !a.isScholarship);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
          Latest Admissions
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Stay updated with admission announcements from top universities and colleges across Pakistan.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No admissions available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered?.map(admission => (
            <Card key={admission.id} className="hover:shadow-md transition-shadow group border-border">
              <CardContent className="p-6">
                <div className="flex gap-4 items-start mb-4">
                  <div className="h-14 w-14 rounded-lg border bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden">
                    {admission.logoUrl ? (
                      <img src={admission.logoUrl} alt={admission.institution} className="h-full w-full object-contain p-1" />
                    ) : (
                      <GraduationCap className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors text-secondary mb-1">
                        {admission.title}
                      </h3>
                      {admission.deadline && new Date(admission.deadline) < new Date() ? (
                        <Badge variant="destructive" className="shrink-0">Closed</Badge>
                      ) : (
                        <Badge className="bg-green-600 shrink-0">Open</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mt-2">
                      <MapPin className="h-4 w-4" /> {admission.institution}
                    </p>
                  </div>
                </div>

                {admission.description && (
                  <p className="text-sm text-foreground/80 mb-6 line-clamp-2">
                    {admission.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {admission.deadline ? `Deadline: ${format(new Date(admission.deadline), 'dd MMM yyyy')}` : 'No deadline'}
                  </div>
                  {admission.applyUrl && (
                    <a href={admission.applyUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="font-semibold">
                        Details <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
