
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type Message = {
    _id: string;
    sender: string;
    senderSnapshot: {
        name: string;
        facultyID?: string;
    };
    type: 'positive' | 'negative' | 'neutral';
    content: {
        text: string;
        meta?: any;
    };
    createdAt: string;
};

type ConversationThreadProps = {
    conversationId: string;
};

export function ConversationThread({ conversationId }: ConversationThreadProps) {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [chatSearchTerm, setChatSearchTerm] = useState('');
    const searchParams = useSearchParams();
    const currentUserId = searchParams.get('uid');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        if (!conversationId) {
            setIsLoading(false);
            return;
        }
        const token = localStorage.getItem("token");
        if (!token) {
             if (isLoading) setIsLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${conversationId}/messages?limit=100`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error("Failed to fetch messages from server.");
            }
            const data = await response.json();
            if (data.messages) {
                const sortedMessages = data.messages.sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                setMessages(sortedMessages);
            } else {
                throw new Error(data.message || 'Failed to fetch messages');
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error fetching messages", description: error.message });
        } finally {
            if (isLoading) setIsLoading(false);
        }
    };

    useEffect(() => {
        if (conversationId) {
            setIsLoading(true);
            fetchMessages();
        }
    }, [conversationId]);
    
    useEffect(() => {
        scrollToBottom();
    }, [messages, chatSearchTerm]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUserId) return;

        setIsSending(true);
        const token = localStorage.getItem("token");
        
        const optimisticMessage: Message = {
            _id: `temp-${Date.now()}-${Math.random()}`,
            sender: currentUserId,
            senderSnapshot: { name: "You" },
            type: 'positive',
            content: { text: newMessage },
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');


        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${conversationId}/message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: newMessage, type: 'positive', meta: {} }),
            });

            if (!response.ok) {
                 throw new Error("Server failed to process message.");
            }

            const data = await response.json();
            // The API response for a sent message doesn't contain the full message object with an _id.
            // We'll just refetch messages to get the updated list.
            if (data.ok) {
                fetchMessages();
            } else {
                throw new Error(data.message || 'Failed to send message');
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error sending message", description: error.message });
            setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
        } finally {
            setIsSending(false);
        }
    };

    const filteredMessages = useMemo(() => {
        return messages.filter(message =>
            message.content.text.toLowerCase().includes(chatSearchTerm.toLowerCase())
        );
    }, [messages, chatSearchTerm]);

    return (
        <div className="flex flex-col h-full bg-card">
            <header className="p-4 border-b flex items-center justify-between gap-3">
                 <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">Conversation</p>
                        <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                </div>
                 <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4">search</span>
                    <Input
                        placeholder="Search chat..."
                        className="pl-10 h-9 w-48"
                        value={chatSearchTerm}
                        onChange={(e) => setChatSearchTerm(e.target.value)}
                    />
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-3/4 rounded-lg" />
                        <Skeleton className="h-16 w-3/4 rounded-lg ml-auto" />
                        <Skeleton className="h-20 w-1/2 rounded-lg" />
                         <Skeleton className="h-16 w-3/4 rounded-lg" />
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <span className="material-symbols-outlined text-5xl">chat_bubble</span>
                            <p className="mt-2">{chatSearchTerm ? "No messages match your search." : "No messages yet. Start the conversation!"}</p>
                        </div>
                    </div>
                ) : (
                    filteredMessages.map(message => {
                        const isSender = message.sender === currentUserId;
                        return (
                            <div key={message._id} className={cn("flex items-end gap-2", isSender ? "justify-end" : "justify-start")}>
                                {!isSender && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{message.senderSnapshot.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-2.5", 
                                    isSender 
                                        ? "bg-primary text-primary-foreground rounded-br-none" 
                                        : "bg-muted rounded-bl-none"
                                )}>
                                    <p className="text-sm">{message.content.text}</p>
                                    <p className="text-right text-xs opacity-70 mt-1.5">
                                        {format(new Date(message.createdAt), 'p')}
                                    </p>
                                </div>
                                {isSender && (
                                    <Avatar className="h-8 w-8">
                                         <AvatarFallback>Y</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        );
                    })
                )}
                 <div ref={messagesEndRef} />
            </div>
             <div className="border-t bg-background/80 p-4">
                <form onSubmit={handleSendMessage} className="relative">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={isSending || isLoading}
                        autoComplete="off"
                        className="h-12 rounded-full bg-muted focus-visible:ring-primary pl-5 pr-14"
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-9 w-9" 
                        disabled={isSending || isLoading || !newMessage.trim()}
                    >
                        <span className="material-symbols-outlined text-lg">send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
