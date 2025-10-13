"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type CreditTitle = {
  _id: string;
  title: string;
  points: number;
};

export default function SubmitAchievementPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [creditTitles, setCreditTitles] = useState<CreditTitle[]>([]);
  const [selectedCreditTitleId, setSelectedCreditTitleId] = useState("");
  const [title, setTitle] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const selectedCreditTitle = creditTitles.find(ct => ct._id === selectedCreditTitleId);

  useEffect(() => {
    const fetchCreditTitles = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/credit-title`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const responseData = await response.json();
        if (responseData.success) {
          setCreditTitles(responseData.items);
        }
      } catch (error) {
        console.error("Failed to fetch credit titles:", error);
      }
    };
    fetchCreditTitles();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProof(event.target.files[0]);
      setFileName(event.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreditTitle || !title || !academicYear || !proof) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill out all fields and upload a proof document.",
      });
      return;
    }
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast({ variant: "destructive", title: "Authentication Error", description: "Please log in again." });
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("points", selectedCreditTitle.points.toString());
    formData.append("categories", selectedCreditTitle._id);
    formData.append("academicYear", academicYear);
    formData.append("proof", proof);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/credits/positive`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Failed to submit achievement.");
      }

      toast({
        title: "Submission Successful",
        description: "Your achievement has been submitted for review.",
      });

      // Reset form
      setTitle("");
      setSelectedCreditTitleId("");
      setAcademicYear("");
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

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -2; i < 3; i++) {
        const startYear = currentYear - i;
        const endYear = startYear + 1;
        years.push(`${startYear}-${endYear.toString().slice(-2)}`);
    }
    return years.reverse();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Submit Achievement
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill out the form below to submit your recent achievement for review.
        </p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={setSelectedCreditTitleId} value={selectedCreditTitleId}>
              <SelectTrigger id="category" className="mt-1">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {creditTitles.map(ct => (
                    <SelectItem key={ct._id} value={ct._id}>
                        {ct.title}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              name="points"
              type="number"
              className="mt-1 bg-muted"
              placeholder="Points"
              value={selectedCreditTitle?.points || ""}
              readOnly
            />
          </div>
        </div>
         <div>
          <Label htmlFor="title">Achievement Title</Label>
          <Input
            id="title"
            name="title"
            type="text"
            className="mt-1"
            placeholder="e.g., 'Published a paper on AI...'"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
            <Label htmlFor="academicYear">Academic Year</Label>
            <Select onValueChange={setAcademicYear} value={academicYear}>
                <SelectTrigger id="academicYear" className="mt-1">
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
          <Label>Attachments</Label>
          <div className="mt-2 flex justify-center rounded-xl border-2 border-dashed border-border px-6 pt-10 pb-12">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-primary/50">
                cloud_upload
              </span>
              <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                <Label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                >
                  <span>Upload a file</span>
                  <Input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </Label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                PDF, DOCX, PNG, JPG up to 10MB
              </p>
               {fileName && <p className="text-sm text-green-600 mt-2">{fileName}</p>}
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Achievement"}
          </Button>
        </div>
      </form>
    </div>
  )
}
