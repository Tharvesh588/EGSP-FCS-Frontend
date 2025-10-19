
"use client";

import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, isSameDay, parseISO } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import type { Socket } from 'socket.io-client';
import { LinkPreviewCard } from './link-preview';
import { ArrowLeft, Send } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type Message = {
    _id: string;
    conversationId?: string;
    sender: string;
    senderSnapshot: {
        name: string;
        profileImage?: string;
    };
    type: 'positive' | 'negative' | 'neutral';
    content: {
        text: string;
        meta?: any;
    };
    createdAt: string;
    __optimistic?: boolean;
    __optimisticId?: string;
};

type ConversationDetails = {
    _id: string;
    credit?: {
      title: string;
    };
    participants: {
        _id: string;
        name: string;
        profileImage?: string;
    }[];
};

type ConversationThreadProps = {
    conversationId: string;
    conversationDetails: ConversationDetails;
    socket: Socket | null;
    currentUserId: string | null;
    onBack: () => void;
};

const urlRegex = /(https?:\/\/[^\s]+)/g;

function DayDivider({ date }: { date: string }) {
    const formattedDate = format(parseISO(date), 'MMMM d, yyyy');
    return (
        <div className="relative text-center my-4">
            <hr className="absolute top-1/2 left-0 w-full border-border" />
            <span className="relative bg-background px-3 text-sm text-muted-foreground">{formattedDate}</span>
        </div>
    );
}

type RenderableItem = 
    | { type: 'divider'; id: string; date: string; }
    | { type: 'message'; id: string; message: Message; };


export function ConversationThread({ conversationId, conversationDetails, socket, currentUserId, onBack }: ConversationThreadProps) {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = (behavior: 'smooth' | 'auto' = 'auto') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            
            setIsLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/conversations/${conversationId}/messages?limit=100`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch messages');
                const data = await res.json();
                const sortedMessages = data.messages.sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                setMessages(sortedMessages);
            } catch (error: any) {
                toast({ variant: "destructive", title: "Error", description: error.message });
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [conversationId, toast]);

    useEffect(() => {
        if (!socket || !conversationId) return;
        
        const handleNewMessage = (msg: Message) => {
            if (msg.conversationId === conversationId) {
                setMessages(prev => {
                    // If an optimistic message ID is present, find and replace it
                    if (msg.__optimisticId) {
                        return prev.map(m => m._id === msg.__optimisticId ? { ...msg, __optimistic: false } : m);
                    }
                    
                    // If it's a new message from someone else, just add it if not already present
                    if (!prev.some(m => m._id === msg._id)) {
                        return [...prev, msg];
                    }
    
                    return prev;
                });
            }
        };
        
        socket.emit('join', { conversationId }, (ack: { ok: boolean; error?: string }) => {
            if (!ack || !ack.ok) {
                console.error('Failed to join conversation room:', ack?.error);
                toast({ variant: 'destructive', title: 'Chat Error', description: 'Could not connect to this conversation.' });
            }
        });

        socket.on('message:new', handleNewMessage);

        return () => {
          socket.off('message:new', handleNewMessage);
          socket.emit('leave', { conversationId });
        };
    }, [conversationId, socket, toast]);
    
    useEffect(() => {
        scrollToBottom('smooth');
    }, [messages]);

    useEffect(() => {
        if (!isLoading) {
            scrollToBottom('auto');
        }
    }, [isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text || !currentUserId || !socket || !conversationDetails) return;

        const optimisticId = `optimistic-${Date.now()}`;
        const optimisticMessage: Message = {
            _id: optimisticId, // Use the temporary ID for the key
            sender: currentUserId,
            senderSnapshot: { name: "You" },
            type: 'neutral',
            content: { text },
            createdAt: new Date().toISOString(),
            __optimistic: true,
        };
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        
        const payload = {
          conversationId,
          text,
          type: 'neutral',
          meta: {},
          __optimisticId: optimisticId, // Send optimistic ID to backend
        };
        
        socket.emit('message', payload, (response: any) => {
            if (response && response.error) {
                toast({ variant: "destructive", title: "Error sending message", description: response.error });
                // Rollback optimistic UI
                setMessages(prev => prev.filter(msg => msg._id !== optimisticId));
            }
        });
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e as any);
        }
    };

    const otherParticipant = conversationDetails?.participants.find(p => p._id !== currentUserId);

    const renderMessages = () => {
        const renderableItems: RenderableItem[] = [];
        let lastDate: string | null = null;

        messages.forEach(message => {
            if (!message || !message.createdAt) return;
            const messageDate = new Date(message.createdAt).toDateString();
            
            if (lastDate !== messageDate) {
                const dividerId = `divider-${messageDate}`;
                renderableItems.push({ type: 'divider', id: dividerId, date: message.createdAt });
                lastDate = messageDate;
            }
            
            renderableItems.push({ type: 'message', id: message._id, message });
        });

        return renderableItems.map((item, index) => {
            if (item.type === 'divider') {
                return <DayDivider key={item.id} date={item.date} />;
            }

            const { message } = item;
            if (!message) return null;
            
            const isSender = message.sender === currentUserId;
            const links = message.content.text.match(urlRegex);
            const firstLink = links ? links[0] : null;

            return (
                <div key={item.id} className={cn("flex items-end gap-2", isSender ? "justify-end" : "justify-start")}>
                    {!isSender && (
                        <Avatar className="h-8 w-8 self-end mb-1">
                             <AvatarImage src={message.senderSnapshot?.profileImage} />
                            <AvatarFallback>{message.senderSnapshot?.name?.charAt(0) ?? '?'}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={cn(
                        "max-w-xs md:max-w-md lg:max-w-2xl rounded-2xl px-4 py-2 flex flex-col group relative",
                        isSender
                            ? "bg-primary text-primary-foreground rounded-br-lg"
                            : "bg-muted rounded-bl-lg",
                        message.__optimistic ? "opacity-60" : ""
                    )}>
                        <p className="text-sm break-words whitespace-pre-wrap">{message.content.text}</p>
                        {firstLink && <LinkPreviewCard url={firstLink} />}
                        <div className="text-right text-xs mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: isSender ? 'hsl(var(--primary-foreground) / 0.7)' : 'hsl(var(--muted-foreground) / 0.7)'}}>
                           {format(parseISO(message.createdAt), 'p')}
                        </div>
                    </div>
                </div>
            );
        });
    };


    return (
        <div className="flex flex-col h-full bg-background">
            <header className="p-3 border-b flex items-center justify-between gap-3 shrink-0">
                 <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar>
                        <AvatarImage src={otherParticipant?.profileImage} />
                        <AvatarFallback>{otherParticipant?.name?.charAt(0) ?? '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{otherParticipant?.name || 'Conversation'}</p>
                        <p className="text-xs text-muted-foreground">{conversationDetails?.credit?.title}</p>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <Button variant="ghost" size="icon"><span className="material-symbols-outlined text-xl text-muted-foreground">search</span></Button>
                    <Button variant="ghost" size="icon"><span className="material-symbols-outlined text-xl text-muted-foreground">more_vert</span></Button>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-3/4 rounded-lg" />
                        <Skeleton className="h-16 w-3/4 rounded-lg ml-auto" />
                        <Skeleton className="h-20 w-1/2 rounded-lg" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <span className="material-symbols-outlined text-5xl">chat_bubble</span>
                            <p className="mt-2">No messages yet. Start the conversation!</p>
                        </div>
                    </div>
                ) : (
                    renderMessages()
                )}
                 <div ref={messagesEndRef} />
            </div>
             <div className="border-t bg-background p-2 md:p-4 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-muted rounded-full px-2">
                    <Button type="button" variant="ghost" size="icon" className="shrink-0">
                        <span className="material-symbols-outlined text-muted-foreground text-xl">add_circle</span>
                    </Button>
                     <TextareaAutosize
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        disabled={isLoading || !socket?.connected}
                        autoComplete="off"
                        maxRows={5}
                        className="w-full resize-none bg-transparent border-none focus-visible:ring-0 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none"
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        className="shrink-0 rounded-full h-8 w-8" 
                        disabled={isLoading || !socket?.connected || !newMessage.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}

    