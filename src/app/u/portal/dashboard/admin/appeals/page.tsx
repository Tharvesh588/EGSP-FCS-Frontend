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
import { useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { io, type Socket } from "socket.io-client"
import { Badge } from "@/components/ui/badge"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type Appeal = {
  _id: string;
  faculty: {
    _id: string;
    name: string;
    department: string;
  };
  credit: {
    _id: string;
    title: string;
    notes: string;
  };
  reason: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
};


export default function AppealReviewPage() {
  const { toast } = useToast();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [comments, setComments] = useState("");

  const fetchAppeals = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/credits/positive?limit=200`, { // Fetch all credits
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || "Server returned an error");
        } catch (e) {
          throw new Error(`Failed to fetch appeals. The server responded with an error: ${response.status}.`);
        }
      }

      const data = await response.json();
      if (data.success) {
        const fetchedAppeals = data.items
          .filter((item: any) => item.status === 'appealed' && item.appeal) // Filter for appealed credits
          .map((item: any) => ({
            _id: item._id,
            faculty: {
              _id: item.faculty._id,
              name: item.faculty.name,
              department: item.faculty.department,
            },
            credit: {
              _id: item._id,
              title: item.title,
              notes: item.notes,
            },
            reason: item.appeal?.reason || 'No reason provided',
            status: item.appeal?.status || 'pending',
            createdAt: item.appeal?.createdAt || item.createdAt,
          }));

        setAppeals(fetchedAppeals);
        if (fetchedAppeals.length > 0) {
          setSelectedAppeal(fetchedAppeals[0]);
        } else {
          setSelectedAppeal(null);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch appeals');
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error fetching appeals', description: err.message });
    }
  }

  useEffect(() => {
    fetchAppeals();
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(API_BASE_URL, {
        auth: { token },
        transports: ['websocket']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
        console.log('Admin socket connected for appeals');
    });

    socket.on('admin:appealNotification', (newAppeal: any) => {
        toast({
            title: "New Appeal Submitted",
            description: `${newAppeal.facultySnapshot.name} has submitted an appeal for "${newAppeal.title}".`,
        });
        fetchAppeals();
    });
    
    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
    });

    return () => {
        socket.disconnect();
    };
  }, [toast]);
  
  const handleDecision = async (decision: 'accepted' | 'rejected') => {
    if (!selectedAppeal) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    
    // In a real app, this would be a PUT request to an endpoint like:
    // `/api/v1/admin/appeals/${selectedAppeal._id}/status`
    // with a body of { status: decision, notes: comments }
    
    console.log(`Making decision: ${decision} for appeal on credit ${selectedAppeal.credit._id}`);
    console.log("With rationale:", comments);

    toast({ title: "Decision Submitted", description: `The appeal has been marked as ${decision}.`});
    
    // Optimistic update: Remove from the list and select the next one
    setAppeals(prev => prev.filter(a => a._id !== selectedAppeal._id));
    const currentIndex = appeals.findIndex(a => a._id === selectedAppeal._id);
    const nextAppeal = appeals[currentIndex + 1] || appeals[0] || null;
    setSelectedAppeal(nextAppeal === selectedAppeal ? null : nextAppeal);
    setComments("");
  }
  
  const getStatusColor = (status: Appeal['status']) => {
      switch (status) {
          case 'accepted': return 'bg-green-100 text-green-800';
          case 'rejected': return 'bg-red-100 text-red-800';
          case 'pending': return 'bg-yellow-100 text-yellow-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };


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
            Pending Appeals ({appeals.filter(a => a.status === 'pending').length})
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appeals.map((appeal) => (
                  <TableRow 
                    key={appeal._id} 
                    className={`cursor-pointer ${selectedAppeal?._id === appeal._id ? "bg-primary/10" : ""}`}
                    onClick={() => setSelectedAppeal(appeal)}
                  >
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {appeal.faculty.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {appeal.faculty.department}
                      </div>
                    </TableCell>
                    <TableCell>{appeal.credit.title}</TableCell>
                    <TableCell>{new Date(appeal.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(appeal.status)}>
                        {appeal.status}
                      </Badge>
                    </TableCell>
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
      </div>
      <aside className="w-full lg:w-1/3 lg:max-w-md">
        <div className="sticky top-8 space-y-6">
          {selectedAppeal ? (
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-4 border-b pb-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedAppeal.faculty.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Appeal for: {selectedAppeal.credit.title} ({new Date(selectedAppeal.createdAt).toLocaleDateString()})
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <Tabs defaultValue="evidence">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="remark">Original Remark</TabsTrigger>
                  <TabsTrigger value="evidence">Faculty's Reason</TabsTrigger>
                </TabsList>
                <TabsContent value="remark" className="py-5">
                    <p className="text-sm text-muted-foreground italic">
                      "{selectedAppeal.credit.notes}"
                    </p>
                </TabsContent>
                <TabsContent value="evidence" className="py-5">
                   <p className="text-sm text-muted-foreground italic">
                     "{selectedAppeal.reason}"
                  </p>
                   {/* This should ideally link to the proof of the original credit */}
                   <Button variant="link" className="p-0 h-auto">View Original Document</Button>
                </TabsContent>
              </Tabs>
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-foreground">
                  Decision
                </h4>
                <div>
                    <Label
                    className="block text-sm font-medium text-muted-foreground"
                    htmlFor="comments"
                    >
                    Rationale
                    </Label>
                    <div className="mt-1">
                    <Textarea
                        id="comments"
                        name="comments"
                        placeholder="Add comments for your decision (optional)"
                        rows={3}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    type="button"
                    onClick={() => handleDecision('accepted')}
                  >
                    Accept Appeal
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    type="button"
                    onClick={() => handleDecision('rejected')}
                  >
                    Reject Appeal
                  </Button>
                </div>
              </div>
            </div>
          </div>
          ) : (
            <div className="bg-card p-6 rounded-lg shadow-sm text-center text-muted-foreground">
                <p>Select an appeal to review.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
