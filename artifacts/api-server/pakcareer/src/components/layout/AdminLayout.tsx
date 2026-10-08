import React from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Briefcase, Building2, MapPin, Tags,
  FileCheck2, GraduationCap, FileText, BookOpen, FileDigit,
  Settings, LogOut, Menu, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/departments", label: "Departments", icon: Building2 },
  { href: "/admin/cities", label: "Cities", icon: MapPin },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/results", label: "Results & Slips", icon: FileCheck2 },
  { href: "/admin/admissions", label: "Admissions", icon: GraduationCap },
  { href: "/admin/blog", label: "Blog Posts", icon: FileText },
  { href: "/admin/mcqs", label: "MCQs", icon: BookOpen },
  { href: "/admin/papers", label: "Past Papers", icon: FileDigit },
  { href: "/admin/settings", label: "Settings & SEO", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-[100dvh] flex bg-gray-50/50">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-sidebar border-r z-50">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border bg-sidebar-primary/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-sidebar-primary rounded flex items-center justify-center text-sidebar-primary-foreground font-bold text-xl">
              P
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">
              Admin Panel
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || (link.href !== "/admin" && location.startsWith(link.href));
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-sidebar-border space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors"
          >
            <Globe className="h-4 w-4" />
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-[100dvh]">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4 md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold text-secondary">Admin Panel</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-sm font-medium text-muted-foreground hidden sm:block">
              pakcareerhub@gmail.com
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              A
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
