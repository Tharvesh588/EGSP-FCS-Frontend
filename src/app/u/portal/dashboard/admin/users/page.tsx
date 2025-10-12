// This file is the new location for src/app/(app)/admin/users/page.tsx
"use client"

import { useState, useEffect } from "react";
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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";
import { colleges } from "@/lib/colleges";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

type Departments = {
    [key: string]: string[];
};


export default function FacultyAccountsPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<Departments>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (college && colleges[college as keyof typeof colleges]) {
      setDepartments(colleges[college as keyof typeof colleges]);
      setDepartment(""); // Reset department when college changes
    } else {
      setDepartments({});
    }
  }, [college]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const adminToken = localStorage.getItem("token");
    if (!adminToken) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Admin token not found. Please log in again.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          college,
          department, // API might not support this yet, but we include it.
          role: "faculty",
        }),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Failed to create account.");
      }

      toast({
        title: "Account Created",
        description: `Faculty account for ${name} has been successfully created.`,
      });

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setCollege("");
      setDepartment("");
      // Optionally, refresh the list of users
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <form className="space-y-6" onSubmit={handleCreateAccount}>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-foreground mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <Input
                id="password"
                placeholder="Enter a temporary password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-sm font-medium text-foreground mb-2"
                  htmlFor="college"
                >
                  College
                </label>
                <Select onValueChange={setCollege} value={college}>
                  <SelectTrigger id="college">
                    <SelectValue placeholder="Select college" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(colleges).map((collegeName) => (
                      <SelectItem key={collegeName} value={collegeName}>
                        {collegeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-foreground mb-2"
                  htmlFor="department"
                >
                  Department
                </label>
                <Select onValueChange={setDepartment} value={department} disabled={!college}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(departments).map(([group, courses]) => (
                        <SelectGroup key={group}>
                            <SelectLabel>{group}</SelectLabel>
                            {courses.map(course => (
                                <SelectItem key={course} value={course}>{course}</SelectItem>
                            ))}
                        </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

    