import React from "react";
import { Link, useLocation } from "wouter";
import { Search, MapPin, Building2, BriefcaseBusiness, FileText, ChevronRight, GraduationCap, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobCard } from "@/components/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { 
  useGetStats,
  useListJobs,
  useListDepartments,
  useListCities,
  useListCategories,
  useListResults,
  useListAdmissions,
  useListBlogPosts
} from "@workspace/api-client-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: stats } = useGetStats();
  const { data: govtJobsRes } = useListJobs({ type: "government", limit: 6 });
  const { data: privateJobsRes } = useListJobs({ type: "private", limit: 6 });
  const { data: departments } = useListDepartments();
  const { data: cities } = useListCities();
  const { data: categories } = useListCategories();
  const { data: resultsRes } = useListResults({ type: "result", limit: 5 });
  const { data: slipsRes } = useListResults({ type: "roll_no_slip", limit: 5 });
  const { data: admissionsRes } = useListAdmissions({ limit: 4 });
  const { data: blogRes } = useListBlogPosts({ limit: 3 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/jobs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-secondary text-white pt-16 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 opacity-20 pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <Badge className="bg-primary/20 text-primary-foreground hover:bg-primary/30 border-primary/30 mb-6 py-1.5 px-4 text-sm font-medium">
            Pakistan's Premier Job Portal
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Find Your Next Career Move <br className="hidden md:block" /> in Government or Private Sector
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            The most trusted destination for FPSC, PPSC, NTS, and top private company jobs across Pakistan. Updated daily.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex flex-col md:flex-row gap-2 bg-white p-2 rounded-xl shadow-xl">
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Job title, keywords, or department..." 
                className="h-12 md:h-14 pl-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground text-base bg-transparent shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[1px] h-[1px] md:h-8 bg-border my-auto"></div>
            <div className="flex-1 relative flex items-center hidden sm:flex">
              <MapPin className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="City or province..." 
                className="h-12 md:h-14 pl-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground text-base bg-transparent shadow-none"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 md:h-14 px-8 text-base font-bold shrink-0 rounded-lg">
              Search Jobs
            </Button>
          </form>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto border-t border-white/10 pt-8">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-white mb-1">{stats.totalJobs.toLocaleString()}+</div>
                <div className="text-sm text-white/70 font-medium uppercase tracking-wider">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-white mb-1">{stats.totalDepartments.toLocaleString()}</div>
                <div className="text-sm text-white/70 font-medium uppercase tracking-wider">Departments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-white mb-1">{stats.totalCities.toLocaleString()}</div>
                <div className="text-sm text-white/70 font-medium uppercase tracking-wider">Cities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-white mb-1">{stats.totalCompanies.toLocaleString()}</div>
                <div className="text-sm text-white/70 font-medium uppercase tracking-wider">Companies</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Latest Government Jobs */}
      <section className="py-16 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Official Notifications</h2>
              </div>
              <h3 className="text-3xl font-bold text-secondary">Latest Government Jobs</h3>
            </div>
            <Link href="/jobs/government" className="hidden md:inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground">
              View All Govt Jobs
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {govtJobsRes?.jobs?.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
            {!govtJobsRes && Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-[200px] rounded-xl bg-muted animate-pulse"></div>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/jobs/government" className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground">
              View All Govt Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Department */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-3xl font-bold text-secondary mb-4">Browse by Department</h3>
            <p className="text-muted-foreground">Find the most sought-after federal and provincial government positions across Pakistan.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {departments?.slice(0, 12).map(dept => (
              <Link key={dept.id} href={`/jobs?departmentId=${dept.id}`}>
                <Card className="hover:border-primary/50 hover:shadow-sm transition-all group cursor-pointer h-full text-center p-6 flex flex-col items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-muted/50 mb-3 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    {dept.iconUrl ? (
                      <img src={dept.iconUrl} alt={dept.name} className="h-6 w-6" />
                    ) : (
                      <Building2 className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <h4 className="font-semibold text-sm leading-tight text-secondary group-hover:text-primary transition-colors">{dept.name}</h4>
                  <span className="text-xs text-muted-foreground mt-1">{dept.jobCount} Jobs</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Private Jobs */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600">Corporate Sector</h2>
              </div>
              <h3 className="text-3xl font-bold text-secondary">Latest Private Jobs</h3>
            </div>
            <Link href="/jobs/private" className="hidden md:inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground">
              View All Private Jobs
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {privateJobsRes?.jobs?.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/jobs/private" className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground">
              View All Private Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Three Columns: Results, Roll No Slips, Admissions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Results */}
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-primary" />
                  Latest Results
                </h3>
                <Link href="/results" className="text-sm text-primary font-medium hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {resultsRes?.map(result => (
                  <Link key={result.id} href={`/results`} className="block group">
                    <div className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                      {result.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                      <span>{result.organization}</span>
                      <span>{new Date(result.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Roll No Slips */}
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Roll No Slips
                </h3>
                <Link href="/roll-no-slips" className="text-sm text-primary font-medium hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {slipsRes?.map(slip => (
                  <Link key={slip.id} href={`/roll-no-slips`} className="block group">
                    <div className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                      {slip.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                      <span>{slip.organization}</span>
                      <span>{new Date(slip.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Admissions */}
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Admissions
                </h3>
                <Link href="/admissions" className="text-sm text-primary font-medium hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {admissionsRes?.map(admission => (
                  <Link key={admission.id} href={`/admissions`} className="block group">
                    <div className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                      {admission.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                      <span>{admission.institution}</span>
                      {admission.deadline && (
                        <span className="text-red-600 font-medium">Due: {new Date(admission.deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe Banner */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h3 className="text-3xl font-bold mb-4">Never Miss a Job Update</h3>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Subscribe to our newsletter to receive the latest government and private jobs, results, and roll no slips directly in your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <Input 
              type="email" 
              placeholder="Enter your email address" 
              className="h-12 bg-white text-secondary border-0 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-0 focus-visible:ring-offset-primary"
              required
            />
            <Button size="lg" variant="secondary" className="h-12 shrink-0 font-bold">
              Subscribe Now
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
