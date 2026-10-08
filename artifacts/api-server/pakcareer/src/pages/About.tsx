import React from "react";
import { useListSettings } from "@workspace/api-client-react";
import { Shield, Users, Briefcase, Award, Heart } from "lucide-react";

export default function About() {
  const { data: settings } = useListSettings();
  const s = (key: string, fallback = "") =>
    settings?.find(x => x.key === key)?.value || fallback;

  const stats = [
    { icon: Briefcase, label: "Jobs Listed", value: "10,000+" },
    { icon: Users, label: "Job Seekers", value: "500K+" },
    { icon: Award, label: "Departments", value: "100+" },
    { icon: Heart, label: "Success Stories", value: "50K+" },
  ];

  const team = [
    { name: "Editorial Team", role: "Content & Job Verification" },
    { name: "Tech Team", role: "Platform Development" },
    { name: "Support Team", role: "User Assistance" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            {s("aboutTitle", "About PakCareerHub")}
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Pakistan's most trusted platform for job seekers and employers.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          {s("aboutContent") ? (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: s("aboutContent") }}
            />
          ) : (
            <div className="prose prose-lg max-w-none">
              <p>
                PakCareerHub is Pakistan's most trusted job portal, dedicated to connecting job seekers with top employers across the government and private sectors.
              </p>
              <p>
                We provide daily updates on the latest job vacancies, exam results, roll number slips, admissions, and much more — all in one place.
              </p>
              <p>
                Our mission is to empower Pakistani professionals by providing them with timely, accurate, and comprehensive career information. Whether you're a fresh graduate looking for your first job or an experienced professional seeking growth, PakCareerHub is your trusted companion.
              </p>
              <h2>What We Offer</h2>
              <ul>
                <li>Latest Government & Private Job Vacancies</li>
                <li>Exam Results & Roll Number Slips</li>
                <li>University Admissions & Scholarships</li>
                <li>Online MCQ Practice Tests</li>
                <li>Past Papers for CSS, PMS, NTS & More</li>
                <li>Career Blog with Expert Tips</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-xl p-6 text-center shadow-sm border">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-secondary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-secondary mb-4">Our Values</h2>
          <p className="text-muted-foreground mb-12">The principles that guide everything we do.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Accuracy", desc: "Every job listing is verified before being published on our platform." },
              { icon: Heart, title: "Commitment", desc: "We are committed to helping every Pakistani find their dream career." },
              { icon: Users, title: "Inclusivity", desc: "We serve all Pakistanis — from all provinces, backgrounds, and fields." },
            ].map((v, i) => (
              <div key={i} className="text-center">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <v.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-secondary mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
