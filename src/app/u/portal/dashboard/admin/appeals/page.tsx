// This file is the new location for src/app/(app)/admin/appeals/page.tsx
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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const appeals = [
  {
    id: 1,
    faculty: {
      name: "Dr. Priya Sharma",
      department: "Computer Science",
    },
    activity: "Research Paper",
    date: "2024-07-26",
    status: "Pending",
  },
  {
    id: 2,
    faculty: {
      name: "Prof. Arjun Verma",
      department: "Mechanical Engineering",
    },
    activity: "Workshop Conducted",
    date: "2024-07-25",
    status: "Pending",
  },
  {
    id: 3,
    faculty: {
      name: "Ms. Neha Kapoor",
      department: "Electrical Engineering",
    },
    activity: "Conference Presentation",
    date: "2024-07-24",
    status: "Pending",
  },
]

const history = [
    {
        id: 1,
        faculty: {
            name: "Dr. Priya Sharma",
            department: "Computer Science",
        },
        activity: "Research Paper",
        date: "2024-07-20",
        status: "Approved",
    },
    {
        id: 2,
        faculty: {
            name: "Prof. Arjun Verma",
            department: "Mechanical Engineering",
        },
        activity: "Workshop Conducted",
        date: "2024-07-18",
        status: "Rejected",
    },
]

export default function AppealReviewPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-grow lg:w-2/3 space-y-8">
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-foreground">Appeal Review</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and process faculty appeals for credit adjustments.
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Pending Appeals ({appeals.length})
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appeals.map((appeal, index) => (
                  <TableRow key={appeal.id} className={index === 0 ? "bg-primary/10" : ""}>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {appeal.faculty.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {appeal.faculty.department}
                      </div>
                    </TableCell>
                    <TableCell>{appeal.activity}</TableCell>
                    <TableCell>{appeal.date}</TableCell>
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
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Appeal History
          </h3>
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Faculty</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Decision Date</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.map(item => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <div className="font-medium text-foreground">{item.faculty.name}</div>
                                <div className="text-sm text-muted-foreground">{item.faculty.department}</div>
                            </TableCell>
                            <TableCell>{item.activity}</TableCell>
                            <TableCell>{item.date}</TableCell>
                            <TableCell>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {item.status}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <aside className="w-full lg:w-1/3 lg:max-w-md">
        <div className="sticky top-8 space-y-6">
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-4 border-b pb-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Dr. Priya Sharma
                </h3>
                <p className="text-sm text-muted-foreground">
                  Appeal for: Research Paper (2024-07-26)
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <Tabs defaultValue="remark">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="remark">Original Remark</TabsTrigger>
                  <TabsTrigger value="evidence">Faculty Evidence</TabsTrigger>
                </TabsList>
                <TabsContent value="remark" className="py-5">
                    <p className="text-sm text-muted-foreground">
                    The research paper does not meet the required quality
                    standards for publication in a Tier 1 journal. The
                    methodology lacks rigor, and the results are not
                    sufficiently validated.
                  </p>
                </TabsContent>
                <TabsContent value="evidence" className="py-5">
                   <p className="text-sm text-muted-foreground">
                    Attached is the peer-review feedback and acceptance letter from the conference committee, which address the quality and validation of the work.
                  </p>
                   <Button variant="link" className="p-0 h-auto">View Document</Button>
                </TabsContent>
              </Tabs>
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-foreground">
                  Decision
                </h4>
                <div className="flex items-center gap-4">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    type="button"
                  >
                    Uphold Credits
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    type="button"
                  >
                    Restore Credits
                  </Button>
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-muted-foreground"
                  htmlFor="comments"
                >
                  Rationale
                </label>
                <div className="mt-1">
                  <Textarea
                    id="comments"
                    name="comments"
                    placeholder="Add comments (optional)"
                    rows={4}
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="button">
                  Submit Decision
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
