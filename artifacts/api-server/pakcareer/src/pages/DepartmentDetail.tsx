import React from "react";
import { Link } from "wouter";
import { useListJobs, useListDepartments } from "@workspace/api-client-react";
import { JobCard } from "@/components/JobCard";
import { Building2, ArrowLeft, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DepartmentDetailProps {
  id: string;
}

export default function DepartmentDetail({ id }: DepartmentDetailProps) {
  const { data: departments } = useListDepartments();
  const dept = departments?.find(d => d.id === Number(id) || d.slug === id);

  const { data: jobsRes, isLoading } = useListJobs({
    departmentId: dept?.id,
    limit: 30,
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to All Jobs
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-white/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white/80" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{dept?.name || "Department Jobs"}</h1>
              <p className="text-white/70 mt-1">
                {dept?.jobCount || jobsRes?.jobs.length || 0} active vacancies
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : jobsRes?.jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary mb-2">No Active Jobs</h2>
            <p className="text-muted-foreground">No current vacancies in this department. Check back soon.</p>
            <Link href="/jobs">
              <Button className="mt-6">Browse All Jobs</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-secondary">
                Latest Jobs {dept ? `in ${dept.name}` : ""}
              </h2>
              <Badge variant="outline">{jobsRes?.jobs.length} Jobs</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobsRes?.jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
