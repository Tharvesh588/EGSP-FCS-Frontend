// This file is the new location for src/app/(app)/appeals/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const negativeReports = [
  {
    id: 1,
    remark: "Incomplete Course Coverage",
    status: "Pending",
    date: "2024-07-26",
  },
  {
    id: 2,
    remark: "Poor Student Feedback",
    status: "Rejected",
    date: "2024-07-20",
  },
  {
    id: 3,
    remark: "Late Submission of Grades",
    status: "Accepted",
    date: "2024-07-15",
  },
]

export default function AppealsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Appeals</h2>
          <p className="text-muted-foreground mt-1">
            View and manage your appeals against negative reports.
          </p>
        </div>
        <Button>
          <span className="material-symbols-outlined -ml-1 mr-2 h-5 w-5">add</span>
          <span>Create Appeal</span>
        </Button>
      </div>
      <div className="space-y-12">
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">
            Negative Reports
          </h3>
          <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Remark</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {negativeReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium text-foreground">
                        {report.remark}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.status === "Pending"
                              ? "bg-primary/10 text-primary"
                              : report.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {report.status}
                        </span>
                      </TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="link" className="text-primary">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
        <section>
          <h3 className="text-xl font-bold text-foreground mb-6">
            Appeal Status Timeline
          </h3>
          <div className="relative pl-8">
            <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-border"></div>
            <div className="relative mb-8">
              <div className="absolute left-0 top-1.5 flex items-center justify-center">
                <div className="flex size-6 items-center justify-center rounded-full bg-primary text-white">
                  <span className="material-symbols-outlined text-base">send</span>
                </div>
              </div>
              <div className="ml-8">
                <p className="font-semibold text-foreground">Appeal Submitted</p>
                <p className="text-sm text-muted-foreground">2024-07-27</p>
              </div>
            </div>
            <div className="relative mb-8">
              <div className="absolute left-0 top-1.5 flex items-center justify-center">
                <div className="flex size-6 items-center justify-center rounded-full bg-primary text-white">
                    <span className="material-symbols-outlined text-base">search</span>
                </div>
              </div>
              <div className="ml-8">
                <p className="font-semibold text-foreground">Under Review</p>
                <p className="text-sm text-muted-foreground">2024-07-28</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute left-0 top-1.5 flex items-center justify-center">
                <div className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                </div>
              </div>
              <div className="ml-8">
                <p className="font-semibold text-muted-foreground">Decision Pending</p>
                <p className="text-sm text-muted-foreground">Awaiting final decision</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
