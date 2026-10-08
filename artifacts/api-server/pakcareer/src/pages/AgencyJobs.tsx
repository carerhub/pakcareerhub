import React from "react";
import { Link } from "wouter";
import { useListJobs, useListDepartments } from "@workspace/api-client-react";
import { JobCard } from "@/components/JobCard";
import { Building2, ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface AgencyConfig {
  slug: string;
  name: string;
  fullName: string;
  description: string;
  website?: string;
  color?: string;
  highlights: string[];
}

export const AGENCIES: Record<string, AgencyConfig> = {
  fpsc: {
    slug: "fpsc",
    name: "FPSC",
    fullName: "Federal Public Service Commission",
    description:
      "The Federal Public Service Commission conducts examinations and selects candidates for appointment to posts in connection with the affairs of the Federation.",
    website: "https://www.fpsc.gov.pk",
    color: "bg-blue-700",
    highlights: [
      "CSS Competitive Examination",
      "Departmental Examinations",
      "Direct Recruitment Tests",
      "BS-16 and Above posts",
    ],
  },
  ppsc: {
    slug: "ppsc",
    name: "PPSC",
    fullName: "Punjab Public Service Commission",
    description:
      "The Punjab Public Service Commission is responsible for the recruitment of candidates for various posts in the Government of Punjab.",
    website: "https://www.ppsc.gop.pk",
    color: "bg-green-700",
    highlights: [
      "Provincial Management Service",
      "Punjab Police Service",
      "Education Department",
      "Health Department",
    ],
  },
  nts: {
    slug: "nts",
    name: "NTS",
    fullName: "National Testing Service Pakistan",
    description:
      "NTS is a non-profit public sector organization providing educational, professional and technical testing services throughout Pakistan.",
    website: "https://www.nts.org.pk",
    color: "bg-orange-600",
    highlights: [
      "GAT General & Subject",
      "NAT Test Series",
      "Job Recruitment Tests",
      "Government Agency Tests",
    ],
  },
  pts: {
    slug: "pts",
    name: "PTS",
    fullName: "Pakistan Testing Service",
    description:
      "Pakistan Testing Service (PTS) conducts test and interview for appointment in various Government and Semi-Government organizations.",
    website: "https://www.pts.org.pk",
    color: "bg-red-700",
    highlights: [
      "Government Job Tests",
      "University Admission Tests",
      "Semi-Government Posts",
      "Federal Level Posts",
    ],
  },
  spsc: {
    slug: "spsc",
    name: "SPSC",
    fullName: "Sindh Public Service Commission",
    description:
      "Sindh Public Service Commission handles recruitment for positions in the Government of Sindh through competitive examinations.",
    website: "https://www.spsc.gov.pk",
    color: "bg-teal-700",
    highlights: [
      "Sindh Management Group",
      "Police Service of Sindh",
      "Sindh Education Service",
      "Technical Posts",
    ],
  },
  kppsc: {
    slug: "kppsc",
    name: "KPPSC",
    fullName: "KPK Public Service Commission",
    description:
      "The Khyber Pakhtunkhwa Public Service Commission is an independent Constitutional body that conducts examinations for KPK government posts.",
    website: "https://kppsc.gov.pk",
    color: "bg-indigo-700",
    highlights: [
      "KPK Civil Service",
      "Police Service",
      "Education Department",
      "Health Posts",
    ],
  },
  bpsc: {
    slug: "bpsc",
    name: "BPSC",
    fullName: "Balochistan Public Service Commission",
    description:
      "The Balochistan Public Service Commission is responsible for conducting examinations and selecting candidates for government jobs in Balochistan.",
    website: "https://bpsc.gob.pk",
    color: "bg-purple-700",
    highlights: [
      "BCS Officers",
      "Police Service",
      "Provincial Management",
      "Education Department",
    ],
  },
  ajkpsc: {
    slug: "ajkpsc",
    name: "AJKPSC",
    fullName: "AJK Public Service Commission",
    description:
      "The AJK Public Service Commission conducts examinations and selects candidates for posts in Azad Jammu and Kashmir.",
    color: "bg-pink-700",
    highlights: [
      "AJK Civil Service",
      "Education Posts",
      "Health Department",
      "Technical Posts",
    ],
  },
};

interface AgencyJobsProps {
  agencySlug: string;
}

export default function AgencyJobs({ agencySlug }: AgencyJobsProps) {
  const agency = AGENCIES[agencySlug];
  const { data: departments } = useListDepartments();

  // Match department by name (case-insensitive contains)
  const dept = departments?.find(d =>
    d.name.toLowerCase().includes(agencySlug.toLowerCase()) ||
    d.slug?.toLowerCase() === agencySlug.toLowerCase()
  );

  const { data: jobsRes, isLoading } = useListJobs({
    departmentId: dept?.id,
    limit: 30,
  });

  if (!agency) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-secondary">Agency not found</h2>
        <Link href="/jobs"><Button className="mt-4">Browse All Jobs</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero */}
      <div className={`${agency.color || "bg-secondary"} text-white py-14`}>
        <div className="container mx-auto px-4">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to All Jobs
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl font-black shrink-0">
              {agency.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold">{agency.name}</h1>
                <Badge className="bg-white/20 text-white border-0">{agency.fullName}</Badge>
              </div>
              <p className="text-white/80 max-w-2xl text-sm leading-relaxed">{agency.description}</p>
              {agency.website && (
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-white/70 hover:text-white text-xs underline-offset-2 hover:underline transition-colors"
                >
                  Official Website <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {agency.highlights.map((h, i) => (
            <Card key={i} className="border-primary/10">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-secondary">{h}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Jobs */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary">
            Latest {agency.name} Jobs
          </h2>
          {!isLoading && <Badge variant="outline">{jobsRes?.jobs.length || 0} Active Jobs</Badge>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : jobsRes?.jobs.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-xl">
            <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No active {agency.name} jobs right now.</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon or browse all government jobs.</p>
            <Link href="/jobs/government">
              <Button variant="outline" className="mt-4">Browse Govt Jobs</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobsRes?.jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
