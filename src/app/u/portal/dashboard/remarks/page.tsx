
"use client"

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { FileUpload } from "@/components/file-upload";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Eye, Badge } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type NegativeCredit = {
  _id: string;
  title: string;
  points: number;
  status: 'pending' | 'approved' | 'rejected' | 'appealed';
  notes?: string;
  proofUrl?: string;
  createdAt: string;
  academicYear: string;
};

const getCurrentAcademicYear = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    if (currentMonth >= 5) { // June or later
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
        const endYear = (startYear + 1).toString().slice(-2);
        years.push(`${startYear}-${endYear}`);
    }
    return years;
};

export default function NegativeRemarksPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Data for table and filters
  const [remarks, setRemarks] = useState<NegativeCredit[]>([]);
  const [isLoadingRemarks, setIsLoadingRemarks] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Details view state
  const [selectedRemark, setSelectedRemark] = useState<NegativeCredit | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Appeal state
  const [isAppealDialogOpen, setIsAppealDialogOpen] = useState(false);
  const [appealReason, setAppealReason] = useState("");
  const [appealProof, setAppealProof] = useState<File | null>(null);
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);


  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const facultyId = searchParams.get('uid');
  const totalPages = Math.ceil(total / limit);

  const fetchRemarks = async (currentPage: number) => {
      setIsLoadingRemarks(true);
      if (!token || !facultyId) {
          setIsLoadingRemarks(false);
          return;
      }
  
      try {
          const params = new URLSearchParams({
              page: currentPage.toString(),
              limit: limit.toString(),
              sort: '-createdAt',
          });

          if (searchTerm) params.append('search', searchTerm);
          if (academicYearFilter !== 'all') params.append('academicYear', academicYearFilter);
          if (statusFilter !== 'all') params.append('status', statusFilter);
         
          const response = await fetch(`${API_BASE_URL}/api/v1/credits/faculty/${facultyId}/negative?${params.toString()}`, {
              headers: { Authorization: `Bearer ${token}` },
          });
  
          if (!response.ok) {
            const errorText = await response.text();
             if (errorText.includes('<!DOCTYPE')) {
                toast({ variant: "destructive", title: "Error fetching remarks", description: "The API returned an invalid response. The endpoint might be incorrect." });
            } else {
                toast({ variant: "destructive", title: "Error fetching remarks", description: errorText });
            }
            throw new Error(`Failed to fetch remarks`);
          }
          
          const data = await response.json();
          if (data.success) {
              setRemarks(data.items);
              setTotal(data.total);
          } else {
              throw new Error(data.message || "Failed to fetch remarks");
          }
      } catch (error: any) {
        // Avoid double-toasting if already handled
        if (!error.message.includes('Failed to fetch remarks')) {
            toast({ variant: "destructive", title: "Error fetching remarks", description: error.message });
        }
        setRemarks([]);
        setTotal(0);
      } finally {
          setIsLoadingRemarks(false);
      }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        if (token && facultyId) {
            fetchRemarks(page);
        }
    }, 500); // Debounce API call
    return () => clearTimeout(timer);
  }, [page, token, facultyId, searchTerm, academicYearFilter, statusFilter]);
  
  useEffect(() => {
    setPage(1); // Reset to first page whenever filters change
  }, [searchTerm, academicYearFilter, statusFilter]);
  
  const handleOpenAppealDialog = (remark: NegativeCredit) => {
    setSelectedRemark(remark);
    setIsAppealDialogOpen(true);
  };

  const handleAppealSubmit = async () => {
    if (!selectedRemark || !appealReason) {
        toast({
            variant: "destructive",
            title: "Incomplete Form",
            description: "Please provide a reason for your appeal.",
        });
        return;
    }
    setIsSubmittingAppeal(true);

    const formData = new FormData();
    formData.append('reason', appealReason);
    if (appealProof) {
        formData.append('proof', appealProof);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/credits/${selectedRemark._id}/appeal`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formData,
        });

        const responseData = await response.json();
        if (!response.ok || !responseData.success) {
            throw new Error(responseData.message || "Failed to submit appeal.");
        }
        
        toast({
            title: "Appeal Submitted",
            description: "Your appeal has been successfully submitted for review.",
        });

        setIsAppealDialogOpen(false);
        setAppealReason("");
        setAppealProof(null);
        fetchRemarks(1); // refetch and go to first page
        router.push(`/u/portal/dashboard/appeals?uid=${searchParams.get('uid')}`);

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Appeal Failed",
            description: error.message,
        });
    } finally {
        setIsSubmittingAppeal(false);
    }
  };


  const getProofUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) {
        return url;
    }
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getStatusBadge = (status: NegativeCredit['status']) => {
    switch (status) {
        case 'approved': return <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">Approved</div>
        case 'rejected': return <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800">Rejected</div>
        case 'appealed': return <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">Appealed</div>
        case 'pending':
        default:
            return <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</div>
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            My Negative Remarks
          </h1>
          <p className="mt-1 text-muted-foreground">
            Review and manage negative credits.
          </p>
        </div>
      </header>
        
      <Card>
        <CardHeader>
            <CardTitle>Remarks History</CardTitle>
            <CardDescription>A log of all negative remarks issued to you.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="relative lg:col-span-1">
                  <Input 
                      placeholder="Search by title..." 
                      className="pl-4"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
                  <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {generateYearOptions().map(year => (<SelectItem key={year} value={year}>{year}</SelectItem>))}
                  </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="appealed">Appealed</SelectItem>
                </SelectContent>
              </Select>
          </div>
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Remark Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRemarks ? (
                   <TableRow><TableCell colSpan={5} className="text-center h-24">Loading remarks...</TableCell></TableRow>
                ) : remarks.length > 0 ? (
                  remarks.map((remark) => (
                  <TableRow key={remark._id}>
                    <TableCell className="font-medium text-foreground">{remark.title}</TableCell>
                    <TableCell>{new Date(remark.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(remark.status)}</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">{remark.points}</TableCell>
                    <TableCell className="text-center">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => handleOpenAppealDialog(remark)}
                            disabled={remark.status === 'appealed'}
                        >
                            {remark.status === 'appealed' ? 'Appealed' : 'Appeal'}
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
                ) : (
                    <TableRow><TableCell colSpan={5} className="text-center h-24">No remarks found for the selected filters.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages || 1}
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                    Next
                </Button>
            </div>
        </CardFooter>
      </Card>
      
      <Dialog open={isAppealDialogOpen} onOpenChange={setIsAppealDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create an Appeal for "{selectedRemark?.title}"</DialogTitle>
            <DialogDescription>
              Provide a reason and optional proof for your appeal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
                <label htmlFor="reason" className="text-sm font-medium">Reason for Appeal</label>
                <Textarea 
                    id="reason" 
                    placeholder="Explain why you are appealing this remark..."
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)} 
                    rows={4}
                />
            </div>
            <div className="space-y-2">
              <label htmlFor="proof" className="text-sm font-medium">Proof (Optional)</label>
              <FileUpload onFileSelect={setAppealProof} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAppealSubmit} disabled={isSubmittingAppeal || !appealReason}>
                {isSubmittingAppeal ? 'Submitting...' : 'Submit Appeal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
