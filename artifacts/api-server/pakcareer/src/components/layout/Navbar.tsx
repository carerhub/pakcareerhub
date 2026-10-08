import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useListSettings } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { href: "/", label: "Home" },
  {
    label: "Jobs",
    children: [
      { href: "/jobs", label: "All Jobs" },
      { href: "/jobs/government", label: "Government Jobs" },
      { href: "/jobs/private", label: "Private Jobs" },
      { href: "/departments", label: "By Department" },
      { href: "/cities", label: "By City" },
    ],
  },
  {
    label: "Agencies",
    children: [
      { href: "/jobs/fpsc", label: "FPSC Jobs" },
      { href: "/jobs/ppsc", label: "PPSC Jobs" },
      { href: "/jobs/nts", label: "NTS Jobs" },
      { href: "/jobs/pts", label: "PTS Jobs" },
      { href: "/jobs/spsc", label: "SPSC Jobs" },
      { href: "/jobs/kppsc", label: "KPPSC Jobs" },
    ],
  },
  { href: "/results", label: "Results" },
  { href: "/roll-no-slips", label: "Roll No Slips" },
  { href: "/admissions", label: "Admissions" },
  { href: "/scholarships", label: "Scholarships" },
  {
    label: "More",
    children: [
      { href: "/blog", label: "Blog" },
      { href: "/mcqs", label: "MCQs" },
      { href: "/papers", label: "Past Papers" },
      { href: "/scholarships", label: "Scholarships" },
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { data: settings } = useListSettings();
  const { isAdmin, isUser, user, logout } = useAuth();

  const siteName = settings?.find(s => s.key === "siteName")?.value || "PakCareerHub";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white font-bold text-xl">
              P
            </div>
            <span className="font-bold text-xl tracking-tight text-secondary">
              {siteName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              if ("children" in link) {
                const isActive = link.children?.some(c => location === c.href || location.startsWith(c.href));
                return (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(link.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      {link.label}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    {activeDropdown === link.label && (
                      <div className="absolute top-full left-0 w-48 bg-white border rounded-xl shadow-lg py-1 z-50">
                        {link.children?.map(child => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block px-4 py-2 text-sm hover:bg-muted transition-colors ${
                              location === child.href ? "text-primary font-medium" : "text-secondary"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location === link.href ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAdmin && <Link href="/admin" className="hidden md:inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">Admin Panel</Link>}
          {isUser ? (
            <button onClick={() => logout()} className="hidden md:inline-flex text-sm text-muted-foreground hover:text-destructive">{user?.name || "Sign out"}</button>
          ) : !isAdmin ? (
            <Link href="/signin" className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-white hover:bg-primary/90">Sign In</Link>
          ) : null}
          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-white px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
          {navLinks.map(link => {
            if ("children" in link) {
              return (
                <div key={link.label}>
                  <div className="px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider mt-3">
                    {link.label}
                  </div>
                  {link.children?.map(child => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                        location === child.href
                          ? "text-primary bg-primary/5 font-medium"
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href!}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 text-sm rounded-md font-medium transition-colors ${
                  location === link.href
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t">
            {isAdmin ? (
              <Link href="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-secondary hover:text-primary">Admin Panel</Link>
            ) : isUser ? (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="block px-3 py-2 text-sm font-medium text-destructive">Sign Out</button>
            ) : (
              <Link href="/signin" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-secondary hover:text-primary">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
