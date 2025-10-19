// This file is the new location for src/app/(app)/admin/remarks/page.tsx
"use client"

import { useState, useEffect } from "react";
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
  };
  title: string;
  points: number;
  status: string;
  createdAt: string;
};

const getCurrentAcademicYear = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    // Academic year starts in June (index 5)
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
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [notes, setNotes] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Data for dropdowns
  const [facultyList, setFacultyList] = useState<User[]>([]);
  const [creditTitles, setCreditTitles] = useState<CreditTitle[]>([]);

  // Data for table
  const [remarks, setRemarks] = useState<NegativeRemark[]>([]);
  const [isLoadingRemarks, setIsLoadingRemarks] = useState(true);

  const adminToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const uid = searchParams.get('uid');

  const fetchDropdownData = async () => {
    if (!adminToken) {
      toast({ variant: "destructive", title: "Authentication Error" });
      return;
    }

    try {
      // Fetch faculty
      const facultyResponse = await fetch(`${API_BASE_URL}/api/v1/users?limit=1000`, { // Fetch all faculty
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const facultyData = await facultyResponse.json();
      if (facultyData.success) {
        setFacultyList(facultyData.items);
      } else {
        throw new Error(facultyData.message || "Failed to fetch faculty");
      }

      // Fetch negative credit titles
      const creditTitlesResponse = await fetch(`${API_BASE_URL}/api/v1/admin/credit-title`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
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

  const fetchRemarks = async () => {
    setIsLoadingRemarks(true);
    if (!adminToken || !uid) {
        setIsLoadingRemarks(false);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/faculty/${uid}/credits/negative`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });

        const data = await response.json();
        if (data.success) {
            setRemarks(data.items);
        } else {
            console.warn("Could not fetch negative remarks for the current user. Trying to fetch all positive credits and filter as a fallback.");
            const allCreditsResponse = await fetch(`${API_BASE_URL}/api/v1/admin/credits/positive?limit=200`, { headers: { Authorization: `Bearer ${adminToken}` } });
            const allCreditsData = await allCreditsResponse.json();
            if (allCreditsData.success) {
                setRemarks(allCreditsData.items.filter((item: any) => item.type === 'negative'));
            } else {
                throw new Error(data.message || "Failed to fetch remarks");
            }
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error fetching remarks", description: error.message });
        setRemarks([]);
    } finally {
        setIsLoadingRemarks(false);
    }
};


  useEffect(() => {
    if (adminToken) {
      fetchDropdownData();
      fetchRemarks();
    }
  }, [uid, adminToken, toast]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // You might want to add file size validation here
      setProof(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTitle = creditTitles.find(ct => ct._id === creditTitleId);

    if (!facultyId || !creditTitleId || !academicYear || !notes || !proof || !selectedTitle) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill all fields and upload a proof document.",
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
    formData.append("creditTitleId", creditTitleId);
    formData.append("academicYear", academicYear);
    formData.append("notes", notes);
    formData.append("proof", proof);
    formData.append("title", selectedTitle.title);
    formData.append("points", selectedTitle.points.toString());

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

      // Reset form and refetch remarks
      setFacultyId("");
      setCreditTitleId("");
      setAcademicYear(getCurrentAcademicYear());
      setNotes("");
      setProof(null);
      setFileName("");
      fetchRemarks();

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


  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Manage Negative Remarks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Issue and manage negative remarks against faculty members.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="space-y-6 rounded-lg bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">
            Issue New Remark
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="block text-sm font-medium text-muted-foreground"
                htmlFor="faculty"
              >
                Faculty Member
              </label>
              <Select value={facultyId} onValueChange={setFacultyId}>
                <SelectTrigger id="faculty">
                  <SelectValue placeholder="Select Faculty Member" />
                </SelectTrigger>
                <SelectContent>
                  {facultyList.map(faculty => (
                    <SelectItem key={faculty._id} value={faculty._id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-muted-foreground"
                htmlFor="creditTitle"
              >
                Remark Title
              </label>
              <Select value={creditTitleId} onValueChange={setCreditTitleId}>
                <SelectTrigger id="creditTitle">
                  <SelectValue placeholder="Select Remark Title" />
                </SelectTrigger>
                <SelectContent>
                   {creditTitles.map(ct => (
                    <SelectItem key={ct._id} value={ct._id}>
                        {ct.title} ({ct.points} points)
                    </SelectItem>
                ))}
                </SelectContent>
              </Select>
            </div>
             <div>
              <label
                className="block text-sm font-medium text-muted-foreground"
                htmlFor="academicYear"
              >
                Academic Year
              </label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger id="academicYear">
                    <SelectValue placeholder="Select Academic Year" />
                </SelectTrigger>
                <SelectContent>
                    {generateYearOptions().map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-muted-foreground"
                htmlFor="notes"
              >
                Notes / Description
              </label>
              <Textarea
                id="notes"
                placeholder="Enter detailed notes about the incident"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Upload Proof Document
              </label>
               <label
                  htmlFor="file-upload"
                  className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-border px-6 py-5 cursor-pointer hover:border-primary transition-colors"
                >
                <div className="space-y-1 text-center">
                  <span className="material-symbols-outlined text-4xl text-muted-foreground/50">
                    cloud_upload
                  </span>
                  <div className="flex text-sm text-muted-foreground">
                    <span
                      className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                    >
                      <span>Upload a file</span>
                    </span>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                   <p className="text-xs text-muted-foreground/80">
                    PDF, DOCX, ZIP etc. up to 10MB
                  </p>
                  {fileName && <p className="text-sm text-green-600 mt-2 truncate max-w-xs">{fileName}</p>}
                   <Input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                </div>
              </label>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Submitting Remark..." : "Submit Remark"}
              </Button>
            </div>
          </form>
        </div>
        <div className="space-y-6 rounded-lg bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">
            Issued Remarks History
          </h2>
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Remark Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRemarks ? (
                   <TableRow>
                      <TableCell colSpan={4} className="text-center">Loading remarks...</TableCell>
                    </TableRow>
                ) : remarks.length > 0 ? (
                  remarks.map((remark) => (
                  <TableRow key={remark._id}>
                    <TableCell className="font-medium text-foreground">
                      {remark.faculty.name}
                    </TableCell>
                    <TableCell>{remark.title}</TableCell>
                    <TableCell>{new Date(remark.createdAt).toLocaleDateString()}</TableCell>
                     <TableCell className="text-right font-semibold text-destructive">{remark.points}</TableCell>
                  </TableRow>
                ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">No remarks found.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
