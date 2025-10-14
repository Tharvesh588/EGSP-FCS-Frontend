// This file is the new location for src/app/(app)/appeals/page.tsx
"use client"

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type NegativeReport = {
  _id: string;
  title: string;
  createdAt: string;
  type: "positive" | "negative";
  points: number;
};

export default function AppealsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [negativeReports, setNegativeReports] = useState<NegativeReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNegativeReports = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const facultyId = searchParams.get('uid');

      if (!token || !facultyId) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Could not retrieve user credentials.",
        });
        setIsLoading(false);
        return;
      }
      
      const url = `${API_BASE_URL}/api/v1/credits/faculty/${facultyId}?type=negative`;

      try {
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const responseData = await response.json();
        if (!response.ok || !responseData.success) {
          throw new Error(responseData.message || "Failed to fetch negative remarks.");
        }
        
        // Filter for negative credits on the client-side as a fallback, though the API should handle it.
        const negativeCredits = responseData.items.filter((item: any) => item.type === 'negative' || item.points < 0);
        setNegativeReports(negativeCredits);

      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to Fetch Data",
          description: error.message,
        });
        setNegativeReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    const uid = searchParams.get('uid');
    if (uid) {
        fetchNegativeReports();
    }
  }, [searchParams, toast]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Appeals</h2>
          <p className="text-muted-foreground mt-1">
            View and manage your appeals against negative reports.
          </p>
        </div>
        <Button>
          <span className="material-symbols-outlined -ml-1 mr-2 h-5 w-5">add</span>
          <span>Create Appeal</span>
        </Button>
      </div>
      <div className="space-y-12">
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">
            Negative Reports
          </h3>
          <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Remark</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        Loading negative remarks...
                      </TableCell>
                    </TableRow>
                  ) : negativeReports.length > 0 ? (
                    negativeReports.map((report) => (
                      <TableRow key={report._id}>
                        <TableCell className="font-medium text-foreground">
                          {report.title}
                        </TableCell>
                        <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="link" className="text-primary">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                     <TableRow>
                        <TableCell colSpan={3} className="text-center">
                            No negative remarks found.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
        <section>
          <h3 className="text-xl font-bold text-foreground mb-6">
            Appeal Status Timeline
          </h3>
          <div className="relative pl-8">
            <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-border"></div>
            <div className="relative mb-8">
              <div className="absolute left-0 top-1.5 flex items-center justify-center">
                <div className="flex size-6 items-center justify-center rounded-full bg-primary text-white">
                  <span className="material-symbols-outlined text-base">send</span>
                </div>
              </div>
              <div className="ml-8">
                <p className="font-semibold text-foreground">Appeal Submitted</p>
                <p className="text-sm text-muted-foreground">2024-07-27</p>
              </div>
            </div>
            <div className="relative mb-8">
              <div className="absolute left-0 top-1.5 flex items-center justify-center">
                <div className="flex size-6 items-center justify-center rounded-full bg-primary text-white">
                    <span className="material-symbols-outlined text-base">search</span>
                </div>
              </div>
              <div className="ml-8">
                <p className="font-semibold text-foreground">Under Review</p>
                <p className="text-sm text-muted-foreground">2024-07-28</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute left-0 top-1.5 flex items-center justify-center">
                <div className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                </div>
              </div>
              <div className="ml-8">
                <p className="font-semibold text-muted-foreground">Decision Pending</p>
                <p className="text-sm text-muted-foreground">Awaiting final decision</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
