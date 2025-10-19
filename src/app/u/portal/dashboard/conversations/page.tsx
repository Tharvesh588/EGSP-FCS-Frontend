
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ConversationThread } from '@/components/conversation-thread';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type Conversation = {
    _id: string;
    credit: {
        _id: string;
        title: string;
        academicYear: string;
    };
    participants: string[];
    lastMessage?: {
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
    const [searchTerm, setSearchTerm] = useState("");
    const searchParams = useSearchParams();
    const currentUserId = searchParams.get('uid');
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);

        const fetchConversations = async () => {
            setIsLoading(true);
            
            if (!storedToken) {
                toast({ variant: "destructive", title: "Authentication Error" });
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/conversations`, {
                    headers: { "Authorization": `Bearer ${storedToken}` }
                });

                if(!response.ok) {
                    throw new Error("Failed to fetch conversations from server.");
                }

                const data = await response.json();

                if (data.conversations) {
                    const sortedConversations = data.conversations.sort((a: Conversation, b: Conversation) => {
                        if (!a.lastMessage?.createdAt || !b.lastMessage?.createdAt) return 0;
                        try {
                            const dateA = new Date(a.lastMessage.createdAt).getTime();
                            const dateB = new Date(b.lastMessage.createdAt).getTime();
                            if(isNaN(dateA) || isNaN(dateB)) return 0;
                            return dateB - dateA;
                        } catch(e) {
                            return 0;
                        }
                    });
                    setConversations(sortedConversations);
                    if (sortedConversations.length > 0) {
                        // On desktop, select the first one by default.
                        if (window.innerWidth >= 768) {
                           setSelectedConversation(sortedConversations[0]);
                        }
                    }
                } else {
                    throw new Error(data.message || 'Failed to fetch conversations');
                }
            } catch (error: any) {
                toast({ variant: "destructive", title: "Error", description: error.message });
                setConversations([]);
            } finally {
                setIsLoading(false);
            }
        };

        if(currentUserId) {
            fetchConversations();
        }
    }, [toast, currentUserId]);
    
    const filteredConversations = conversations.filter(convo => {
        const term = searchTerm.toLowerCase();
        return (
            convo.credit.title.toLowerCase().includes(term) ||
            (convo.lastMessage?.text && convo.lastMessage.text.toLowerCase().includes(term))
        );
    });

    return (
      <div className="h-full flex flex-col">
        <div className={cn(
            "grid w-full h-full",
            "md:grid-cols-[300px_1fr]"
        )}>
          <aside className={cn(
              "border-r flex flex-col",
              selectedConversation ? "hidden md:flex" : "flex"
          )}>
              <header className="p-4 border-b">
                <h1 className="text-xl font-bold tracking-tight text-foreground">Conversations</h1>
              </header>
              <div className="p-4 border-b">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4">search</span>
                    <Input
                        placeholder="Search conversations..."
                        className="pl-10 h-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                      <div className="p-2 space-y-2">
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                      </div>
                  ) : filteredConversations.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center text-muted-foreground p-4">
                        <p>{searchTerm ? "No conversations match your search." : "No conversations found."}</p>
                      </div>
                  ) : (
                    <div className="flex flex-col">
                      {filteredConversations.map(convo => {
                          const otherParticipant = "Admin";
                          return (
                          <button
                              key={convo._id}
                              className={cn(
                                  "w-full text-left p-4 border-b border-l-4 transition-colors",
                                  selectedConversation?._id === convo._id
                                      ? "bg-muted border-primary"
                                      : "bg-transparent border-transparent hover:bg-muted/50"
                              )}
                              onClick={() => setSelectedConversation(convo)}
                          >
                              <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                      <AvatarFallback>{otherParticipant.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 overflow-hidden">
                                      <div className="flex justify-between items-baseline">
                                        <p className="font-semibold truncate pr-2">{convo.credit.title}</p>
                                        {convo.lastMessage?.createdAt && (
                                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(convo.lastMessage.createdAt), { addSuffix: true })}
                                            </p>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground truncate">{convo.lastMessage?.text || 'No messages yet'}</p>
                                  </div>
                              </div>
                          </button>
                          )
                      })}
                    </div>
                  )}
              </div>
          </aside>
          <main className={cn(
              "flex flex-col",
              "h-[calc(100svh_-_var(--header-height)_-_2rem)] md:h-full",
              selectedConversation ? "flex" : "hidden md:flex"
          )}>
              {selectedConversation ? (
                  <ConversationThread 
                    key={selectedConversation._id} 
                    conversationId={selectedConversation._id} 
                    token={token} 
                    onBack={() => setSelectedConversation(null)}
                  />
              ) : (
                  <div className="flex items-center justify-center h-full">
                      <div className="text-center text-muted-foreground">
                          <span className="material-symbols-outlined text-6xl">forum</span>
                          <p className="mt-4">{isLoading ? "Loading conversations..." : "Select a conversation to start chatting"}</p>
                      </div>
                  </div>
              )}
          </main>
        </div>
      </div>
    );
}
