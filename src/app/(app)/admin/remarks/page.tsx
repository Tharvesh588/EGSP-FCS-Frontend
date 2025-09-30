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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

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
          <form className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-muted-foreground"
                htmlFor="faculty"
              >
                Faculty Member
              </label>
              <Select>
                <SelectTrigger id="faculty">
                  <SelectValue placeholder="Select Faculty Member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dr-priya-sharma">
                    Dr. Priya Sharma
                  </SelectItem>
                  <SelectItem value="prof-arjun-verma">
                    Prof. Arjun Verma
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-muted-foreground"
                htmlFor="severity"
              >
                Severity
              </label>
              <Select>
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-muted-foreground"
                htmlFor="description"
              >
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Enter Description"
                rows={4}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-muted-foreground"
              >
                Upload Document
              </label>
              <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-border px-6 pt-5 pb-6">
                <div className="space-y-1 text-center">
                  <span className="material-symbols-outlined text-4xl text-muted-foreground/50">
                    {" "}
                    cloud_upload{" "}
                  </span>
                  <div className="flex text-sm text-muted-foreground">
                    <label
                      className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                      htmlFor="file-upload"
                    >
                      <span>Upload a file</span>
                      <Input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-muted-foreground/80">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Submit Remark</Button>
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
