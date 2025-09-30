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
import { Input } from "@/components/ui/input"
import React from "react"

const submissions = [
  {
    id: 1,
    faculty: "Dr. Arun Kumar",
    department: "Computer Science",
    date: "2024-07-26",
    status: "Pending",
    description: "Published a research paper in an international conference.",
    document: "research_paper.pdf",
  },
  {
    id: 2,
    faculty: "Prof. Priya Sharma",
    department: "Electrical Engineering",
    date: "2024-07-25",
    status: "Pending",
    description: "Conducted a workshop for students.",
    document: "workshop_report.pdf",
  },
  {
    id: 3,
    faculty: "Mr. Rajesh Verma",
    department: "Mechanical Engineering",
    date: "2024-07-24",
    status: "Pending",
    description: "Filed a patent for a new device.",
    document: "patent_filing.pdf",
  },
  {
    id: 4,
    faculty: "Ms. Neha Kapoor",
    department: "Civil Engineering",
    date: "2024-07-23",
    status: "Approved",
    description: "Received a grant for a research project.",
    document: "grant_approval.pdf",
  },
  {
    id: 5,
    faculty: "Dr. Suresh Rao",
    department: "Electronics and Communication",
    date: "2024-07-22",
    status: "Rejected",
    description: "Attended a faculty development program.",
    document: "fdp_certificate.pdf",
  },
]

export default function ReviewSubmissionsPage() {
    const [selectedSubmission, setSelectedSubmission] = React.useState(submissions[0]);

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-auto">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Good Works Submissions
            </h2>
            <p className="text-muted-foreground">
              Review and process faculty submissions for good works.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <span className="material-symbols-outlined mr-2 text-base">
                filter_list
              </span>
              Filter
            </Button>
            <Button variant="outline">
              <span className="material-symbols-outlined mr-2 text-base">
                swap_vert
              </span>
              Sort
            </Button>
          </div>
        </div>
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">View</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow
                    key={submission.id}
                    className={`cursor-pointer ${selectedSubmission?.id === submission.id ? "bg-primary/10" : ""}`}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <TableCell className="font-medium">
                      {submission.faculty}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {submission.department}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {submission.date}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          submission.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : submission.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {submission.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="material-symbols-outlined text-muted-foreground">
                        chevron_right
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <aside className="lg:col-span-1 bg-card rounded-lg border flex flex-col p-6 gap-6 h-fit sticky top-6">
        {selectedSubmission ? (
            <>
                <h3 className="text-xl font-bold">Submission Details</h3>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-muted-foreground">
                    Faculty
                    </label>
                    <p className="font-semibold">{selectedSubmission.faculty}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-muted-foreground">
                    Department
                    </label>
                    <p>{selectedSubmission.department}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-muted-foreground">
                    Submission Date
                    </label>
                    <p>{selectedSubmission.date}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-muted-foreground">
                    Description
                    </label>
                    <p>{selectedSubmission.description}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-muted-foreground">
                    Supporting Document
                    </label>
                    <a className="flex items-center gap-2 text-primary hover:underline" href="#">
                    <span className="material-symbols-outlined">attach_file</span>
                    <span>{selectedSubmission.document}</span>
                    </a>
                </div>
                <div className="border-t pt-6 flex flex-col gap-4">
                    <label className="text-sm font-medium text-muted-foreground" htmlFor="credit-value">
                        Assign Credit Value
                    </label>
                    <Input id="credit-value" placeholder="e.g., 10" type="number" />
                    <div className="flex gap-3">
                        <Button className="flex-1">
                            <span className="material-symbols-outlined mr-2">check_circle</span>
                            Approve
                        </Button>
                        <Button variant="outline" className="flex-1">
                            <span className="material-symbols-outlined mr-2">cancel</span>
                            Reject
                        </Button>
                    </div>
                </div>
            </>
        ) : (
            <div className="bg-background p-4 rounded-lg flex items-center justify-center text-center text-muted-foreground h-full">
                <p>Select a submission to view details</p>
            </div>
        )}
      </aside>
    </div>
  )
}
