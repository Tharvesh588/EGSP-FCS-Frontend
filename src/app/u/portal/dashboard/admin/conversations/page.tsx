
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ConversationThread } from '@/components/conversation-thread';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { io, type Socket } from 'socket.io-client';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type Participant = {
    _id: string;
    name: string;
    profileImage?: string;
};

type Conversation = {
    _id: string;
    credit: {
        _id: string;
        title: string;
        academicYear: string;
    };
    participants: Participant[];
    lastMessage?: {
        text: string;
        sender: string;
        createdAt: string;
    };
    updatedAt: string;
    totalMessages: number;
};

type NewMessagePayload = { 
    conversationId: string; 
    sender: string; 
    content: { text: string }; 
    createdAt: string;
    text: string;
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
    const socketRef = useRef<Socket | null>(null);
    const [currentUser, setCurrentUser] = useState<Participant | null>(null);

    const formatTimestamp = (dateString: string) => {
        if (!dateString) return '';
        const date = parseISO(dateString);
        return format(date, "MMM d, yyyy, h:mm a");
    };

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if(storedToken) {
            setToken(storedToken);
        }

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
                       const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                       const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                       return dateB - dateA;
                    });

                    // Set current user from the first conversation if available
                    if (sortedConversations.length > 0 && currentUserId) {
                        const firstConvo = sortedConversations[0];
                        const user = firstConvo.participants.find(p => p._id === currentUserId);
                        if(user) setCurrentUser(user);
                    }

                    setConversations(sortedConversations);
                    if (sortedConversations.length > 0) {
                        if (window.innerWidth >= 768 && !selectedConversation) {
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

    useEffect(() => {
        if (!token) return;
    
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
    
        const newSocket = io(API_BASE_URL, {
          auth: { token },
          reconnectionAttempts: 10,
          transports: ['websocket','polling']
        });
        socketRef.current = newSocket;
    
        newSocket.on('connect', () => {
          console.log('Socket connected for admin conversations.');
        });
    
        newSocket.on('connect_error', (err) => {
          console.error('Socket connection error:', err.message);
          toast({
            variant: 'destructive',
            title: 'Chat connection failed',
            description: 'Could not connect to the real-time server.',
          });
        });
        
        newSocket.on('reconnect', () => {
          console.log('Socket reconnected.');
        });
    
        const handleNewMessage = (newMessage: NewMessagePayload) => {
            setConversations(prevConvos => {
                const convoIndex = prevConvos.findIndex(c => c._id === newMessage.conversationId);
                if (convoIndex === -1) {
                    console.warn("Received a message for a conversation not in the list. Need to fetch.");
                    return prevConvos;
                }
    
                const updatedConvo = {
                    ...prevConvos[convoIndex],
                    lastMessage: {
                        text: newMessage.text,
                        sender: newMessage.sender,
                        createdAt: newMessage.createdAt,
                    },
                    updatedAt: newMessage.createdAt,
                };
    
                const otherConvos = prevConvos.filter(c => c._id !== newMessage.conversationId);
                return [updatedConvo, ...otherConvos];
            });
        };
    
        newSocket.on('message:new', handleNewMessage);
    
        return () => {
          newSocket.off('message:new', handleNewMessage);
          newSocket.disconnect();
          socketRef.current = null;
        };
      }, [token, toast]);


    const filteredConversations = conversations.filter(convo => {
        const term = searchTerm.toLowerCase();
        const otherParticipant = convo.participants.find(p => p._id !== currentUserId);
        return (
            (convo.credit?.title?.toLowerCase() ?? '').includes(term) ||
            (otherParticipant && otherParticipant.name?.toLowerCase()?.includes(term)) ||
            (convo.lastMessage?.text && convo.lastMessage.text.toLowerCase().includes(term))
        );
    });

    return (
      <div className="flex flex-1 h-full overflow-hidden">
          <aside className={cn(
              "w-full md:w-[350px] flex-shrink-0 border-r flex flex-col bg-card",
              selectedConversation && "hidden md:flex"
          )}>
              <div className="p-4 border-b">
                  <h2 className="text-xl font-bold">Conversations</h2>
              </div>
               <div className="p-2 border-b">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4">search</span>
                    <Input
                        placeholder="Search faculty or topic..."
                        className="pl-10 h-9 bg-background"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                      <div className="p-2 space-y-1">
                          <Skeleton className="h-[72px] w-full" />
                          <Skeleton className="h-[72px] w-full" />
                          <Skeleton className="h-[72px] w-full" />
                          <Skeleton className="h-[72px] w-full" />
                          <Skeleton className="h-[72px] w-full" />
                      </div>
                  ) : filteredConversations.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center text-muted-foreground p-4">
                        <p>{searchTerm ? "No conversations match your search." : "No conversations found."}</p>
                      </div>
                  ) : (
                    <div className="flex flex-col">
                      {filteredConversations.map(convo => {
                          const otherParticipant = convo.participants.find(p => p._id !== currentUserId);
                          return (
                          <button
                              key={convo._id}
                              className={cn(
                                  "w-full text-left p-3 border-b transition-colors",
                                  selectedConversation?._id === convo._id
                                      ? "bg-primary/10"
                                      : "hover:bg-muted/50"
                              )}
                              onClick={() => setSelectedConversation(convo)}
                          >
                              <div className="flex items-start gap-3">
                                  <div className="relative flex-shrink-0">
                                      <Avatar className="h-10 w-10 border-2 border-background">
                                          <AvatarImage src={otherParticipant?.profileImage} />
                                          <AvatarFallback>{otherParticipant?.name?.charAt(0) ?? '?'}</AvatarFallback>
                                      </Avatar>
                                      <Avatar className="absolute -right-2 -bottom-1 h-6 w-6 border-2 border-card">
                                          <AvatarImage src={currentUser?.profileImage} />
                                          <AvatarFallback>{currentUser?.name?.charAt(0) ?? 'A'}</AvatarFallback>
                                      </Avatar>
                                  </div>
                                  <div className="flex-1 overflow-hidden ml-1">
                                      <div className="flex justify-between items-baseline">
                                        <p className="font-semibold truncate pr-2">{otherParticipant?.name || "Unknown User"}</p>
                                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                                            {formatTimestamp(convo.updatedAt)}
                                        </p>
                                      </div>
                                       <p className="text-sm text-muted-foreground truncate">{convo.credit?.title}</p>
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
              "flex-1 flex flex-col",
              !selectedConversation && "hidden md:flex"
          )}>
              {selectedConversation && token && currentUserId ? (
                  <ConversationThread
                    conversationId={selectedConversation._id}
                    conversationDetails={selectedConversation}
                    socket={socketRef.current}
                    currentUserId={currentUserId}
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
    );
}
