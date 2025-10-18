"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/file-upload";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreditTitle } from "@/hooks/use-credit-titles";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

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

export type AchievementFormData = {
  title: string;
  creditTitleId: string;
  academicYear: string;
  proof: File;
};

type AchievementFormProps = {
  creditTitles: CreditTitle[];
  onSubmit: (formData: AchievementFormData) => Promise<void>;
  isLoading: boolean;
};

export function AchievementForm({ creditTitles, onSubmit, isLoading }: AchievementFormProps) {
  const [title, setTitle] = useState("");
  const [selectedCreditTitleId, setSelectedCreditTitleId] = useState("");
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [proof, setProof] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCreditTitle = useMemo(() => 
    creditTitles.find(ct => ct._id === selectedCreditTitleId),
    [creditTitles, selectedCreditTitleId]
  );
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Achievement title is required.";
    if (!selectedCreditTitleId) newErrors.category = "Category is required.";
    if (!academicYear) newErrors.academicYear = "Academic year is required.";
    if (!proof) newErrors.proof = "A proof document is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !validate()) return;
    
    onSubmit({
      title,
      creditTitleId: selectedCreditTitleId,
      academicYear,
      proof: proof!,
    });
  };

  if (!creditTitles.length && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {errors.form && <p className="text-sm font-medium text-destructive">{errors.form}</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select onValueChange={setSelectedCreditTitleId} value={selectedCreditTitleId} disabled={isLoading}>
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
          {errors.category && <p className="text-sm font-medium text-destructive mt-1">{errors.category}</p>}
        </div>
        <div>
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            className="mt-1 bg-muted"
            value={selectedCreditTitle?.points || ""}
            readOnly
          />
        </div>
      </div>
       <div>
        <Label htmlFor="title">Achievement Title</Label>
        <Input
          id="title"
          className="mt-1"
          placeholder="e.g., 'Published a paper on AI...'"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
        {errors.title && <p className="text-sm font-medium text-destructive mt-1">{errors.title}</p>}
      </div>
      <div>
          <Label htmlFor="academicYear">Academic Year</Label>
          <Select onValueChange={setAcademicYear} value={academicYear} disabled={isLoading}>
              <SelectTrigger id="academicYear" className="mt-1">
                  <SelectValue placeholder="Select Academic Year" />
              </SelectTrigger>
              <SelectContent>
                  {generateYearOptions().map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
              </SelectContent>
          </Select>
          {errors.academicYear && <p className="text-sm font-medium text-destructive mt-1">{errors.academicYear}</p>}
      </div>
      <div>
        <Label>Attachments</Label>
        <FileUpload onFileSelect={setProof} disabled={isLoading} />
        {errors.proof && <p className="text-sm font-medium text-destructive mt-1">{errors.proof}</p>}
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading || !!errors.form}>
          {isLoading ? "Submitting..." : "Submit Achievement"}
        </Button>
      </div>
    </form>
  )
}
