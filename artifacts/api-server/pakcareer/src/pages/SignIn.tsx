import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, UserRound, UserPlus } from "lucide-react";

export default function SignIn() {
  const { login, register } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const result = mode === "signin"
      ? await login(email, password)
      : await register(name, email, password);
    setIsLoading(false);
    if (result.ok) {
      setLocation("/");
    } else {
      setError(result.error || "Please try again");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white text-2xl font-bold mb-4">P</div>
          <h1 className="text-2xl font-bold text-secondary">PakCareerHub</h1>
          <p className="text-muted-foreground mt-1">Your career journey starts here</p>
        </div>
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {mode === "signin" ? <UserRound className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
              {mode === "signin" ? "Sign In" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {mode === "signin" ? "Sign in to save jobs and manage your preferences." : "Create your free job seeker account."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="user-email">Email Address</Label>
                <Input id="user-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-password">Password</Label>
                <Input id="user-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
              </Button>
            </form>
            <div className="text-center mt-5 text-sm text-muted-foreground">
              {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={() => { setMode(mode === "signin" ? "register" : "signin"); setError(""); }} className="text-primary font-medium hover:underline">
                {mode === "signin" ? "Create one" : "Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/" className="hover:text-primary">← Back to PakCareerHub</Link>
        </p>
      </div>
    </div>
  );
}