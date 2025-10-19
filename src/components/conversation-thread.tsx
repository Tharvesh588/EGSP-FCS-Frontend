
"use client";

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { io, type Socket } from 'socket.io-client';
import { LinkPreviewCard } from './link-preview';
import { ArrowLeft } from 'lucide-react';
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
     // Add other relevant conversation fields
};

type ConversationThreadProps = {
    conversationId: string;
    conversationDetails: ConversationDetails | null;
    token: string | null;
    currentUserId: string | null;
    onBack: () => void;
};

const urlRegex = /(https?:\/\/[^\s]+)/g;

export function ConversationThread({ conversationId, conversationDetails, token, currentUserId, onBack }: ConversationThreadProps) {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [chatSearchTerm, setChatSearchTerm] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
            } else if (messagesData.success && Array.isArray(messagesData.messages) && messagesData.messages.length === 0) {
                setMessages([]);
            } else {
                throw new Error(messagesData.message || 'Failed to parse messages');
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
        }

        if (!conversationId || !token) return;

        const socket = io(API_BASE_URL, { auth: { token } });
        socketRef.current = socket;

        socket.on('connect', () => {
          socket.emit('join', { conversationId }, (resp: any) => {
            if (resp?.error) console.error('join failed', resp.error);
          });
        });

        socket.on('message:new', (msg: Message) => {
            setMessages(prev => {
                // Avoid adding duplicate optimistic messages
                if (prev.some(m => m._id === msg._id)) {
                    return prev;
                }
                const optimisticMessage = prev.find(m => m.__optimistic && m.content.text === msg.content.text);
                if (optimisticMessage) {
                    return prev.map(m => m._id === optimisticMessage._id ? { ...msg, __optimistic: false } : m);
                }
                return [...prev, msg];
            });
        });

        socket.on('connect_error', (err: any) => console.error('socket error', err.message));

        return () => {
          socket.disconnect();
          socketRef.current = null;
        };
    }, [conversationId, token]);
    
    useEffect(() => {
        scrollToBottom();
    }, [messages, chatSearchTerm]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text || !currentUserId || !socketRef.current || !conversationDetails) return;

        setIsSending(true);
        setNewMessage('');

        const optimisticMessage: Message = {
            _id: `optimistic-${Date.now()}-${Math.random()}`,
            sender: currentUserId,
            senderSnapshot: { name: "You", profileImage: conversationDetails?.participants.find((p:any) => p._id === currentUserId)?.profileImage },
            type: 'neutral',
            content: { text },
            createdAt: new Date().toISOString(),
            __optimistic: true,
        };
        setMessages(prev => [...prev, optimisticMessage]);
        
        socketRef.current?.emit('message:send', { conversationId, content: { text } }, (ack: any) => {
          if (ack?.error) {
            console.error('socket send error', ack.error);
            toast({ variant: "destructive", title: "Error sending message", description: ack.error });
            setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
          } else {
             // The server will broadcast the message back, which will replace the optimistic one.
          }
        });

        setIsSending(false);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e as any);
        }
    };

    const filteredMessages = messages.filter(message =>
        message.content.text.toLowerCase().includes(chatSearchTerm.toLowerCase())
    );

    const otherParticipant = conversationDetails?.participants.find((p: any) => p._id !== currentUserId);

    return (
        <div className="flex flex-col h-full bg-card">
            <header className="p-4 border-b flex items-center justify-between gap-3 shrink-0">
                 <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar>
                        <AvatarImage src={otherParticipant?.profileImage} />
                        <AvatarFallback>{otherParticipant ? otherParticipant.name.charAt(0) : '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{otherParticipant?.name || 'Conversation'}</p>
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
                        const links = message.content.text.match(urlRegex);
                        const firstLink = links ? links[0] : null;

                        return (
                            <div key={message._id || Math.random()} className={cn("flex items-end gap-2", isSender ? "justify-end" : "justify-start")}>
                                {!isSender && (
                                    <Avatar className="h-8 w-8 self-end mb-1">
                                         <AvatarImage src={message.senderSnapshot?.profileImage} />
                                        <AvatarFallback>{message.senderSnapshot?.name?.charAt(0) || '?'}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-2.5 flex flex-col", 
                                    isSender 
                                        ? "bg-primary text-primary-foreground rounded-br-none" 
                                        : "bg-muted rounded-bl-none",
                                    message.__optimistic ? "opacity-70" : ""
                                )}>
                                    <p className="text-sm break-words whitespace-pre-wrap">{message.content.text}</p>
                                    {firstLink && <LinkPreviewCard url={firstLink} />}
                                    <p className={cn("text-right text-xs mt-1.5", isSender ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                                        {format(new Date(message.createdAt), 'p')}
                                    </p>
                                </div>
                                {isSender && (
                                    <Avatar className="h-8 w-8 self-end mb-1">
                                        <AvatarImage src={message.senderSnapshot?.profileImage} />
                                        <AvatarFallback>{message.senderSnapshot?.name?.charAt(0) || 'Y'}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        );
                    })
                )}
                 <div ref={messagesEndRef} />
            </div>
             <div className="border-t bg-background/80 p-4 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
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
                        className="w-full resize-none bg-muted focus-visible:ring-primary rounded-2xl border-none px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none"
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        className="shrink-0 rounded-full h-9 w-9" 
                        disabled={isSending || isLoading || !newMessage.trim()}
                    >
                        <span className="material-symbols-outlined text-lg">send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
