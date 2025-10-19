
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
import { useSearchParams } from "next/navigation";
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
import { PlusCircle, Eye, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { io, type Socket } from "socket.io-client";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type User = {
  _id: string;
  name: string;
};

type CreditTitle = {
  _id: string;
  title: string;
  points: number;
  type: 'positive' | 'negative';
};

type NegativeRemark = {
  _id: string;
  faculty: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  title: string;
  points: number;
  status: string;
  notes?: string;
  proofUrl?: string;
  createdAt: string;
  academicYear: string;
};

const getCurrentAcademicYear = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    if (currentMonth >= 5) {
      return `${currentYear}-${(currentYear + 1).toString()}`;
    }
    return `${currentYear - 1}-${currentYear.toString()}`;
};

const generateYearOptions = () => {
    const currentYearString = getCurrentAcademicYear();
    const [startCurrentYear] = currentYearString.split('-').map(Number);
    
    const years = [];
    for (let i = 0; i < 5; i++) {
        const startYear = startCurrentYear - i;
        const endYear = startYear + 1;
        years.push(`${startYear}-${endYear.toString()}`);
    }
    return years;
};

export default function ManageRemarksPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Form state
  const [facultyId, setFacultyId] = useState("");
  const [creditTitleId, setCreditTitleId] = useState("");
  const [points, setPoints] = useState<number | string>("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Data for dropdowns
  const [facultyList, setFacultyList] = useState<User[]>([]);
  const [creditTitles, setCreditTitles] = useState<CreditTitle[]>([]);

  // Data for table and filters
  const [remarks, setRemarks] = useState<NegativeRemark[]>([]);
  const [isLoadingRemarks, setIsLoadingRemarks] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  
  // Details view state
  const [selectedRemark, setSelectedRemark] = useState<NegativeRemark | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const adminToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const uid = searchParams.get('uid');
  const totalPages = Math.ceil(total / limit);

  const fetchDropdownData = async () => {
    if (!adminToken) {
      toast({ variant: "destructive", title: "Authentication Error" });
      return;
    }
    try {
      const [facultyResponse, creditTitlesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/users?limit=1000`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch(`${API_BASE_URL}/api/v1/admin/credit-title`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        })
      ]);

      const facultyData = await facultyResponse.json();
      if (facultyData.success) {
        setFacultyList(facultyData.items);
      } else {
        throw new Error(facultyData.message || "Failed to fetch faculty");
      }

      const creditTitlesData = await creditTitlesResponse.json();
      if (creditTitlesData.success) {
        setCreditTitles(creditTitlesData.items.filter((ct: CreditTitle) => ct.type === 'negative'));
      } else {
        throw new Error(creditTitlesData.message || "Failed to fetch credit titles");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error fetching initial data", description: error.message });
    }
  };

  const fetchRemarks = async (currentPage: number) => {
      setIsLoadingRemarks(true);
      if (!adminToken) {
          setIsLoadingRemarks(false);
          return;
      }
  
      try {
          const params = new URLSearchParams({
              page: currentPage.toString(),
              limit: limit.toString(),
              sort: '-createdAt'
          });

          if (searchTerm) params.append('search', searchTerm);
          if (academicYearFilter !== 'all') params.append('academicYear', academicYearFilter);
          if (statusFilter !== 'all') params.append('status', statusFilter);
          if (facultyFilter !== 'all') params.append('facultyId', facultyFilter);

          const response = await fetch(`${API_BASE_URL}/api/v1/admin/credits/negative?${params.toString()}`, {
              headers: { Authorization: `Bearer ${adminToken}` },
          });
  
          const data = await response.json();
          if (data.success) {
              setRemarks(data.items);
              setTotal(data.total);
          } else {
              throw new Error(data.message || "Failed to fetch remarks");
          }
      } catch (error: any) {
          toast({ variant: "destructive", title: "Error fetching remarks", description: error.message });
          setRemarks([]);
          setTotal(0);
      } finally {
          setIsLoadingRemarks(false);
      }
  };


  useEffect(() => {
    if (adminToken) {
      fetchDropdownData();
    }
  }, [uid, adminToken, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (adminToken) {
            fetchRemarks(page);
        }
    }, 500); // Debounce API call
    return () => clearTimeout(timer);
  }, [page, adminToken, searchTerm, academicYearFilter, statusFilter, facultyFilter]);
  
  useEffect(() => {
    setPage(1); // Reset to first page whenever filters change
  }, [searchTerm, academicYearFilter, statusFilter, facultyFilter]);
  
  useEffect(() => {
    const selectedTitle = creditTitles.find(ct => ct._id === creditTitleId);
    if (selectedTitle) {
      setTitle(selectedTitle.title);
      setPoints(selectedTitle.points);
    } else {
      setTitle("");
      setPoints("");
    }
  }, [creditTitleId, creditTitles]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyId || !points || !title) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill out all required fields.",
      });
      return;
    }
    setIsLoading(true);

    if (!adminToken) {
      toast({ variant: "destructive", title: "Authentication Error" });
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("facultyId", facultyId);
    formData.append("points", points.toString());
    formData.append("academicYear", getCurrentAcademicYear());
    formData.append("title", title);
    if (creditTitleId) formData.append("creditTitleId", creditTitleId);
    if (notes) formData.append("notes", notes);
    if (proof) formData.append("proof", proof);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/credits/negative`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminToken}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Failed to issue remark.");
      }

      toast({
        title: "Remark Issued",
        description: "The negative remark has been successfully recorded.",
      });

      // Reset form
      setFacultyId("");
      setCreditTitleId("");
      setTitle("");
      setPoints("");
      setNotes("");
      setProof(null);
      fetchRemarks(1); // refetch and go to first page
      setPage(1);
      setIsFormOpen(false);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartConversation = async () => {
    if (!selectedRemark || !uid) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          creditId: selectedRemark._id,
          participantIds: [selectedRemark.faculty._id, uid],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start conversation');
      }

      toast({
        title: 'Conversation Started',
        description: 'You can now chat with the faculty member in the Conversations tab.',
      });
      setIsDetailsOpen(false);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Starting Conversation',
        description: error.message,
      });
    }
  };

  const getProofUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    // Check for duplicated base URL
    if (url.includes('https//') || url.includes('http//')) {
        const parts = url.split('https//');
        if (parts.length > 1) return `https://${parts[parts.length -1]}`;
        const httpParts = url.split('http//');
        if (httpParts.length > 1) return `http://${httpParts[httpParts.length-1]}`;
    }
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Manage Negative Remarks
          </h1>
          <p className="mt-1 text-muted-foreground">
            Issue and monitor negative credit adjustments for faculty members.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Issue New Remark
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                 <DialogHeader>
                    <DialogTitle>Issue New Remark</DialogTitle>
                    <DialogDescription>Fill out the details below to issue a negative credit to a faculty member.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4 pt-4" onSubmit={handleSubmit}>
                    <div>
                    <label className="block text-sm font-medium text-muted-foreground" htmlFor="faculty">Faculty Member</label>
                    <Select value={facultyId} onValueChange={setFacultyId}>
                        <SelectTrigger id="faculty"><SelectValue placeholder="Select Faculty Member" /></SelectTrigger>
                        <SelectContent>
                        {facultyList.map(faculty => (<SelectItem key={faculty._id} value={faculty._id}>{faculty.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-muted-foreground" htmlFor="creditTitle">Remark Template (Optional)</label>
                    <Select value={creditTitleId} onValueChange={setCreditTitleId}>
                        <SelectTrigger id="creditTitle"><SelectValue placeholder="Select a template" /></SelectTrigger>
                        <SelectContent>
                        {creditTitles.map(ct => (<SelectItem key={ct._id} value={ct._id}>{ct.title}</SelectItem>))}
                        </SelectContent>
                    </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground" htmlFor="title">Title</label>
                        <Input id="title" placeholder="e.g., 'Missed department meeting'" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground" htmlFor="points">Points</label>
                            <Input id="points" type="number" placeholder="e.g., -5" value={points} onChange={(e) => setPoints(Number(e.target.value))} required />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-muted-foreground" htmlFor="academicYear">Academic Year</label>
                        <Select value={getCurrentAcademicYear()} disabled>
                            <SelectTrigger id="academicYear"><SelectValue placeholder="Select Year" /></SelectTrigger>
                            <SelectContent>{generateYearOptions().map(year => (<SelectItem key={year} value={year}>{year}</SelectItem>))}</SelectContent>
                        </Select>
                        </div>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-muted-foreground" htmlFor="notes">Notes / Rationale</label>
                    <Textarea id="notes" placeholder="Enter detailed notes about the incident" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Upload Proof (Optional)</label>
                    <FileUpload onFileSelect={setProof} />
                    </div>
                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? "Submitting..." : "Issue Remark"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </header>
        
      <Card>
        <CardHeader>
            <CardTitle>Issued Remarks History</CardTitle>
            <CardDescription>A log of all negative remarks that have been issued.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                      placeholder="Search by title, faculty..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {generateYearOptions().map(year => (<SelectItem key={year} value={year}>{year}</SelectItem>))}
                  </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="appealed">Appealed</SelectItem>
                  </SelectContent>
              </Select>
               <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                  <SelectTrigger className="w-full md:w-[220px]">
                      <SelectValue placeholder="Select Faculty" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Faculty</SelectItem>
                      {facultyList.map(faculty => (<SelectItem key={faculty._id} value={faculty._id}>{faculty.name}</SelectItem>))}
                  </SelectContent>
              </Select>
          </div>
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Remark Title</TableHead>
                  <TableHead>Date</TableHead>
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
                    <TableCell className="font-medium text-foreground">{remark.faculty.name}</TableCell>
                    <TableCell>{remark.title}</TableCell>
                    <TableCell>{new Date(remark.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">{remark.points}</TableCell>
                    <TableCell className="text-center">
                        <Dialog open={isDetailsOpen && selectedRemark?._id === remark._id} onOpenChange={(isOpen) => {
                            if (isOpen) {
                                setSelectedRemark(remark);
                                setIsDetailsOpen(true);
                            } else {
                                setIsDetailsOpen(false);
                                setSelectedRemark(null);
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => {
                                    setSelectedRemark(remark);
                                    setIsDetailsOpen(true);
                                }}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                <DialogTitle>Remark Details</DialogTitle>
                                </DialogHeader>
                                {selectedRemark && (
                                <div className="space-y-4 py-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={selectedRemark.faculty.profileImage} />
                                            <AvatarFallback>{selectedRemark.faculty.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{selectedRemark.faculty.name}</p>
                                            <p className="text-sm text-muted-foreground">{selectedRemark.academicYear}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p><strong className="font-medium text-muted-foreground">Title:</strong> {selectedRemark.title}</p>
                                        <p><strong className="font-medium text-muted-foreground">Points:</strong> <span className="font-semibold text-destructive">{selectedRemark.points}</span></p>
                                        <p><strong className="font-medium text-muted-foreground">Date Issued:</strong> {new Date(selectedRemark.createdAt).toLocaleString()}</p>
                                        <p><strong className="font-medium text-muted-foreground">Notes:</strong> {selectedRemark.notes || 'N/A'}</p>
                                    </div>
                                    {selectedRemark.proofUrl && (
                                        <Button asChild variant="link" className="p-0 h-auto">
                                            <a href={getProofUrl(selectedRemark.proofUrl)} target="_blank" rel="noopener noreferrer">View Proof Document</a>
                                        </Button>
                                    )}
                                </div>
                                )}
                                <DialogFooter>
                                    <Button variant="secondary" onClick={handleStartConversation}>Start Conversation</Button>
                                    <DialogClose asChild><Button>Close</Button></DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
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
    </div>
  )
}
