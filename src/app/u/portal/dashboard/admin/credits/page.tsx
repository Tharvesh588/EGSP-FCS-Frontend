// This file is the new location for src/app/(app)/admin/credits/page.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type CreditTitle = {
  _id: string;
  title: string;
  points: number;
  type: 'positive' | 'negative';
  description: string;
  isActive: boolean;
};

export default function ManageCreditTitlesPage() {
  const { toast } = useToast();
  // Form state
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState("");
  const [type, setType] = useState<'positive' | 'negative' | ''>('');
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Table state
  const [creditTitles, setCreditTitles] = useState<CreditTitle[]>([]);
  const [isLoadingTitles, setIsLoadingTitles] = useState(true);

  const fetchCreditTitles = async () => {
    setIsLoadingTitles(true);
    const adminToken = localStorage.getItem("token");
    if (!adminToken) {
      toast({ variant: "destructive", title: "Authentication Error" });
      setIsLoadingTitles(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/credit-title`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();
      if (data.success) {
        setCreditTitles(data.items);
      } else {
        throw new Error(data.message || "Failed to fetch credit titles");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      setCreditTitles([]);
    } finally {
      setIsLoadingTitles(false);
    }
  };

  useEffect(() => {
    fetchCreditTitles();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !points || !type || !description) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill out all fields.",
      });
      return;
    }
    setIsLoading(true);

    const adminToken = localStorage.getItem("token");
    if (!adminToken) {
      toast({ variant: "destructive", title: "Authentication Error" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/credit-title`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title,
            points: Number(points),
            type,
            description,
        }),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Failed to create credit title.");
      }

      toast({
        title: "Credit Title Created",
        description: "The new credit title has been successfully added.",
      });
      
      // Reset form and refresh list
      setTitle("");
      setPoints("");
      setType("");
      setDescription("");
      fetchCreditTitles();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Manage Credit Titles
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage credit types for faculty achievements and remarks.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-6 rounded-lg bg-card p-6 shadow-sm lg:col-span-1">
          <h2 className="text-xl font-semibold text-foreground">
            Create New Credit Title
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-muted-foreground" htmlFor="title">Title</label>
                <Input id="title" placeholder="e.g., 'Research Paper in Q1 Journal'" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground" htmlFor="points">Points</label>
                    <Input id="points" type="number" placeholder="e.g., 10 or -5" value={points} onChange={(e) => setPoints(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground" htmlFor="type">Type</label>
                    <Select value={type} onValueChange={(value) => setType(value as any)}>
                        <SelectTrigger id="type">
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="description">Description</label>
              <Textarea id="description" placeholder="Enter a brief description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Credit Title"}
              </Button>
            </div>
          </form>
        </div>
        <div className="space-y-6 rounded-lg bg-card p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-semibold text-foreground">
            Existing Credit Titles
          </h2>
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingTitles ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">Loading credit titles...</TableCell>
                    </TableRow>
                ) : creditTitles.length > 0 ? (
                    creditTitles.map((ct) => (
                        <TableRow key={ct._id}>
                            <TableCell className="font-medium text-foreground">{ct.title}</TableCell>
                            <TableCell className="font-semibold">{ct.points}</TableCell>
                            <TableCell>
                                <Badge variant={ct.type === 'positive' ? 'default' : 'destructive'} className={ct.type === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {ct.type}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{ct.description}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">No credit titles found.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
