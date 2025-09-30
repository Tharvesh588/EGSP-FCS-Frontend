// This file is the new location for src/app/(app)/good-works/submit/page.tsx
"use client"

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

export default function SubmitAchievementPage() {
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select>
              <SelectTrigger id="category" className="mt-1">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="research">Research Publication</SelectItem>
                <SelectItem value="conference">Conference Presentation</SelectItem>
                <SelectItem value="workshop">Workshop Attended</SelectItem>
                <SelectItem value="grant">Grant Received</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              className="mt-1"
              placeholder="e.g., 'Published a paper on AI...'"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            className="mt-1"
            placeholder="Provide a detailed description of your achievement..."
          />
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
                  />
                </Label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                PDF, DOCX, PNG, JPG up to 10MB
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit">Submit Achievement</Button>
        </div>
      </div>
    </div>
  )
}
