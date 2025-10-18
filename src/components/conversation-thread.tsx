"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type Message = {
    _id: string;
    sender: string;
    senderSnapshot: {
        name: string;
        facultyID?: string; // Or whatever identifier is available
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
    const searchParams = useSearchParams();
    const currentUserId = searchParams.get('uid');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages?limit=100`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.messages) {
                setMessages(data.messages.sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
            } else {
                throw new Error(data.message || 'Failed to fetch messages');
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error fetching messages", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (conversationId) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
            return () => clearInterval(interval);
        }
    }, [conversationId]);
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsSending(true);
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: newMessage, type: 'positive' }),
            });
            const data = await response.json();
            if (data.ok && data.message) {
                setMessages(prev => [...prev, data.message]);
                setNewMessage('');
            } else {
                throw new Error(data.message || 'Failed to send message');
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error sending message", description: error.message });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-card border rounded-lg">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <p className="text-center text-muted-foreground">Loading conversation...</p>
                ) : messages.length === 0 ? (
                    <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
                ) : (
                    messages.map(message => {
                        const isSender = message.sender === currentUserId;
                        return (
                            <div key={message._id} className={cn("flex items-end gap-2", isSender ? "justify-end" : "justify-start")}>
                                {!isSender && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{message.senderSnapshot.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("max-w-xs md:max-w-md rounded-lg px-3 py-2 text-sm", 
                                    isSender ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                    <p className="font-bold text-xs mb-1">{isSender ? "You" : message.senderSnapshot.name}</p>
                                    <p>{message.content.text}</p>
                                    <p className="text-right text-xs opacity-70 mt-1">
                                        {format(new Date(message.createdAt), 'h:mm a')}
                                    </p>
                                </div>
                                {isSender && (
                                    <Avatar className="h-8 w-8">
                                         <AvatarFallback>{message.senderSnapshot.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        );
                    })
                )}
                 <div ref={messagesEndRef} />
            </div>
            <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={isSending}
                    />
                    <Button type="submit" disabled={isSending}>
                        <span className="material-symbols-outlined">send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
