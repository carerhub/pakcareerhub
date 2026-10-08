import React, { useState } from "react";
import { useLocation } from "wouter";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  useListJobs,
  useListDepartments,
  useListCities,
  useListCategories
} from "@workspace/api-client-react";
import { ListJobsType } from "@workspace/api-client-react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Jobs({ type }: { type?: "government" | "private" | "all" }) {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [jobType, setJobType] = useState<ListJobsType>(type as ListJobsType || "all");
  const [cityId, setCityId] = useState<number | null>(searchParams.get("cityId") ? Number(searchParams.get("cityId")) : null);
  const [departmentId, setDepartmentId] = useState<number | null>(searchParams.get("departmentId") ? Number(searchParams.get("departmentId")) : null);
  const [categoryId, setCategoryId] = useState<number | null>(searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : null);

  const { data: jobsRes, isLoading } = useListJobs({
    type: jobType,
    search: search || undefined,
    cityId: cityId,
    departmentId: departmentId,
    categoryId: categoryId,
    limit: 20
  });

  const { data: departments } = useListDepartments();
  const { data: cities } = useListCities();
  const { data: categories } = useListCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query automatically re-runs because state variables changed
  };

  const clearFilters = () => {
    setSearch("");
    if (!type) setJobType("all");
    setCityId(null);
    setDepartmentId(null);
    setCategoryId(null);
  };

  const titleMap = {
    government: "Government Jobs in Pakistan",
    private: "Private Jobs in Pakistan",
    all: "All Latest Jobs in Pakistan"
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col md:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="bg-white rounded-xl border p-5 shadow-sm sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </h3>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-8 text-muted-foreground">Clear All</Button>
          </div>

          <div className="space-y-5">
            {!type && (
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select value={jobType} onValueChange={(val) => setJobType(val as ListJobsType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Jobs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    <SelectItem value="government">Government Jobs</SelectItem>
                    <SelectItem value="private">Private Sector</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>City</Label>
              <Select value={cityId?.toString() || "all"} onValueChange={(val) => setCityId(val === "all" ? null : Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities?.map(city => (
                    <SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={departmentId?.toString() || "all"} onValueChange={(val) => setDepartmentId(val === "all" ? null : Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map(dept => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId?.toString() || "all"} onValueChange={(val) => setCategoryId(val === "all" ? null : Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2">
            {titleMap[type || "all"]}
          </h1>
          <p className="text-muted-foreground">
            Showing {jobsRes?.total || 0} results based on your criteria.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by job title, organization, or keyword..." 
              className="pl-10 h-12 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="h-12 px-6">Search</Button>
        </form>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-muted animate-pulse"></div>
            ))}
          </div>
        ) : jobsRes?.jobs?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <SlidersHorizontal className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search criteria or clear filters.</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {jobsRes?.jobs?.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
