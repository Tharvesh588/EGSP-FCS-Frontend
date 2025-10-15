// This file is the new location for src/app/(app)/admin/review/page.tsx
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import React, { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type Submission = {
  _id: string;
  faculty: {
    _id: string;
    name: string;
    department: string;
  };
  title: string;
  categories: { _id: string; title: string; }[];
  description?: string;
  proofUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  points: number;
};

export default function ReviewSubmissionsPage() {
    const { toast } = useToast();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [statusFilter, setStatusFilter] = useState("pending");
    const [adminNotes, setAdminNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchSubmissions = async (status: string) => {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            toast({ variant: "destructive", title: "Authentication Error" });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/credits/positive?status=${status}&sort=-createdAt`, {
                headers: { "Authorization": `Bearer ${token}` },
                cache: 'no-store'
            });
            const data = await response.json();
            if (data.success) {
                setSubmissions(data.items);
                if (data.items.length > 0) {
                    setSelectedSubmission(data.items[0]);
                } else {
                    setSelectedSubmission(null);
                }
            } else {
                throw new Error(data.message || "Failed to fetch submissions");
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
            setSubmissions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions(statusFilter);
    }, [statusFilter]);

    useEffect(() => {
      // Clear notes when submission changes
      setAdminNotes("");
    }, [selectedSubmission]);

    const handleUpdateStatus = async (newStatus: "approved" | "rejected") => {
        if (!selectedSubmission) return;

        setIsSubmitting(true);
        const token = localStorage.getItem("token");
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/credits/positive/${selectedSubmission._id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    notes: adminNotes,
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast({
                    title: `Submission ${newStatus}`,
                    description: "The submission status has been updated.",
                });
                // Refresh list
                fetchSubmissions(statusFilter);
            } else {
                throw new Error(data.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };


  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-auto">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Good Works Submissions
            </h2>
            <p className="text-muted-foreground">
              Review and process faculty submissions for good works.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={statusFilter === 'pending' ? 'secondary' : 'ghost'} onClick={() => setStatusFilter('pending')}>Pending</Button>
            <Button variant={statusFilter === 'approved' ? 'secondary' : 'ghost'} onClick={() => setStatusFilter('approved')}>Approved</Button>
            <Button variant={statusFilter === 'rejected' ? 'secondary' : 'ghost'} onClick={() => setStatusFilter('rejected')}>Rejected</Button>
          </div>
        </div>
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">View</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading submissions...</TableCell>
                    </TableRow>
                ) : submissions.length > 0 ? (
                    submissions.map((submission) => (
                    <TableRow
                        key={submission._id}
                        className={`cursor-pointer ${selectedSubmission?._id === submission._id ? "bg-primary/10" : ""}`}
                        onClick={() => setSelectedSubmission(submission)}
                    >
                        <TableCell className="font-medium">
                        {submission.faculty.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {submission.categories.map(c => c.title).join(', ')}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                        <Badge
                            variant={
                            submission.status === "approved"
                                ? "default"
                                : submission.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                            className={
                            submission.status === "approved" ? "bg-green-100 text-green-800" :
                            submission.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                            }
                        >
                            {submission.status}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <span className="material-symbols-outlined text-muted-foreground">
                            chevron_right
                        </span>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">No submissions found for this status.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <aside className="lg:col-span-1 bg-card rounded-lg border flex flex-col p-6 gap-6 h-fit sticky top-6">
        {selectedSubmission ? (
            <>
                <h3 className="text-xl font-bold">Submission Details</h3>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-muted-foreground">
                    Faculty
                    </label>
                    <p className="font-semibold">{selectedSubmission.faculty.name}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-muted-foreground">
                    Department
                    </label>
                    <p>{selectedSubmission.faculty.department}</p>
                </div>
                 <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-muted-foreground">
                    Submission Date
                    </label>
                    <p>{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-muted-foreground">
                    Title
                    </label>
                    <p>{selectedSubmission.title}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-muted-foreground">
                    Credit Value
                    </label>
                    <p className="font-semibold">{selectedSubmission.points} points</p>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-muted-foreground">
                    Supporting Document
                    </label>
                    <a className="flex items-center gap-2 text-primary hover:underline" href={selectedSubmission.proofUrl} target="_blank" rel="noopener noreferrer">
                    <span className="material-symbols-outlined">attach_file</span>
                    <span>View Document</span>
                    </a>
                </div>
                <div className="border-t pt-6 flex flex-col gap-4">
                    <label className="text-sm font-medium text-muted-foreground" htmlFor="credit-value">
                        Admin Remarks
                    </label>
                    <Textarea 
                      id="admin-notes"
                      placeholder="Add remarks (optional for approve, recommended for reject)" 
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      disabled={selectedSubmission.status !== 'pending' || isSubmitting}
                    />
                    <div className="flex gap-3">
                        <Button 
                            className="flex-1"
                            onClick={() => handleUpdateStatus('approved')}
                            disabled={selectedSubmission.status !== 'pending' || isSubmitting}
                        >
                            <span className="material-symbols-outlined mr-2">check_circle</span>
                            Approve
                        </Button>
                        <Button 
                            variant="destructive" 
                            className="flex-1"
                            onClick={() => handleUpdateStatus('rejected')}
                            disabled={selectedSubmission.status !== 'pending' || isSubmitting}
                        >
                            <span className="material-symbols-outlined mr-2">cancel</span>
                            Reject
                        </Button>
                    </div>
                </div>
            </>
        ) : (
            <div className="bg-background p-4 rounded-lg flex items-center justify-center text-center text-muted-foreground h-full">
                <p>{isLoading ? "Loading..." : "Select a submission to view details"}</p>
            </div>
        )}
      </aside>
    </div>
  )
}
