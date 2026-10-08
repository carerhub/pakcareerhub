import React from "react";
import { Link } from "wouter";
import { useListDepartments } from "@workspace/api-client-react";
import { Building2, Briefcase, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Departments() {
  const { data: departments, isLoading } = useListDepartments();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <section className="bg-secondary text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h1 className="text-4xl font-extrabold mb-3">Browse by Department</h1>
          <p className="text-white/80">
            Explore job vacancies from all major government departments and commissions across Pakistan.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="h-36 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {departments?.map(dept => (
                <Link key={dept.id} href={`/departments/${dept.id}`}>
                  <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full group">
                    <CardContent className="p-6 flex flex-col items-center text-center justify-between h-full">
                      <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                        {dept.iconUrl ? (
                          <img src={dept.iconUrl} alt={dept.name} className="h-8 w-8" />
                        ) : (
                          <Building2 className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-secondary group-hover:text-primary transition-colors mb-1">
                          {dept.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {dept.jobCount} Jobs
                        </Badge>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary mt-2 transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
