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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

const getCurrentAcademicYear = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
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
        const endYear = startYear + 1;
        years.push(`${startYear}-${endYear.toString().slice(-2)}`);
    }
    return years;
};

const remarks = [
  {
    faculty: "Dr. Priya Sharma",
    severity: "High",
    description: "Repeatedly late for classes",
    date: "2024-07-26",
    status: "Active",
  },
  {
    faculty: "Prof. Arjun Verma",
    severity: "Medium",
    description: "Incomplete syllabus coverage",
    date: "2024-07-20",
    status: "Active",
  },
  {
    faculty: "Ms. Neha Kapoor",
    severity: "Low",
    description: "Minor administrative oversight",
    date: "2024-07-15",
    status: "Active",
  },
]

export default function ManageRemarksPage() {
  const { toast } = useToast();
  const [facultyId, setFacultyId] = useState("");
  const [creditTitleId, setCreditTitleId] = useState("");
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [notes, setNotes] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [facultyList, setFacultyList] = useState<User[]>([]);
  const [creditTitles, setCreditTitles] = useState<CreditTitle[]>([]);

  useEffect(() => {
    const adminToken = localStorage.getItem("token");
    if (!adminToken) {
      toast({ variant: "destructive", title: "Authentication Error" });
      return;
    }

    const fetchFaculty = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const data = await response.json();
        if (data.success) {
          setFacultyList(data.items);
        } else {
          throw new Error(data.message || "Failed to fetch faculty");
        }
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message });
      }
    };

    const fetchCreditTitles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/credit-title`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const data = await response.json();
        if (data.success) {
          // Assuming negative titles can be identified, if not, all will be shown.
          // For now, filtering by a convention if one exists, e.g., points < 0 or type === 'negative'
          setCreditTitles(data.items.filter((ct: CreditTitle) => ct.type === 'negative'));
        } else {
          throw new Error(data.message || "Failed to fetch credit titles");
        }
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message });
      }
    };

    fetchFaculty();
    fetchCreditTitles();
  }, [toast]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProof(event.target.files[0]);
      setFileName(event.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyId || !creditTitleId || !academicYear || !notes || !proof) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill all fields and upload a proof document.",
      });
      return;
    }
    setIsLoading(true);

    const adminToken = localStorage.getItem("token");
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

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/negative-credit`, {
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
      setAcademicYear(getCurrentAcademicYear());
      setNotes("");
      setProof(null);
      setFileName("");

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
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Manage Negative Remarks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage negative remarks against faculty members.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6 rounded-lg bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Create New Remark
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
                placeholder="Enter detailed notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-muted-foreground"
              >
                Upload Document
              </label>
               <label
                  htmlFor="file-upload"
                  className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-border px-6 pt-5 pb-6 cursor-pointer hover:border-primary transition-colors"
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
                    PNG, JPG, PDF, DOCX, ZIP up to 10MB
                  </p>
                  {fileName && <p className="text-sm text-green-600 mt-2">{fileName}</p>}
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
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Remark"}
              </Button>
            </div>
          </form>
        </div>
        <div className="space-y-6 rounded-lg bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Active Remarks
          </h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty Member</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {remarks.map((remark, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-foreground">
                      {remark.faculty}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          remark.severity === "High"
                            ? "bg-red-100 text-red-800"
                            : remark.severity === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {remark.severity}
                      </span>
                    </TableCell>
                    <TableCell>{remark.date}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {remark.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
