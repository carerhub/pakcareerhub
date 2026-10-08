import React from "react";
import { Link } from "wouter";
import { Job } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Clock, CalendarDays } from "lucide-react";
import { format } from "date-fns";

export function JobCard({ job }: { job: Job }) {
  const isGovt = job.jobType === "government";
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group border-border hover:border-primary/20">
      <CardContent className="p-0">
        <Link href={`/jobs/${job.id}`} className="block p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-4 items-start">
              <div className="h-12 w-12 rounded border bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden">
                {job.logoUrl ? (
                  <img src={job.logoUrl} alt={job.organization} className="h-full w-full object-contain p-1" />
                ) : (
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {job.organization}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{job.cityName || "Multiple Cities"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="capitalize">{job.employmentType.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2">
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span>
                Deadline: {job.deadline ? format(new Date(job.deadline), 'dd MMM yyyy') : 'Not specified'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-border/50">
            <Badge 
              variant="outline" 
              className={isGovt ? "bg-primary/10 text-primary border-primary/20" : "bg-blue-500/10 text-blue-700 border-blue-500/20"}
            >
              {isGovt ? "Government" : "Private"}
            </Badge>
            {job.categoryName && (
              <Badge variant="secondary" className="bg-secondary/5 text-secondary-foreground hover:bg-secondary/10">
                {job.categoryName}
              </Badge>
            )}
            {job.departmentName && isGovt && (
              <Badge variant="outline" className="bg-muted text-muted-foreground truncate max-w-[120px]">
                {job.departmentName}
              </Badge>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
