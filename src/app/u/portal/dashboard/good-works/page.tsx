
"use client"

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react";
import { useAlert } from "@/context/alert-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type GoodWork = {
  _id: string;
  createdAt: string;
  title: string;
  description?: string;
  categories: { _id: string; title: string }[];
  status: "approved" | "pending" | "rejected";
  points: number;
  academicYear: string;
  type: 'positive' | 'negative';
  proofUrl?: string;
};

const getCurrentAcademicYear = () => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();
    // Academic year starts in June (index 5)
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
        const endYear = (startYear + 1).toString().slice(-2);
        years.push(`${startYear}-${endYear}`);
    }
    return years;
};

export default function GoodWorksPage() {
  const { showAlert } = useAlert();
  const searchParams = useSearchParams();
  const [goodWorks, setGoodWorks] = useState<GoodWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchGoodWorks = async (currentPage: number, currentYear: string, currentStatus: string) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const facultyId = searchParams.get('uid');

    if (!token || !facultyId) {
      showAlert(
        "Authentication Error",
        "Could not retrieve user credentials.",
      );
      setIsLoading(false);
      return;
    }
    
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: limit.toString(),
    });
    
    if (currentYear && currentYear !== 'all') {
      params.append('academicYear', currentYear);
    }
    if (currentStatus && currentStatus !== 'all') {
      params.append('status', currentStatus);
    }

    let url = `${API_BASE_URL}/api/v1/credits/credits/faculty/${facultyId}?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.trim().startsWith("<!DOCTYPE html>")) {
           throw new Error(`API endpoint not found. Please check the URL. Status: ${response.status}`);
        }
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || "An unknown server error occurred.");
        } catch (e) {
          throw new Error(errorText || `Server responded with status: ${response.status}`);
        }
      }
      
      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.message || "Failed to fetch good works.");
      }

      const positiveWorks = responseData.items.filter((work: GoodWork) => work.type === 'positive');
      setGoodWorks(positiveWorks);
      setTotal(responseData.total);
    } catch (error: any) {
      showAlert(
        "Failed to Fetch Data",
        error.message,
      );
      setGoodWorks([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const uid = searchParams.get('uid');
    if (uid) {
        fetchGoodWorks(page, academicYear, statusFilter);
    }
  }, [page, academicYear, statusFilter, searchParams]);

  const handleViewDetails = (proofUrl: string) => {
    const userConfirmation = window.confirm("You are being redirected to an external website. This application is not responsible for the content of external sites.");
    if (userConfirmation) {
      window.open(proofUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const filteredWorks = goodWorks.filter(work => {
    const matchesSearch = searchTerm.trim() === "" ||
      work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (work.description && work.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const totalPages = Math.ceil(total / limit);
  const yearOptions = generateYearOptions();

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Good Works</h1>
        <p className="mt-1 text-muted-foreground">
          View and manage your submitted good works. Track their status and
          access related documents.
        </p>
      </div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            search
          </span>
          <Input
            className="w-full rounded-lg bg-card py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/50"
            placeholder="Search by title or description"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <Select onValueChange={(value) => { setAcademicYear(value); setPage(1); }} value={academicYear}>
                <SelectTrigger className="w-full sm:w-auto">
                    <SelectValue placeholder="Select Academic Year" />
                </SelectTrigger>
                <SelectContent>
                    {yearOptions.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          <Button variant={statusFilter === 'all' ? 'secondary' : 'ghost'} onClick={() => { setStatusFilter('all'); setPage(1); }}>All</Button>
          <Button variant={statusFilter === 'pending' ? 'secondary' : 'ghost'} onClick={() => { setStatusFilter('pending'); setPage(1); }}>Pending</Button>
          <Button variant={statusFilter === 'approved' ? 'secondary' : 'ghost'} onClick={() => { setStatusFilter('approved'); setPage(1); }}>Approved</Button>
          <Button variant={statusFilter === 'rejected' ? 'secondary' : 'ghost'} onClick={() => { setStatusFilter('rejected'); setPage(1); }}>Rejected</Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg bg-card shadow-sm border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredWorks.length > 0 ? (
                filteredWorks.map((work) => (
                  <TableRow key={work._id}>
                    <TableCell className="text-muted-foreground">{new Date(work.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium text-foreground">{work.title}</TableCell>
                    <TableCell>
                      {work.categories.map(cat => (
                        <Badge key={`${work._id}-${cat._id}`} variant="secondary">{cat.title}</Badge>
                      ))}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{work.points}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          work.status === "approved"
                            ? "default"
                            : work.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          work.status === "approved" ? "bg-green-100 text-green-800" :
                          work.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }
                      >
                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                          work.status === "approved" ? "bg-green-500" :
                          work.status === "pending" ? "bg-yellow-500" :
                          "bg-red-500"
                        }`}></span>
                        {work.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                  onClick={() => work.proofUrl && handleViewDetails(work.proofUrl)}
                                  disabled={!work.proofUrl}
                              >
                                  View Details
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No good works found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
            <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{Math.min((page - 1) * limit + 1, total)}</span> to <span className="font-medium text-foreground">{Math.min(page * limit, total)}</span> of <span className="font-medium text-foreground">{total}</span> results
            </div>
            <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-lg shadow-sm">
                <Button variant="outline" size="icon" className="rounded-r-none h-8 w-8" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <span className="material-symbols-outlined h-5 w-5"> chevron_left </span>
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, page - 3), page + 2)
                  .map(p => (
                    <Button key={p} variant={page === p ? "outline" : "ghost"} size="icon" className="rounded-none h-8 w-8" onClick={() => setPage(p)}>
                        {p}
                    </Button>
                  ))
                }

                <Button variant="outline" size="icon" className="rounded-l-none h-8 w-8" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                    <span className="material-symbols-outlined h-5 w-5"> chevron_right </span>
                </Button>
            </nav>
        </div>
      </div>
    </div>
  )
}
