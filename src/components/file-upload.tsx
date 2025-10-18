"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';

type FileUploadProps = {
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
};

export function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFileName(file.name);
      onFileSelect(file);
    } else {
      setFileName("");
      onFileSelect(null);
    }
  };

  return (
    <label
      htmlFor="file-upload"
      className="mt-2 flex cursor-pointer justify-center rounded-xl border-2 border-dashed border-border px-6 pt-10 pb-12 transition-colors hover:border-primary/50"
    >
      <div className="text-center">
        <span className="material-symbols-outlined text-5xl text-primary/50">
          cloud_upload
        </span>
        <div className="mt-4 flex justify-center text-sm leading-6 text-muted-foreground">
            <span className="font-semibold text-primary">Upload a file</span>
            <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          PDF, DOCX, PNG, JPG up to 10MB
        </p>
        <p className="text-xs leading-5 text-muted-foreground/80 mt-1">
          For multiple files, please combine them into a single .zip archive.
        </p>
        {fileName && <p className="text-sm text-green-600 mt-2">{fileName}</p>}
      </div>
      <Input
        id="file-upload"
        name="file-upload"
        type="file"
        className="sr-only"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </label>
  );
}
