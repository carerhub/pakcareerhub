import React from "react";
import { Shield } from "lucide-react";

const sections = [
  {
    title: "1. Information We Collect",
    content: "We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us. This may include your name, email address, and job preferences.",
  },
  {
    title: "2. How We Use Your Information",
    content: "We use the information we collect to provide, maintain, and improve our services, send you job alerts and newsletters you have subscribed to, respond to your comments and questions, and monitor and analyze usage patterns.",
  },
  {
    title: "3. Information Sharing",
    content: "We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances: with your consent, to comply with legal obligations, or to protect the rights and safety of PakCareerHub and our users.",
  },
  {
    title: "4. Cookies",
    content: "We use cookies and similar tracking technologies to track activity on our website and to improve our service. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.",
  },
  {
    title: "5. Data Security",
    content: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
  },
  {
    title: "6. Third-Party Links",
    content: "Our website may contain links to third-party websites. We are not responsible for the privacy practices of those websites and encourage you to review their privacy policies.",
  },
  {
    title: "7. Children's Privacy",
    content: "Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13.",
  },
  {
    title: "8. Changes to This Policy",
    content: "We may update this privacy policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the date below.",
  },
  {
    title: "9. Contact Us",
    content: "If you have questions about this privacy policy or our data practices, please contact us at info@pakcareerhub.com.",
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-extrabold mb-3">Privacy Policy</h1>
          <p className="text-white/80">Last updated: January 2025</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-2xl border shadow-sm p-8 md:p-12">
            <p className="text-muted-foreground mb-10 leading-relaxed">
              At PakCareerHub, we take your privacy seriously. This Privacy Policy describes how we collect,
              use, and protect your personal information when you visit our website or use our services.
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
