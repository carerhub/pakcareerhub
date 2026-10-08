import React from "react";
import { Link } from "wouter";
import { Facebook, Twitter, Linkedin, Youtube, MessageCircle } from "lucide-react";
import { useListSettings } from "@workspace/api-client-react";

export function Footer() {
  const { data: settings } = useListSettings();
  const s = (key: string, fallback = "") =>
    settings?.find(x => x.key === key)?.value || fallback;

  const socialLinks = [
    { key: "facebookUrl", icon: Facebook, label: "Facebook" },
    { key: "twitterUrl", icon: Twitter, label: "Twitter" },
    { key: "linkedinUrl", icon: Linkedin, label: "LinkedIn" },
    { key: "youtubeUrl", icon: Youtube, label: "YouTube" },
  ].filter(l => s(l.key));

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white font-bold text-xl">
                P
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                {s("siteName", "PakCareerHub")}
              </span>
            </Link>
            <p className="text-sm text-secondary-foreground/70 mb-6 leading-relaxed max-w-xs">
              {s("footerTagline", "Pakistan's most trusted job portal. Providing the latest updates on government jobs, private sector vacancies, admissions, and results.")}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map(link => {
                  const Icon = link.icon;
                  const url = s(link.key);
                  return (
                    <a
                      key={link.key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.label}
                      className="h-9 w-9 rounded-lg bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Jobs */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white">Jobs</h3>
            <ul className="space-y-3 text-sm text-secondary-foreground/70">
              <li><Link href="/jobs" className="hover:text-primary transition-colors">All Jobs</Link></li>
              <li><Link href="/jobs/government" className="hover:text-primary transition-colors">Government Jobs</Link></li>
              <li><Link href="/jobs/private" className="hover:text-primary transition-colors">Private Jobs</Link></li>
              <li><Link href="/departments" className="hover:text-primary transition-colors">By Department</Link></li>
              <li><Link href="/cities" className="hover:text-primary transition-colors">By City</Link></li>
            </ul>
          </div>

          {/* Agencies */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white">Top Agencies</h3>
            <ul className="space-y-3 text-sm text-secondary-foreground/70">
              <li><Link href="/jobs/fpsc" className="hover:text-primary transition-colors">FPSC Jobs</Link></li>
              <li><Link href="/jobs/ppsc" className="hover:text-primary transition-colors">PPSC Jobs</Link></li>
              <li><Link href="/jobs/nts" className="hover:text-primary transition-colors">NTS Jobs</Link></li>
              <li><Link href="/jobs/pts" className="hover:text-primary transition-colors">PTS Jobs</Link></li>
              <li><Link href="/jobs/spsc" className="hover:text-primary transition-colors">SPSC Jobs</Link></li>
            </ul>
          </div>

          {/* Resources & Legal */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white">Resources</h3>
            <ul className="space-y-3 text-sm text-secondary-foreground/70">
              <li><Link href="/results" className="hover:text-primary transition-colors">Results</Link></li>
              <li><Link href="/roll-no-slips" className="hover:text-primary transition-colors">Roll No Slips</Link></li>
              <li><Link href="/admissions" className="hover:text-primary transition-colors">Admissions</Link></li>
              <li><Link href="/mcqs" className="hover:text-primary transition-colors">MCQ Practice</Link></li>
              <li><Link href="/papers" className="hover:text-primary transition-colors">Past Papers</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-secondary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary-foreground/50">
            &copy; {new Date().getFullYear()} {s("siteName", "PakCareerHub")}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm text-secondary-foreground/50">
            <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
