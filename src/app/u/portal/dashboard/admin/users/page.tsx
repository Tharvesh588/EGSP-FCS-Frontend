// This file is the new location for src/app/(app)/admin/users/page.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const facultyAccounts = [
  {
    name: "Dr. Anjali Sharma",
    email: "anjali.sharma@example.com",
    department: "Computer Science",
    credits: 1250,
    status: "Active",
  },
  {
    name: "Prof. Rajesh Verma",
    email: "rajesh.verma@example.com",
    department: "Electrical Engineering",
    credits: 980,
    status: "Active",
  },
  {
    name: "Ms. Priya Kapoor",
    email: "priya.kapoor@example.com",
    department: "Mechanical Engineering",
    credits: 1100,
    status: "Active",
  },
  {
    name: "Mr. Vikram Singh",
    email: "vikram.singh@example.com",
    department: "Civil Engineering",
    credits: 850,
    status: "Inactive",
  },
  {
    name: "Dr. Neha Gupta",
    email: "neha.gupta@example.com",
    department: "Electronics and Communication",
    credits: 1300,
    status: "Active",
  },
]

export default function FacultyAccountsPage() {
  return (
    <div className="flex-1 p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">
          Faculty Accounts
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage faculty accounts and their credit balances.
        </p>
      </header>
      <div className="bg-card p-6 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              search
            </span>
            <Input
              className="w-full pl-10 pr-4 py-2.5 bg-background rounded-lg focus:ring-2 focus:ring-primary transition"
              placeholder="Search by name or email"
              type="text"
            />
          </div>
          <div className="flex gap-4">
            <Select>
              <SelectTrigger className="w-full md:w-auto">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="ee">Electrical Engineering</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-auto">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facultyAccounts.map((account, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-foreground">
                    {account.name}
                  </TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.department}</TableCell>
                  <TableCell className="text-right">{account.credits}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        account.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {account.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="link" className="text-primary hover:underline">Impersonate</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="mt-10">
        <h3 className="text-2xl font-bold text-foreground mb-6">
          Create New Account
        </h3>
        <div className="bg-card p-6 rounded-xl shadow-sm max-w-2xl">
          <form className="space-y-6">
            <div>
              <label
                className="block text-sm font-medium text-foreground mb-2"
                htmlFor="name"
              >
                Name
              </label>
              <Input
                id="name"
                placeholder="Enter faculty name"
                type="text"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-foreground mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <Input
                id="email"
                placeholder="Enter faculty email"
                type="email"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-foreground mb-2"
                htmlFor="department"
              >
                Department
              </label>
              <Select>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="ee">Electrical Engineering</SelectItem>
                  <SelectItem value="me">Mechanical Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button
                type="submit"
                className="w-full sm:w-auto"
              >
                Create Account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
