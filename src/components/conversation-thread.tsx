
"use client";

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { io, type Socket } from 'socket.io-client';
import { LinkPreviewCard } from './link-preview';
import { ArrowLeft, Send } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type Message = {
    _id: string;
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
};

type ConversationDetails = {
    _id: string;
    participants: {
        _id: string;
        name: string;
        profileImage?: string;
    }[];
};

type ConversationThreadProps = {
    conversationId: string;
    conversationDetails: ConversationDetails | null;
    token: string | null;
    currentUserId: string | null;
    onBack: () => void;
};

const urlRegex = /(https?:\/\/[^\s]+)/g;

function DayDivider({ date }: { date: string }) {
    const formattedDate = format(new Date(date), 'MMMM d, yyyy');
    return (
        <div className="relative text-center my-4">
            <hr className="absolute top-1/2 left-0 w-full" />
            <span className="relative bg-background px-3 text-sm text-muted-foreground">{formattedDate}</span>
        </div>
    );
}

export function ConversationThread({ conversationId, conversationDetails, token, currentUserId, onBack }: ConversationThreadProps) {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);

    const scrollToBottom = (behavior: 'smooth' | 'auto' = 'auto') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    const fetchMessages = async () => {
        if (!conversationId || !token) {
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        try {
            const messagesResponse = await fetch(`${API_BASE_URL}/api/v1/conversations/${conversationId}/messages?limit=100`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!messagesResponse.ok) {
                 const errorData = await messagesResponse.json().catch(() => ({ message: "Failed to fetch messages from server." }));
                 throw new Error(errorData.message);
            }
            const messagesData = await messagesResponse.json();
            if (messagesData.messages) {
                const sortedMessages = messagesData.messages.sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                setMessages(sortedMessages);
            } else {
                setMessages([]);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error fetching messages", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchMessages();

        if (!conversationId || !token) return;

        const socket = io(API_BASE_URL, { auth: { token } });
        socketRef.current = socket;

        socket.on('connect', () => {
          socket.emit('join', { conversationId });
        });

        socket.on('message:new', (msg: Message) => {
            if (msg.sender !== currentUserId) {
                setMessages(prev => [...prev, msg]);
            }
        });

        socket.on('connect_error', (err: any) => console.error('socket error', err.message));

        return () => {
          socket.disconnect();
          socketRef.current = null;
        };
    }, [conversationId, token, currentUserId]);
    
    useEffect(() => {
        scrollToBottom('smooth');
    }, [messages]);

    useEffect(() => {
        // Scroll to bottom on initial load after messages are fetched
        if (!isLoading) {
            scrollToBottom('auto');
        }
    }, [isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text || !currentUserId || !socketRef.current || !conversationDetails) return;

        setIsSending(true);
        
        const optimisticMessage: Message = {
            _id: `optimistic-${Date.now()}`,
            sender: currentUserId,
            senderSnapshot: { name: "You", profileImage: conversationDetails?.participants.find(p => p._id === currentUserId)?.profileImage },
            type: 'neutral',
            content: { text },
            createdAt: new Date().toISOString(),
            __optimistic: true,
        };
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${conversationId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ message: "Failed to send message" }));
                 throw new Error(errorData.message);
            }

            const data = await response.json();

            // Replace optimistic message with real one from REST response
            setMessages(prev => prev.map(msg => msg._id === optimisticMessage._id ? { ...data.message, __optimistic: false } : msg));

        } catch (error: any) {
            toast({ variant: "destructive", title: "Error sending message", description: error.message });
            setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
        } finally {
            setIsSending(false);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e as any);
        }
    };

    const otherParticipant = conversationDetails?.participants.find(p => p._id !== currentUserId);

    const renderMessages = () => {
        const messageElements: JSX.Element[] = [];
        let lastDate: string | null = null;

        messages.forEach((message, index) => {
            const messageDate = new Date(message.createdAt).toDateString();
            if (lastDate !== messageDate) {
                messageElements.push(<DayDivider key={`divider-${message._id}`} date={message.createdAt} />);
                lastDate = messageDate;
            }

            const isSender = message.sender === currentUserId;
            const links = message.content.text.match(urlRegex);
            const firstLink = links ? links[0] : null;

            messageElements.push(
                <div key={message._id} className={cn("flex items-end gap-2", isSender ? "justify-end" : "justify-start")}>
                    {!isSender && (
                        <Avatar className="h-8 w-8 self-end mb-1">
                             <AvatarImage src={message.senderSnapshot?.profileImage} />
                            <AvatarFallback>{message.senderSnapshot?.name?.charAt(0) || '?'}</AvatarFallback>
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
                           {format(new Date(message.createdAt), 'p')}
                        </div>
                    </div>
                </div>
            );
        });

        return messageElements;
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
                        disabled={isSending || isLoading}
                        autoComplete="off"
                        maxRows={5}
                        className="w-full resize-none bg-transparent border-none focus-visible:ring-0 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none"
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        className="shrink-0 rounded-full h-8 w-8" 
                        disabled={isSending || isLoading || !newMessage.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
