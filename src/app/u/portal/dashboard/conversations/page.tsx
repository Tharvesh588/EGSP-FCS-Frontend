"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ConversationThread } from '@/components/conversation-thread';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type Conversation = {
    _id: string;
    credit: {
        _id: string;
        title: string;
        academicYear: string;
    };
    participants: string[];
    lastMessage: {
        text: string;
        sender: string;
        createdAt: string;
    };
    totalMessages: number;
};

export default function ConversationsPage() {
    const { toast } = useToast();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const currentUserId = searchParams.get('uid');

    useEffect(() => {
        const fetchConversations = async () => {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast({ variant: "destructive", title: "Authentication Error" });
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/conversations`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.conversations) {
                    setConversations(data.conversations);
                    if (data.conversations.length > 0) {
                        setSelectedConversation(data.conversations[0]);
                    }
                } else {
                    throw new Error(data.message || 'Failed to fetch conversations');
                }
            } catch (error: any) {
                toast({ variant: "destructive", title: "Error", description: error.message });
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, [toast]);

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4">
                 <h1 className="text-3xl font-bold tracking-tight text-foreground">Conversations</h1>
                 <p className="mt-1 text-muted-foreground">Review your recent conversations and messages.</p>
            </div>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                <div className="lg:col-span-1 flex flex-col gap-2 overflow-y-auto">
                    {isLoading ? (
                        <p>Loading conversations...</p>
                    ) : conversations.length === 0 ? (
                        <Card className="flex items-center justify-center h-full">
                           <CardContent className="text-center text-muted-foreground p-6">
                            <p>No conversations found.</p>
                           </CardContent>
                        </Card>
                    ) : (
                        conversations.map(convo => (
                            <div
                                key={convo._id}
                                className={cn(
                                    "p-4 rounded-lg cursor-pointer border-l-4 transition-colors",
                                    selectedConversation?._id === convo._id
                                        ? "bg-primary/10 border-primary"
                                        : "bg-card hover:bg-muted/50 border-transparent"
                                )}
                                onClick={() => setSelectedConversation(convo)}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                     <Avatar className="h-10 w-10">
                                        <AvatarFallback>{convo.credit.title.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-bold truncate">{convo.credit.title}</p>
                                        <p className="text-sm text-muted-foreground truncate">{convo.lastMessage.text}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span>{convo.totalMessages} messages</span>
                                    <span>{formatDistanceToNow(new Date(convo.lastMessage.createdAt), { addSuffix: true })}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="lg:col-span-2 h-full">
                    {selectedConversation ? (
                        <ConversationThread conversationId={selectedConversation._id} />
                    ) : (
                        <Card className="h-full flex items-center justify-center">
                            <CardContent className="text-center text-muted-foreground p-6">
                                <p>{isLoading ? "Loading..." : "Select a conversation to view messages"}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
