'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import type { ChatMessage, SwapRequest, UserProfile } from "@/lib/types";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { collection, doc, orderBy, query, serverTimestamp, Timestamp } from "firebase/firestore";
import { useState, useRef, useEffect } from "react";

export default function ChatPage({ params }: { params: { id: string } }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const swapRequestRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'swap_requests', params.id);
    }, [firestore, params.id]);
    const { data: swapRequest, isLoading: isLoadingSwapRequest } = useDoc<SwapRequest>(swapRequestRef);

    const otherUserId = swapRequest?.requesterId === user?.uid ? swapRequest?.receiverId : swapRequest?.requesterId;

    const requesterRef = useMemoFirebase(() => {
      if(!firestore || !swapRequest) return null;
      return doc(firestore, 'users', swapRequest.requesterId);
    }, [firestore, swapRequest]);
    const { data: requesterProfile } = useDoc<UserProfile>(requesterRef);

    const receiverRef = useMemoFirebase(() => {
      if(!firestore || !swapRequest) return null;
      return doc(firestore, 'users', swapRequest.receiverId);
    }, [firestore, swapRequest]);
    const { data: receiverProfile } = useDoc<UserProfile>(receiverRef);

    const otherUser = swapRequest?.requesterId === user?.uid ? receiverProfile : requesterProfile;
    
    const skillRef = useMemoFirebase(() => {
        if(!firestore || !swapRequest) return null;
        return doc(firestore, 'skills', swapRequest.skillId);
    }, [firestore, swapRequest]);
    const { data: skill } = useDoc<any>(skillRef);


    const messagesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, `swap_requests/${params.id}/chat_messages`), orderBy("timestamp", "asc"));
    }, [firestore, params.id]);
    const { data: messages, isLoading: isLoadingMessages } = useCollection<ChatMessage>(messagesQuery);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || !firestore) return;
        
        const messageData = {
            senderId: user.uid,
            message: newMessage,
            timestamp: serverTimestamp(),
            swapRequestId: params.id,
        };

        const messagesColRef = collection(firestore, `swap_requests/${params.id}/chat_messages`);
        
        // Non-blocking write
        addDocumentNonBlocking(messagesColRef, messageData);
        
        setNewMessage("");
    };

    if (isLoadingSwapRequest || isLoadingMessages) {
        return (
            <div className="flex flex-col h-[calc(100vh-10rem)]">
                 <header className="flex items-center gap-4 p-4 border-b bg-muted/40 animate-pulse">
                    <div className="rounded-full bg-muted h-12 w-12"></div>
                    <div className="space-y-2">
                        <div className="h-6 w-32 bg-muted rounded"></div>
                        <div className="h-4 w-48 bg-muted rounded"></div>
                    </div>
                </header>
                <main className="flex-1 p-4"></main>
                <footer className="p-4 border-t">
                    <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
                </footer>
            </div>
        );
    }
    
    if (!swapRequest) {
        notFound();
    }


    const getSenderProfile = (senderId: string) => {
        if(senderId === requesterProfile?.id) return requesterProfile;
        if(senderId === receiverProfile?.id) return receiverProfile;
        return null;
    }
    
    return (
        <div className="flex flex-col h-[calc(100vh-10rem)]">
            <header className="flex items-center gap-4 p-4 border-b">
                <Button asChild variant="ghost" size="icon" className="md:hidden">
                    <Link href="/dashboard/requests"><ArrowLeft /></Link>
                </Button>
                <Avatar>
                    <AvatarImage src={otherUser?.profilePicture} alt={otherUser?.displayName} />
                    <AvatarFallback>{otherUser?.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="font-semibold text-lg">{otherUser?.displayName}</h2>
                     <p className="text-sm text-muted-foreground">Regarding swap for: {skill?.name}</p>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages?.map(message => {
                    const sender = getSenderProfile(message.senderId);
                    return (
                        <div key={message.id} className={`flex items-end gap-2 ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                            {message.senderId !== user?.uid && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={sender?.profilePicture} alt={sender?.displayName} />
                                    <AvatarFallback>{sender?.displayName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`rounded-lg px-4 py-2 max-w-sm ${message.senderId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                                <p>{message.message}</p>
                                <p className={`text-xs mt-1 ${message.senderId === user?.uid ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {(message.timestamp as Timestamp)?.toDate().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                </p>
                            </div>
                            {message.senderId === user?.uid && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || ''} />
                                    <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </main>
            <footer className="p-4 border-t">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
                    <Input 
                        placeholder="Type a message..." 
                        className="pr-12"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="submit" size="icon" className="absolute top-1/2 right-1.5 -translate-y-1/2 h-7 w-7" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </footer>
        </div>
    )
}
