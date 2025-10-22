
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
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
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
    type: 'positive' | 'negative' | 'neutral' | 'system';
    content: {
        text: string;
        meta?: any;
    };
    createdAt: string;
    tempId?: string;
    isPending?: boolean;
    error?: string;
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
    const [isTyping, setIsTyping] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = (behavior: 'smooth' | 'auto' = 'auto') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };
    
    useEffect(() => {
        if (!socket || !conversationId) return;

        let isMounted = true;

        const handleNewMessage = (msg: Message) => {
            if (msg.conversationId === conversationId) {
                setMessages(prev => {
                    // If the message is a temporary one being confirmed by the server
                    if (msg.tempId && prev.some(m => m.tempId === msg.tempId)) {
                        return prev.map(m => m.tempId === msg.tempId ? { ...msg, isPending: false, error: undefined } : m);
                    }
                    // If it's a new message from the other user
                    if (!prev.some(m => m._id === msg._id)) {
                        return [...prev, msg];
                    }
                    return prev;
                });
                if (msg.sender !== currentUserId) {
                    socket.emit('message:ack', { conversationId, messageCreatedAt: msg.createdAt });
                }
            }
        };

        const handleTyping = (data: { conversationId: string; user: { id: string; name: string; }, typing: boolean; }) => {
            if (data.conversationId === conversationId && data.user.id !== currentUserId) {
                if(isMounted) setIsTyping(data.typing);
            }
        };
        
        socket.on('message:new', handleNewMessage);
        socket.on('typing', handleTyping);

        socket.emit('join', { conversationId }, (resp: {ok: boolean; error?: string}) => {
            if (!isMounted) return;
            if (resp && resp.ok) {
                console.log(`Joined conversation ${conversationId}`);
            } else {
                console.warn('Failed to join conversation:', resp?.error);
                toast({ variant: 'destructive', title: 'Chat Error', description: 'Could not connect to this conversation.' });
            }
        });

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
                if (isMounted) {
                    const sortedMessages = data.messages.sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    setMessages(sortedMessages);
                }
            } catch (error: any) {
                if (isMounted) {
                    toast({ variant: "destructive", title: "Error", description: error.message });
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchMessages();
        
        return () => {
          isMounted = false;
          socket.off('message:new', handleNewMessage);
          socket.off('typing', handleTyping);
          socket.emit('leave', { conversationId });
          console.log(`Left conversation ${conversationId}`);
        };
    }, [conversationId, socket, toast, currentUserId]);
    
    useEffect(() => {
        scrollToBottom('smooth');
    }, [messages, isTyping]);

    useEffect(() => {
        if (!isLoading) {
            scrollToBottom('auto');
        }
    }, [isLoading]);
    
    const handleTypingChange = () => {
        if (!socket || !socket.connected) return;

        socket.emit('typing', { conversationId, typing: true });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing', { conversationId, typing: false });
        }, 3000);
    };
    
    const handleSendMessage = async (e: React.FormEvent, retryMessage?: Message) => {
        e.preventDefault();
        const text = retryMessage?.content.text || newMessage.trim();
        if (!text || !currentUserId || !socket || !conversationDetails) return;
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit('typing', { conversationId, typing: false });

        const tempId = retryMessage?.tempId || `${Date.now()}-${Math.random()}`;
        const currentUserDetails = conversationDetails.participants.find(p => p._id === currentUserId);

        const optimisticMessage: Message = {
            _id: tempId,
            tempId: tempId,
            sender: currentUserId,
            senderSnapshot: { 
                name: currentUserDetails?.name || "You",
                profileImage: currentUserDetails?.profileImage,
            },
            type: 'neutral',
            content: { text },
            createdAt: new Date().toISOString(),
            isPending: true,
        };
        
        if (retryMessage) {
            setMessages(prev => prev.map(m => m.tempId === retryMessage.tempId ? optimisticMessage : m));
        } else {
             // Use a callback to ensure we're updating the latest state
            setMessages(prev => [...prev, optimisticMessage]);
        }
        setNewMessage('');
        
        socket.emit('message', { conversationId, text, tempId }, (resp: { ok: boolean; message?: Message, error?: string }) => {
            if (resp && resp.ok && resp.message) {
                 setMessages(prev => prev.map(m => m.tempId === tempId ? { ...resp.message!, isPending: false } : m));
            } else {
                toast({ variant: "destructive", title: "Error sending message", description: resp?.error });
                setMessages(prev => prev.map(m => m.tempId === tempId ? { ...m, isPending: false, error: resp?.error || "Failed to send" } : m));
            }
        });
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e as any);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewMessage(e.target.value);
      handleTypingChange();
    };

    const otherParticipant = conversationDetails?.participants.find(p => p._id !== currentUserId);

    const renderMessages = () => {
        const items: RenderableItem[] = [];
        let lastDate: string | null = null;

        messages.forEach((message, index) => {
            if (!message || !message.createdAt) return;
            const messageDate = new Date(message.createdAt).toDateString();
            
            const itemKey = message.tempId || message._id || `${message.createdAt}-${index}`;
            
            if (lastDate !== messageDate) {
                items.push({ type: 'divider', id: messageDate, date: message.createdAt });
                lastDate = messageDate;
            }
            
            items.push({ type: 'message', id: itemKey, message });
        });

        return items.map((item, index) => {
            if (item.type === 'divider') {
                return <DayDivider key={`divider-${item.id}`} date={item.date} />;
            }

            const { message } = item;
            if (!message) return null;
            
            const isSender = message.sender === currentUserId;
            const links = message.content.text.match(urlRegex);
            const firstLink = links ? links[0] : null;
            
            const itemKey = `message-${item.id}`;

            return (
                <div key={itemKey} className={cn("flex items-end gap-2", isSender ? "justify-end" : "justify-start")}>
                    {!isSender && (
                        <Avatar className="h-8 w-8 self-end mb-1">
                             <AvatarImage src={message.senderSnapshot?.profileImage} />
                            <AvatarFallback>{message.senderSnapshot?.name?.charAt(0) ?? '?'}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className="flex flex-col items-end gap-1">
                        <div className={cn(
                            "max-w-xs md:max-w-md lg:max-w-2xl rounded-2xl px-4 py-2 flex flex-col group relative",
                            isSender
                                ? "bg-primary text-primary-foreground rounded-br-lg"
                                : "bg-muted rounded-bl-lg",
                            message.isPending && "opacity-60"
                        )}>
                            <p className="text-sm break-words whitespace-pre-wrap">{message.content.text}</p>
                            {firstLink && <LinkPreviewCard url={firstLink} />}
                            <div className="text-right text-xs mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: isSender ? 'hsl(var(--primary-foreground) / 0.7)' : 'hsl(var(--muted-foreground) / 0.7)'}}>
                               {format(parseISO(message.createdAt), 'p')}
                            </div>
                        </div>
                        {message.error && isSender && (
                            <div className="flex items-center gap-1 text-xs text-destructive">
                                <AlertCircle className="h-3 w-3"/>
                                <span>{message.error}.</span>
                                <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={(e) => handleSendMessage(e, message)}>
                                    Retry
                                </Button>
                            </div>
                        )}
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
                {isTyping && <div className="text-xs text-muted-foreground px-4 pb-2 italic">{otherParticipant?.name} is typing...</div>}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-muted rounded-full px-2">
                    <Button type="button" variant="ghost" size="icon" className="shrink-0">
                        <span className="material-symbols-outlined text-muted-foreground text-xl">add_circle</span>
                    </Button>
                     <TextareaAutosize
                        value={newMessage}
                        onChange={handleInputChange}
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
