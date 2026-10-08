import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <AlertCircle className="h-20 w-20 text-destructive mb-6" />
      <h1 className="text-4xl font-bold text-secondary mb-2">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
      </p>
      <div className="flex gap-4">
        <Link href="/" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
          Return Home
        </Link>
        <Link href="/jobs" className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
          Browse Jobs
        </Link>
      </div>
    </div>
  );
}
