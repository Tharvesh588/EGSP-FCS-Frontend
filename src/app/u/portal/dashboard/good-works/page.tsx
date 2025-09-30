// This file is the new location for src/app/(app)/good-works/page.tsx
"use client"

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

const goodWorks = [
  {
    date: "2024-07-26",
    title: "Publication in International Journal",
    description:
      "Published a research paper on renewable energy in a peer-reviewed journal.",
    category: "Research",
    status: "Approved",
  },
  {
    date: "2024-07-20",
    title: "Conference Presentation",
    description:
      "Presented a paper on AI applications in engineering at the National Conference.",
    category: "Presentation",
    status: "Pending",
  },
  {
    date: "2024-07-15",
    title: "Workshop Conducted",
    description:
      "Conducted a workshop on advanced programming techniques for students.",
    category: "Workshop",
    status: "Approved",
  },
  {
    date: "2024-07-10",
    title: "Patent Application",
    description: "Filed a patent application for an innovative engineering solution.",
    category: "Innovation",
    status: "Rejected",
  },
  {
    date: "2024-07-05",
    title: "Book Chapter Contribution",
    description:
      "Contributed a chapter to a book on sustainable engineering practices.",
    category: "Publication",
    status: "Approved",
  },
  {
    date: "2024-06-30",
    title: "Guest Lecture",
    description:
      "Delivered a guest lecture at another institution on emerging technologies.",
    category: "Lecture",
    status: "Pending",
  },
]

export default function GoodWorksPage() {
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
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="bg-primary/10 text-primary">All</Button>
          <Button variant="ghost">Pending</Button>
          <Button variant="ghost">Approved</Button>
          <Button variant="ghost">Rejected</Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-1/3">Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goodWorks.map((work, index) => (
                <TableRow key={index}>
                  <TableCell className="text-muted-foreground">{work.date}</TableCell>
                  <TableCell className="font-medium text-foreground">{work.title}</TableCell>
                  <TableCell className="max-w-sm truncate text-muted-foreground">{work.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{work.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        work.status === "Approved"
                          ? "default"
                          : work.status === "Pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className={
                        work.status === "Approved" ? "bg-green-100 text-green-800" :
                        work.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }
                    >
                      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                        work.status === "Approved" ? "bg-green-500" :
                        work.status === "Pending" ? "bg-yellow-500" :
                        "bg-red-500"
                      }`}></span>
                      {work.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="link" className="p-0 h-auto text-primary">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
            <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">6</span> of <span className="font-medium text-foreground">10</span> results
            </div>
            <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-lg shadow-sm">
                <Button variant="outline" size="icon" className="rounded-r-none h-8 w-8">
                    <span className="material-symbols-outlined h-5 w-5"> chevron_left </span>
                </Button>
                <Button variant="outline" size="icon" className="rounded-none h-8 w-8 bg-primary/10 border-primary text-primary">1</Button>
                <Button variant="outline" size="icon" className="rounded-none h-8 w-8">2</Button>
                <Button variant="outline" size="icon" className="rounded-l-none h-8 w-8">
                    <span className="material-symbols-outlined h-5 w-5"> chevron_right </span>
                </Button>
            </nav>
        </div>
      </div>
    </div>
  )
}
