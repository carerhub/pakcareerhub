import React from "react";
import { FileText } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing and using PakCareerHub, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.",
  },
  {
    title: "2. Use of Services",
    content: "You agree to use our services only for lawful purposes and in a manner that does not infringe on the rights of others. You must not misuse our services or interfere with their normal operation.",
  },
  {
    title: "3. Job Listings",
    content: "PakCareerHub acts as a platform connecting job seekers with employers. We do not guarantee the accuracy or completeness of job listings. Always verify job information directly with the employer or relevant government authority.",
  },
  {
    title: "4. Account Registration",
    content: "If you create an account on our platform, you are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.",
  },
  {
    title: "5. Intellectual Property",
    content: "All content on PakCareerHub, including text, graphics, logos, and images, is the property of PakCareerHub or its content suppliers and is protected by Pakistani and international copyright laws.",
  },
  {
    title: "6. Disclaimer of Warranties",
    content: "Our services are provided 'as is' without any warranties, express or implied. We do not warrant that our services will be uninterrupted, error-free, or free of viruses or other harmful components.",
  },
  {
    title: "7. Limitation of Liability",
    content: "PakCareerHub shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use our services.",
  },
  {
    title: "8. External Links",
    content: "Our website may contain links to external websites. PakCareerHub is not responsible for the content or privacy practices of these external sites.",
  },
  {
    title: "9. Modifications",
    content: "We reserve the right to modify these terms at any time. Continued use of our services after any changes constitutes your acceptance of the new terms.",
  },
  {
    title: "10. Governing Law",
    content: "These terms shall be governed by and construed in accordance with the laws of Pakistan. Any disputes shall be subject to the exclusive jurisdiction of the courts of Pakistan.",
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-extrabold mb-3">Terms of Service</h1>
          <p className="text-white/80">Last updated: January 2025</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-2xl border shadow-sm p-8 md:p-12">
            <p className="text-muted-foreground mb-10 leading-relaxed">
              Please read these Terms of Service carefully before using PakCareerHub. These terms govern your
              access to and use of our website and services.
            </p>
            <div className="space-y-8">
              {sections.map((section, i) => (
                <div key={i}>
                  <h2 className="text-lg font-bold text-secondary mb-3">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
