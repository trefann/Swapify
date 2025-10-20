import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currentUser, swapRequests } from "@/lib/data";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Mock messages for a chat
const messages = [
    { id: 'm1', senderId: '2', content: 'Hola Alex! I would love to help you with your Spanish in exchange for some React lessons. Does this time work for you?', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: 'm2', senderId: '1', content: '¡Hola Maria! That sounds great. The time works perfectly for me. Looking forward to it!', timestamp: new Date(Date.now() - 1000 * 60 * 3) },
    { id: 'm3', senderId: '2', content: 'Perfecto! See you then!', timestamp: new Date(Date.now() - 1000 * 60 * 1) },
];


export default function ChatPage({ params }: { params: { id: string } }) {
    const swapRequest = swapRequests.find(r => r.id === params.id);

    if (!swapRequest) {
        notFound();
    }

    const otherUser = swapRequest.fromUser.id === currentUser.id ? swapRequest.toUser : swapRequest.fromUser;

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)]">
            <header className="flex items-center gap-4 p-4 border-b">
                <Button asChild variant="ghost" size="icon" className="md:hidden">
                    <Link href="/dashboard/requests"><ArrowLeft /></Link>
                </Button>
                <Avatar>
                    <AvatarImage src={otherUser.avatarUrl} alt={otherUser.name} />
                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="font-semibold text-lg">{otherUser.name}</h2>
                    <p className="text-sm text-muted-foreground">Regarding swap: {swapRequest.requestedSkill} for {swapRequest.offeredSkill}</p>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                    <div key={message.id} className={`flex items-end gap-2 ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                        {message.senderId !== currentUser.id && (
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={otherUser.avatarUrl} alt={otherUser.name} />
                                <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`rounded-lg px-4 py-2 max-w-sm ${message.senderId === currentUser.id ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                            <p>{message.content}</p>
                        </div>
                         {message.senderId === currentUser.id && (
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
            </main>
            <footer className="p-4 border-t">
                <div className="relative">
                    <Input placeholder="Type a message..." className="pr-12" />
                    <Button size="icon" className="absolute top-1/2 right-1.5 -translate-y-1/2 h-7 w-7">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </footer>
        </div>
    )
}
