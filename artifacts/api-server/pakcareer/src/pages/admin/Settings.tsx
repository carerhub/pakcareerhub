import React, { useEffect, useState } from "react";
import {
  useListSettings, useUpsertSettings, getListSettingsQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Globe, Layout, Share2, Link } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// All settings keys used by this panel
const DEFAULT_SETTINGS: Record<string, string> = {
  // General
  siteName: "PakCareerHub",
  contactEmail: "info@pakcareerhub.com",
  contactPhone: "+92 300 0000000",
  
  // Hero Content
  heroBadgeText: "Pakistan's Premier Job Portal",
  heroTitle: "Find Your Next Career Move in Government or Private Sector",
  heroSubtitle: "The most trusted destination for FPSC, PPSC, NTS, and top private company jobs across Pakistan. Updated daily.",
  searchPlaceholderJob: "Job title, keywords, or department...",
  searchPlaceholderCity: "City or province...",
  
  // About Section
  footerTagline: "Pakistan's most trusted job portal. Providing the latest updates on government jobs, private sector vacancies, admissions, and results across the country.",
  subscribeBannerTitle: "Never Miss a Job Update",
  subscribeBannerSubtitle: "Subscribe to our newsletter to receive the latest government and private jobs, results, and roll no slips directly in your inbox.",
  
  // SEO - Global
  seoSiteName: "PakCareerHub",
  seoDefaultDescription: "Pakistan's #1 job portal for government and private sector jobs, results, admissions, and more.",
  seoDefaultOgImage: "",
  seoKeywords: "Pakistan jobs, government jobs Pakistan, FPSC jobs, PPSC jobs, NTS jobs, private jobs",
  
  // SEO - Home
  seoHomeMeta: "PakCareerHub – Latest Government & Private Jobs in Pakistan",
  seoHomeDesc: "Find the latest FPSC, PPSC, NTS, and private sector jobs in Pakistan. Updated daily with new vacancies.",
  
  // SEO - Jobs Page
  seoJobsMeta: "All Jobs – PakCareerHub",
  seoJobsDesc: "Browse all government and private sector job vacancies across Pakistan.",
  
  // SEO - Results Page
  seoResultsMeta: "Latest Results & Roll No Slips – PakCareerHub",
  seoResultsDesc: "Check latest exam results and download roll number slips for government jobs in Pakistan.",
  
  // SEO - Blog Page
  seoBlogMeta: "Career Blog & Tips – PakCareerHub",
  seoBlogDesc: "Expert career advice, interview tips, and job search strategies for Pakistan job seekers.",

  // Social Links
  facebookUrl: "",
  twitterUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  whatsappUrl: "",
  
  // About Page
  aboutTitle: "About PakCareerHub",
  aboutContent: "<p>PakCareerHub is Pakistan's most trusted job portal, dedicated to connecting job seekers with top employers across the government and private sectors.</p><p>We provide daily updates on the latest job vacancies, exam results, roll number slips, admissions, and much more — all in one place.</p>",
  
  // Contact Page
  contactAddress: "Lahore, Punjab, Pakistan",
  
  // Pages Meta
  pageAboutMeta: "About Us – PakCareerHub",
  pageContactMeta: "Contact Us – PakCareerHub",
};

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings } = useListSettings();
  const upsertSettings = useUpsertSettings();

  const [formData, setFormData] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      const merged = { ...DEFAULT_SETTINGS };
      settings.forEach(s => { merged[s.key] = s.value; });
      setFormData(merged);
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = Object.entries(formData).map(([key, value]) => ({
        key,
        value,
        label: key,
      }));
      await upsertSettings.mutateAsync({ data: { settings: payload } });
      toast({ title: "Settings saved successfully" });
      queryClient.invalidateQueries({ queryKey: getListSettingsQueryKey() });
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const field = (key: string, label: string, multiline = false, placeholder = "") => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {multiline ? (
        <Textarea
          rows={3}
          value={formData[key] || ""}
          onChange={e => handleChange(key, e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <Input
          value={formData[key] || ""}
          onChange={e => handleChange(key, e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Site Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all content, SEO, and site-wide settings</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      <Tabs defaultValue="content">
        <TabsList className="mb-6">
          <TabsTrigger value="content">
            <Layout className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Globe className="h-4 w-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="h-4 w-4 mr-2" />
            Social
          </TabsTrigger>
          <TabsTrigger value="pages">
            <Link className="h-4 w-4 mr-2" />
            Pages
          </TabsTrigger>
        </TabsList>

        {/* ── CONTENT TAB ── */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Core site identity and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {field("siteName", "Site Name")}
              {field("contactEmail", "Contact Email")}
              {field("contactPhone", "Contact Phone")}
              {field("contactAddress", "Contact Address")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Homepage Hero Section</CardTitle>
              <CardDescription>Edit the main banner text visible to all visitors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {field("heroBadgeText", "Hero Badge Text", false, "e.g. Pakistan's Premier Job Portal")}
              {field("heroTitle", "Hero Main Title", true, "Find Your Next Career Move...")}
              {field("heroSubtitle", "Hero Subtitle", true, "The most trusted destination...")}
              {field("searchPlaceholderJob", "Search Box – Job Placeholder")}
              {field("searchPlaceholderCity", "Search Box – City Placeholder")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscribe / Newsletter Banner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {field("subscribeBannerTitle", "Banner Title")}
              {field("subscribeBannerSubtitle", "Banner Subtitle", true)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Footer Tagline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {field("footerTagline", "Footer Description Text", true)}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SEO TAB ── */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global SEO</CardTitle>
              <CardDescription>Default meta tags used when page-specific ones are not set.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {field("seoSiteName", "Site Name (OG)")}
              {field("seoDefaultDescription", "Default Meta Description", true)}
              {field("seoKeywords", "Global Keywords", false, "Comma-separated keywords")}
              {field("seoDefaultOgImage", "Default OG Image URL", false, "https://...")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Page-Specific SEO</CardTitle>
              <CardDescription>Meta title and description for individual pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-b pb-4 space-y-4">
                <p className="text-sm font-semibold text-secondary">🏠 Home Page</p>
                {field("seoHomeMeta", "Meta Title")}
                {field("seoHomeDesc", "Meta Description", true)}
              </div>
              <div className="border-b pb-4 space-y-4">
                <p className="text-sm font-semibold text-secondary">💼 Jobs Page</p>
                {field("seoJobsMeta", "Meta Title")}
                {field("seoJobsDesc", "Meta Description", true)}
              </div>
              <div className="border-b pb-4 space-y-4">
                <p className="text-sm font-semibold text-secondary">📋 Results Page</p>
                {field("seoResultsMeta", "Meta Title")}
                {field("seoResultsDesc", "Meta Description", true)}
              </div>
              <div className="space-y-4">
                <p className="text-sm font-semibold text-secondary">📝 Blog Page</p>
                {field("seoBlogMeta", "Meta Title")}
                {field("seoBlogDesc", "Meta Description", true)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SOCIAL TAB ── */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Shown in the footer. Leave blank to hide.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {field("facebookUrl", "Facebook URL", false, "https://facebook.com/pakcareerhub")}
              {field("twitterUrl", "Twitter / X URL", false, "https://twitter.com/pakcareerhub")}
              {field("linkedinUrl", "LinkedIn URL", false, "https://linkedin.com/company/pakcareerhub")}
              {field("youtubeUrl", "YouTube URL", false, "https://youtube.com/@pakcareerhub")}
              {field("whatsappUrl", "WhatsApp Number/URL", false, "+92 300 0000000")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PAGES TAB ── */}
        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Page</CardTitle>
              <CardDescription>Content displayed on the About Us page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {field("pageAboutMeta", "Page Meta Title")}
              {field("aboutTitle", "Page Heading")}
              {field("aboutContent", "About Content (HTML supported)", true)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {field("pageContactMeta", "Page Meta Title")}
              {field("contactEmail", "Contact Email")}
              {field("contactPhone", "Contact Phone")}
              {field("contactAddress", "Office Address", true)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
