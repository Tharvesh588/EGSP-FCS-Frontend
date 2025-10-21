
"use client"

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ConversationThread } from "@/components/conversation-thread";
import { FileUpload } from "@/components/file-upload";
import { io, type Socket } from "socket.io-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type NegativeCredit = {
  _id: string;
  title: string;
  createdAt: string;
  points: number;
  notes: string;
  proofUrl?: string;
  appeal?: {
    by: string;
    reason: string;
    createdAt: string;
    status: 'pending' | 'accepted' | 'rejected';
  }
  status: 'pending' | 'approved' | 'rejected' | 'appealed';
};

type Appeal = NegativeCredit & {
  appeal: NonNullable<NegativeCredit['appeal']>;
};

type Conversation = {
  _id: string;
};

export default function AppealsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isStartingConversation, setIsStartingConversation] = useState(false);

  const facultyId = searchParams.get('uid');
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const socketRef = useRef<Socket | null>(null);

  const fetchAppeals = async () => {
      setIsLoading(true);
      if (!token) {
        toast({ variant: "destructive", title: "Authentication Error" });
        setIsLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams({ 
            limit: '200', 
            sort: '-appeal.createdAt',
            status: 'appealed', // We only want items that have been appealed
        });
        
        if (filter !== 'all') {
            // This assumes the backend can filter by appeal.status.
            // If not, client-side filtering is needed after fetching all 'appealed' credits.
            // Let's assume the backend supports it for now.
             params.append('appealStatus', filter);
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/credits/negative?${params.toString()}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
             try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message || "Server returned an error");
            } catch (e) {
                throw new Error(`Failed to fetch data. Status: ${response.status}.`);
            }
        }

        const resData = await response.json();

        if (resData.success) {
            const fetchedAppeals = resData.items.filter((credit: NegativeCredit): credit is Appeal => 
              !!credit.appeal
            );
            
            // Apply client-side filtering if backend doesn't support appealStatus
            const finalAppeals = filter === 'all' 
                ? fetchedAppeals
                : fetchedAppeals.filter(a => a.appeal.status === filter);


            setAppeals(finalAppeals);

            if (finalAppeals.length > 0) {
              const currentSelection = finalAppeals.find((item: Appeal) => item._id === selectedAppeal?._id) || finalAppeals[0];
              setSelectedAppeal(currentSelection);
            } else {
              setSelectedAppeal(null);
            }
        } else {
            throw new Error(resData.message || "Failed to fetch data.");
        }
      } catch (error: any) {
          toast({ variant: "destructive", title: "Failed to fetch data", description: error.message });
          setAppeals([]);
      } finally {
          setIsLoading(false);
      }
  };
  
  useEffect(() => {
    if (facultyId) {
        fetchAppeals();
    }
  }, [facultyId, filter, toast]);
  
  useEffect(() => {
    setActiveConversation(null);
  }, [selectedAppeal]);

  
  const handleStartConversation = async () => {
    if (!selectedAppeal || !facultyId) return;
    setIsStartingConversation(true);

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/conversations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                creditId: selectedAppeal._id,
                participantIds: [facultyId]
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message || "Server returned an error");
            } catch (e) {
               throw new Error("Could not start conversation. Invalid response from server.");
            }
       }

        const data = await response.json();
        if (data.conversation) {
            setActiveConversation(data.conversation);
        } else {
            throw new Error(data.message || "Failed to start conversation.");
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Conversation Error", description: error.message });
    } finally {
        setIsStartingConversation(false);
    }
  };

  const getStatusVariant = (status: Appeal['appeal']['status']) => {
      switch (status) {
          case 'accepted': return 'default';
          case 'rejected': return 'destructive';
          case 'pending': return 'secondary';
          default: return 'secondary';
      }
  };
  
  const getStatusColor = (status: Appeal['appeal']['status']) => {
      switch (status) {
          case 'accepted': return 'bg-green-100 text-green-800';
          case 'rejected': return 'bg-red-100 text-red-800';
          case 'pending': return 'bg-yellow-100 text-yellow-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };
  
  const getTimelineIcon = (status: Appeal['appeal']['status'] | 'submitted', currentStatus: Appeal['appeal']['status']) => {
      const timelineHierarchy = ['submitted', 'pending', 'accepted', 'rejected'];
      const itemIndex = status === 'submitted' ? 0 : timelineHierarchy.indexOf(status);
      const currentIndex = timelineHierarchy.indexOf(currentStatus);

      let icon = 'radio_button_unchecked';
      let color = 'text-muted-foreground';

      if (itemIndex < currentIndex || (itemIndex === 0 && currentIndex > 0) ) {
          icon = 'check_circle';
          color = 'text-primary';
      } else if (itemIndex === currentIndex) {
          if (currentStatus === 'accepted') {
            icon = 'check_circle';
            color = 'text-green-600';
          } else if (currentStatus === 'rejected') {
            icon = 'cancel';
            color = 'text-destructive';
          } else {
            icon = 'timelapse';
            color = 'text-primary animate-pulse';
          }
      }
      
      if(status === 'submitted') {
          icon = 'check_circle';
          color = 'text-primary';
      }


      return <span className={`material-symbols-outlined ${color}`}>{icon}</span>;
  }

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">My Appeals</h2>
            <p className="text-muted-foreground">Review and track your submitted appeals.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b pb-2">
            <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>All</Button>
            <Button variant={filter === 'pending' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('pending')}>Pending</Button>
            <Button variant={filter === 'accepted' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('accepted')}>Accepted</Button>
            <Button variant={filter === 'rejected' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('rejected')}>Rejected</Button>
        </div>

        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Remark Title</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">View</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center">Loading appeals...</TableCell></TableRow>
                ) : appeals.length > 0 ? (
                    appeals.map((appeal) => (
                    <TableRow
                        key={appeal._id}
                        className={`cursor-pointer ${selectedAppeal?._id === appeal._id ? "bg-primary/5" : ""}`}
                        onClick={() => setSelectedAppeal(appeal)}
                    >
                        <TableCell className="font-medium">{appeal.title}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(appeal.appeal.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(appeal.appeal.status)} className={getStatusColor(appeal.appeal.status)}>
                                {appeal.appeal.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <span className="material-symbols-outlined text-muted-foreground">chevron_right</span>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow><TableCell colSpan={4} className="text-center h-24">No appeals found for this filter.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <aside className="lg:col-span-1 bg-card rounded-lg border flex flex-col p-6 gap-6 h-fit sticky top-6">
        {selectedAppeal ? (
            <div className="flex flex-col h-full">
                <h3 className="text-xl font-bold mb-4">Appeal Details</h3>
                
                {activeConversation ? (
                    <ConversationThread conversationId={activeConversation._id} conversationDetails={{_id: activeConversation._id, participants: [], credit: {title: selectedAppeal.title}}} socket={socketRef.current} currentUserId={facultyId} onBack={() => setActiveConversation(null)} />
                ) : (
                    <>
                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="pb-2">
                                <CardTitle className="text-base">Original Remark</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <p className="font-semibold">{selectedAppeal.title} ({selectedAppeal.points} points)</p>
                                    <p className="text-muted-foreground italic">"{selectedAppeal.notes}"</p>
                                    <p className="text-xs text-muted-foreground">Issued on: {new Date(selectedAppeal.createdAt).toLocaleString()}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                <CardTitle className="text-base">Your Appeal</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <p className="text-muted-foreground italic">"{selectedAppeal.appeal.reason}"</p>
                                    <p className="text-xs text-muted-foreground">Submitted on: {new Date(selectedAppeal.appeal.createdAt).toLocaleString()}</p>
                                </CardContent>
                            </Card>

                        </div>

                        <div className="border-t pt-6 mt-6">
                          <h4 className="font-semibold mb-4">Appeal Timeline</h4>
                          <div className="relative pl-4 space-y-6">
                                <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-border -translate-x-1/2"></div>
                                <div className="relative flex items-start gap-4">
                                  {getTimelineIcon('submitted', selectedAppeal.appeal.status)}
                                  <div>
                                    <p className="font-medium">Appeal Submitted</p>
                                    <p className="text-sm text-muted-foreground">{new Date(selectedAppeal.appeal.createdAt).toDateString()}</p>
                                  </div>
                                </div>
                                <div className="relative flex items-start gap-4">
                                   {getTimelineIcon('pending', selectedAppeal.appeal.status)}
                                  <div>
                                    <p className="font-medium">Under Review</p>
                                     {(selectedAppeal.appeal.status === 'pending' || selectedAppeal.appeal.status === 'accepted' || selectedAppeal.appeal.status === 'rejected') && <p className="text-sm text-muted-foreground">Your appeal is being reviewed.</p>}
                                  </div>
                                </div>
                                <div className="relative flex items-start gap-4">
                                   {getTimelineIcon(selectedAppeal.appeal.status, selectedAppeal.appeal.status)}
                                  <div>
                                    <p className="font-medium">Decision</p>
                                     {(selectedAppeal.appeal.status === 'accepted' || selectedAppeal.appeal.status === 'rejected') && (
                                        <p className="text-sm text-muted-foreground">
                                            {selectedAppeal.appeal.status === 'accepted' ? 'Your appeal was approved.' : 'Your appeal was rejected.'}
                                        </p>
                                     )}
                                  </div>
                                </div>
                          </div>
                        </div>
                    </>
                )}
                
                <CardFooter className="mt-auto pt-6">
                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={handleStartConversation}
                        disabled={isStartingConversation || !!activeConversation}
                    >
                        <span className="material-symbols-outlined mr-2">forum</span>
                        {isStartingConversation ? "Starting..." : (activeConversation ? "Conversation Active" : "Discuss with Admin")}
                    </Button>
                </CardFooter>
            </div>
        ) : (
            <div className="bg-background p-4 rounded-lg flex items-center justify-center text-center text-muted-foreground h-full">
                <p>{isLoading ? "Loading..." : "Select an appeal to view details"}</p>
            </div>
        )}
      </aside>
    </div>
  )
}

    