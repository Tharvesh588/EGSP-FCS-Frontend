"use client"

import { useState, useEffect } from "react";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type NegativeReport = {
  _id: string;
  title: string;
  createdAt: string;
  type: "positive" | "negative";
  points: number;
  notes: string;
  proof: string;
};

// Represents an appeal submitted by the faculty
type Appeal = {
    _id: string;
    facultyId: string;
    creditId: string;
    reason: string;
    status: 'pending' | 'under_review' | 'approved' | 'rejected';
    submittedAt: string;
    originalRemark: {
      title: string;
      points: number;
      notes: string;
      issuedAt: string;
    };
    decision?: {
        notes: string;
        decidedAt: string;
    }
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
  const [filter, setFilter] = useState<'all' | 'pending' | 'under_review' | 'approved' | 'rejected'>('all');

  const [isAppealDialogOpen, setIsAppealDialogOpen] = useState(false);
  const [appealableRemarks, setAppealableRemarks] = useState<NegativeReport[]>([]);
  const [selectedRemarkId, setSelectedRemarkId] = useState("");
  const [appealReason, setAppealReason] = useState("");
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isStartingConversation, setIsStartingConversation] = useState(false);


  const fetchAppeals = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast({ variant: "destructive", title: "Authentication Error" });
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/credits/appeals/faculty`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const resData = await response.json();

        if (resData.success) {
            setAppeals(resData.items);
            if (resData.items.length > 0) {
              const currentSelection = resData.items.find((item: Appeal) => item._id === selectedAppeal?._id) || resData.items[0];
              setSelectedAppeal(currentSelection);
            } else {
              setSelectedAppeal(null);
            }
        } else {
            throw new Error(resData.message || "Failed to fetch appeals.");
        }
      } catch (error: any) {
          toast({ variant: "destructive", title: "Failed to fetch appeals", description: error.message });
          setAppeals([]);
      } finally {
          setIsLoading(false);
      }
  };

  const fetchAppealableRemarks = async () => {
      const token = localStorage.getItem("token");
      const facultyId = searchParams.get('uid');
      if (!token || !facultyId) return;

       try {
        const response = await fetch(`${API_BASE_URL}/api/v1/credits/faculty/${facultyId}?type=negative&appealable=true`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const responseData = await response.json();
        if (responseData.success) {
          setAppealableRemarks(responseData.items);
        } else {
           throw new Error(responseData.message || "Failed to fetch appealable remarks.");
        }
      } catch(error: any) {
        toast({ variant: "destructive", title: "Failed to fetch remarks", description: error.message });
      }
  };
  
  useEffect(() => {
    if (searchParams.get('uid')) {
        fetchAppeals();
    }
  }, [searchParams]);

  useEffect(() => {
    if(isAppealDialogOpen) {
      fetchAppealableRemarks();
    }
  }, [isAppealDialogOpen]);
  
  useEffect(() => {
    setActiveConversation(null);
  }, [selectedAppeal]);


  const handleAppealSubmit = async () => {
    if (!selectedRemarkId || !appealReason) {
        toast({
            variant: "destructive",
            title: "Incomplete Form",
            description: "Please select a remark and provide a reason.",
        });
        return;
    }
    setIsSubmittingAppeal(true);
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/credits/${selectedRemarkId}/appeal`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ reason: appealReason }),
        });

        const responseData = await response.json();
        if (!response.ok || !responseData.success) {
            throw new Error(responseData.message || "Failed to submit appeal.");
        }
        
        toast({
            title: "Appeal Submitted",
            description: "Your appeal has been successfully submitted for review.",
        });

        setIsAppealDialogOpen(false);
        setSelectedRemarkId("");
        setAppealReason("");
        fetchAppeals(); // Refresh appeals list

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Appeal Failed",
            description: error.message,
        });
    } finally {
        setIsSubmittingAppeal(false);
    }
  };
  
  const handleStartConversation = async () => {
    if (!selectedAppeal) return;
    setIsStartingConversation(true);
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_BASE_URL}/api/conversations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ creditId: selectedAppeal.creditId }),
        });
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


  const filteredAppeals = appeals.filter(appeal => filter === 'all' || appeal.status.replace(/_/g, '-') === filter);
  
  const getStatusVariant = (status: Appeal['status']) => {
      switch (status) {
          case 'approved': return 'default';
          case 'rejected': return 'destructive';
          case 'pending': return 'secondary';
          case 'under_review': return 'secondary';
          default: return 'secondary';
      }
  };
  
  const getStatusColor = (status: Appeal['status']) => {
      switch (status) {
          case 'approved': return 'bg-green-100 text-green-800';
          case 'rejected': return 'bg-red-100 text-red-800';
          case 'pending': return 'bg-yellow-100 text-yellow-800';
          case 'under_review': return 'bg-blue-100 text-blue-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };
  
  const getTimelineIcon = (status: Appeal['status'] | 'submitted', currentStatus: Appeal['status']) => {
      const statusHierarchy = ['submitted', 'pending', 'under_review', 'approved', 'rejected'];
      const currentIndex = statusHierarchy.indexOf(currentStatus);
      const itemIndex = statusHierarchy.indexOf(status);

      let icon = 'radio_button_unchecked';
      let color = 'text-muted-foreground';

      if (itemIndex < currentIndex) {
          icon = 'check_circle';
          color = 'text-primary';
      } else if (itemIndex === currentIndex) {
          if (currentStatus === 'approved') {
            icon = 'check_circle';
            color = 'text-green-600';
          } else if (currentStatus === 'rejected') {
            icon = 'cancel';
            color = 'text-destructive';
          } else {
            icon = 'timelapse';
            color = 'text-primary animate-pulse';
          }
      } else if (currentStatus === 'approved' && status === 'approved') {
          icon = 'check_circle';
          color = 'text-green-600';
      } else if (currentStatus === 'rejected' && status === 'rejected') {
          icon = 'cancel';
          color = 'text-destructive';
      }

      const timelineStatus = status === 'approved' || status === 'rejected' ? 'decision' : status;
      const currentTimelineStatus = currentStatus === 'approved' || currentStatus === 'rejected' ? 'decision' : currentStatus;
      
      const timelineHierarchy = ['submitted', 'pending', 'under_review', 'decision'];
      const currentTimelineIndex = timelineHierarchy.indexOf(currentTimelineStatus);
      const itemTimelineIndex = timelineHierarchy.indexOf(timelineStatus);

      if (itemTimelineIndex < currentTimelineIndex) {
          icon = 'check_circle';
          color = 'text-primary';
      } else if (itemTimelineIndex === currentTimelineIndex) {
          if (currentStatus === 'approved') {
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
           <Button onClick={() => setIsAppealDialogOpen(true)}>
              <span className="material-symbols-outlined -ml-1 mr-2 h-5 w-5">add</span>
              Create Appeal
            </Button>
        </div>

        <div className="flex items-center gap-2 border-b pb-2">
            <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>All</Button>
            <Button variant={filter === 'pending' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('pending')}>Pending</Button>
            <Button variant={filter === 'under_review' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('under_review')}>Under Review</Button>
            <Button variant={filter === 'approved' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('approved')}>Approved</Button>
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
                ) : filteredAppeals.length > 0 ? (
                    filteredAppeals.map((appeal) => (
                    <TableRow
                        key={appeal._id}
                        className={`cursor-pointer ${selectedAppeal?._id === appeal._id ? "bg-primary/5" : ""}`}
                        onClick={() => setSelectedAppeal(appeal)}
                    >
                        <TableCell className="font-medium">{appeal.originalRemark.title}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(appeal.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(appeal.status)} className={getStatusColor(appeal.status)}>
                                {appeal.status.replace(/_/g, ' ')}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <span className="material-symbols-outlined text-muted-foreground">chevron_right</span>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow><TableCell colSpan={4} className="text-center">No appeals found for this filter.</TableCell></TableRow>
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
                    <ConversationThread conversationId={activeConversation._id} />
                ) : (
                    <>
                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="pb-2">
                                <CardTitle className="text-base">Original Remark</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <p className="font-semibold">{selectedAppeal.originalRemark.title} ({selectedAppeal.originalRemark.points} points)</p>
                                    <p className="text-muted-foreground italic">"{selectedAppeal.originalRemark.notes}"</p>
                                    <p className="text-xs text-muted-foreground">Issued on: {new Date(selectedAppeal.originalRemark.issuedAt).toLocaleString()}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                <CardTitle className="text-base">Your Appeal</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <p className="text-muted-foreground italic">"{selectedAppeal.reason}"</p>
                                    <p className="text-xs text-muted-foreground">Submitted on: {new Date(selectedAppeal.submittedAt).toLocaleString()}</p>
                                </CardContent>
                            </Card>

                            {selectedAppeal.decision?.notes && (
                            <Card>
                                <CardHeader className="pb-2">
                                <CardTitle className="text-base">Final Decision</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <p className="text-muted-foreground italic">"{selectedAppeal.decision.notes}"</p>
                                    <p className="text-xs text-muted-foreground">Decided on: {new Date(selectedAppeal.decision.decidedAt).toLocaleString()}</p>
                                </CardContent>
                            </Card>
                            )}
                        </div>

                        <div className="border-t pt-6 mt-6">
                          <h4 className="font-semibold mb-4">Appeal Timeline</h4>
                          <div className="relative pl-4 space-y-6">
                                <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-border -translate-x-1/2"></div>
                                <div className="relative flex items-start gap-4">
                                  {getTimelineIcon('submitted', selectedAppeal.status)}
                                  <div>
                                    <p className="font-medium">Appeal Submitted</p>
                                    <p className="text-sm text-muted-foreground">{new Date(selectedAppeal.submittedAt).toDateString()}</p>
                                  </div>
                                </div>
                                <div className="relative flex items-start gap-4">
                                   {getTimelineIcon('under_review', selectedAppeal.status)}
                                  <div>
                                    <p className="font-medium">Under Review</p>
                                     {(selectedAppeal.status === 'under_review' || selectedAppeal.status === 'approved' || selectedAppeal.status === 'rejected') && <p className="text-sm text-muted-foreground">Your appeal is being reviewed.</p>}
                                  </div>
                                </div>
                                <div className="relative flex items-start gap-4">
                                   {getTimelineIcon(selectedAppeal.status === 'approved' ? 'approved' : 'rejected', selectedAppeal.status)}
                                  <div>
                                    <p className="font-medium">Decision</p>
                                     {(selectedAppeal.status === 'approved' || selectedAppeal.status === 'rejected') && (
                                        <p className="text-sm text-muted-foreground">
                                            {selectedAppeal.status === 'approved' ? 'Your appeal was approved.' : 'Your appeal was rejected.'}
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

      <Dialog open={isAppealDialogOpen} onOpenChange={setIsAppealDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create an Appeal</DialogTitle>
            <DialogDescription>
              Select a negative remark you wish to appeal and provide your reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Negative Remark</label>
                <Select onValueChange={setSelectedRemarkId} value={selectedRemarkId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a remark to appeal" />
                    </SelectTrigger>
                    <SelectContent>
                        {appealableRemarks.length > 0 ? (
                           appealableRemarks.map(remark => (
                            <SelectItem key={remark._id} value={remark._id}>
                                {remark.title} ({new Date(remark.createdAt).toLocaleDateString()})
                            </SelectItem>
                           ))
                        ) : (
                           <div className="p-4 text-sm text-muted-foreground text-center">No recent remarks eligible for appeal.</div>
                        )}
                    </SelectContent>
                </Select>
                 <p className="text-xs text-muted-foreground px-1">Only remarks issued in the last 24 hours are shown.</p>
            </div>
            <div className="space-y-2">
                <label htmlFor="reason" className="text-sm font-medium">Reason for Appeal</label>
                <Textarea 
                    id="reason" 
                    placeholder="Explain why you are appealing this remark..."
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)} 
                    rows={4}
                />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAppealSubmit} disabled={isSubmittingAppeal || !selectedRemarkId || !appealReason}>
                {isSubmittingAppeal ? 'Submitting...' : 'Submit Appeal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
