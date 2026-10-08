import React, { useState } from "react";
import { useListSettings } from "@workspace/api-client-react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { data: settings } = useListSettings();
  const { toast } = useToast();
  const s = (key: string, fallback = "") =>
    settings?.find(x => x.key === key)?.value || fallback;

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real implementation, send to backend
    setSent(true);
    toast({ title: "Message sent! We'll get back to you soon." });
  };

  const contactItems = [
    { icon: Mail, label: "Email Us", value: s("contactEmail", "info@pakcareerhub.com"), href: `mailto:${s("contactEmail", "info@pakcareerhub.com")}` },
    { icon: Phone, label: "Call Us", value: s("contactPhone", "+92 300 0000000"), href: `tel:${s("contactPhone")}` },
    { icon: MapPin, label: "Our Office", value: s("contactAddress", "Lahore, Punjab, Pakistan"), href: null },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-extrabold mb-3">Contact Us</h1>
          <p className="text-white/80">
            Have a question or want to advertise? We're here to help.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-secondary mb-6">Get in Touch</h2>
              {contactItems.map((item, i) => (
                <Card key={i} className="border-border shadow-sm">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">{item.label}</div>
                      {item.href ? (
                        <a href={item.href} className="font-medium text-secondary hover:text-primary transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <span className="font-medium text-secondary">{item.value}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-primary/20 bg-primary/5 mt-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-secondary mb-2">Advertise With Us</h3>
                  <p className="text-sm text-muted-foreground">
                    Reach thousands of qualified job seekers. Contact us for advertising packages and bulk job posting discounts.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border shadow-sm p-8">
                <h2 className="text-xl font-bold text-secondary mb-6">Send a Message</h2>
                {sent ? (
                  <div className="text-center py-10">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-secondary mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">Thank you for reaching out. We'll respond within 24 hours.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setSent(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Your Name</Label>
                        <Input
                          value={form.name}
                          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="you@email.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input
                        value={form.subject}
                        onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                        placeholder="What's this about?"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        rows={5}
                        value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="Your message..."
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Send className="h-4 w-4 mr-2" /> Send Message
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
