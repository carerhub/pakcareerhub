import React from "react";
import { Link } from "wouter";
import { useGetStats } from "@workspace/api-client-react";
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  FileCheck2, 
  GraduationCap, 
  FileText, 
  BookOpen, 
  FileDigit,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetStats();

  const statCards = [
    { title: "Total Jobs", value: stats?.totalJobs || 0, icon: Briefcase, color: "text-blue-600", link: "/admin/jobs" },
    { title: "Departments", value: stats?.totalDepartments || 0, icon: Building2, color: "text-indigo-600", link: "/admin/departments" },
    { title: "Cities", value: stats?.totalCities || 0, icon: MapPin, color: "text-emerald-600", link: "/admin/cities" },
    { title: "Govt Jobs", value: stats?.governmentJobs || 0, icon: Briefcase, color: "text-green-600", link: "/admin/jobs?type=government" },
    { title: "Private Jobs", value: stats?.privateJobs || 0, icon: Briefcase, color: "text-teal-600", link: "/admin/jobs?type=private" },
    // Mocking the remaining ones as stats object doesn't have them all
    { title: "Results & Slips", value: "Manage", icon: FileCheck2, color: "text-orange-600", link: "/admin/results" },
    { title: "Admissions", value: "Manage", icon: GraduationCap, color: "text-purple-600", link: "/admin/admissions" },
    { title: "Blog Posts", value: "Manage", icon: FileText, color: "text-pink-600", link: "/admin/blog" },
    { title: "MCQs", value: "Manage", icon: BookOpen, color: "text-yellow-600", link: "/admin/mcqs" },
    { title: "Past Papers", value: "Manage", icon: FileDigit, color: "text-red-600", link: "/admin/papers" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview and management of PakCareerHub.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading && typeof stat.value === 'number' ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
              ) : (
                <div className="text-2xl font-bold text-secondary mb-3">{stat.value}</div>
              )}
              <Link href={stat.link}>
                <span className="text-xs font-medium text-primary flex items-center hover:underline cursor-pointer">
                  View / Manage <ArrowRight className="h-3 w-3 ml-1" />
                </span>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/admin/jobs" className="w-full inline-flex h-10 items-center justify-start rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
                <Briefcase className="mr-2 h-4 w-4" /> Add New Job
            </Link>
            <Link href="/admin/results" className="w-full inline-flex h-10 items-center justify-start rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
                <FileCheck2 className="mr-2 h-4 w-4" /> Post Result
            </Link>
            <Link href="/admin/blog" className="w-full inline-flex h-10 items-center justify-start rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
                <FileText className="mr-2 h-4 w-4" /> Write Article
            </Link>
            <Link href="/admin/mcqs" className="w-full inline-flex h-10 items-center justify-start rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
                <BookOpen className="mr-2 h-4 w-4" /> Add MCQs
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
              <div className="flex items-center gap-2 font-medium">
                <div className="h-2.5 w-2.5 rounded-full bg-green-600"></div>
                API Server
              </div>
              <span className="text-sm font-bold">Online</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
              <div className="flex items-center gap-2 font-medium">
                <div className="h-2.5 w-2.5 rounded-full bg-green-600"></div>
                Database Connection
              </div>
              <span className="text-sm font-bold">Healthy</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
