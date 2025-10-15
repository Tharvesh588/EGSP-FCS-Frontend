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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type Submission = {
  _id: string;
  faculty: {
    _id: string;
    name: string;
    department: string;
    college: string;
  };
  title: string;
  categories: { _id: string; title: string; }[];
  description?: string;
  proofUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  points: number;
};

const getCurrentAcademicYear = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    if (currentMonth >= 5) {
      return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
    }
    return `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
};

const generateYearOptions = () => {
    const currentYearString = getCurrentAcademicYear();
    const [startCurrentYear] = currentYearString.split('-').map(Number);
    
    const years = [];
    for (let i = 0; i < 5; i++) {
        const startYear = startCurrentYear - i;
        const endYear = startYear + 1;
        years.push(`${startYear}-${endYear.toString().slice(-2)}`);
    }
    return years;
};


export default function ReviewSubmissionsPage() {
    const { toast } = useToast();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [statusFilter, setStatusFilter] = useState("pending");
    const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);

    const [adminNotes, setAdminNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const yearOptions = generateYearOptions();
    const totalPages = Math.ceil(total / limit);

    const fetchSubmissions = async (status: string, year: string, currentPage: number) => {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            toast({ variant: "destructive", title: "Authentication Error" });
            setIsLoading(false);
            return;
        }

        try {
            const params = new URLSearchParams({
                status: status,
                academicYear: year,
                page: currentPage.toString(),
                limit: limit.toString(),
                sort: '-createdAt'
            });

            const response = await fetch(`${API_BASE_URL}/api/v1/admin/credits/positive?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` },
                cache: 'no-store'
            });

            const data = await response.json();
            if (data.success) {
                setSubmissions(data.items);
                setTotal(data.total);
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
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchSubmissions(statusFilter, academicYear, page);
    }, [statusFilter, academicYear, page, toast]);

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
                fetchSubmissions(statusFilter, academicYear, page);
            } else {
                throw new Error(data.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewDocument = () => {
      if (!selectedSubmission?.proofUrl) return;

      const userConfirmation = window.confirm("You are being redirected to an external website. Please note that this application cannot be held responsible for external websites' content & privacy policies.");
      
      if (userConfirmation) {
        window.open(selectedSubmission.proofUrl, '_blank', 'noopener,noreferrer');
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
            <Button variant={statusFilter === 'pending' ? 'secondary' : 'ghost'} onClick={() => { setStatusFilter('pending'); setPage(1); }}>Pending</Button>
            <Button variant={statusFilter === 'approved' ? 'secondary' : 'ghost'} onClick={() => { setStatusFilter('approved'); setPage(1); }}>Approved</Button>
            <Button variant={statusFilter === 'rejected' ? 'secondary' : 'ghost'} onClick={() => { setStatusFilter('rejected'); setPage(1); }}>Rejected</Button>
          </div>
        </div>

        <div className="mb-4">
            <Select onValueChange={(value) => { setAcademicYear(value); setPage(1); }} value={academicYear}>
                <SelectTrigger className="w-full sm:w-[240px]">
                    <SelectValue placeholder="Select Academic Year" />
                </SelectTrigger>
                <SelectContent>
                    {yearOptions.map(year => (
                        <SelectItem key={year} value={year}>Academic Year {year}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>College</TableHead>
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
                          {submission.faculty.college}
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
           <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
                <div className="text-sm text-muted-foreground">
                    Page <span className="font-medium text-foreground">{page}</span> of <span className="font-medium text-foreground">{totalPages || 1}</span>
                </div>
                <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-lg shadow-sm">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                        Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                        Next
                    </Button>
                </nav>
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
                    <button
                      className="flex items-center gap-2 text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleViewDocument}
                      disabled={!selectedSubmission.proofUrl}
                    >
                      <span className="material-symbols-outlined">attach_file</span>
                      <span>View Document</span>
                    </button>
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
