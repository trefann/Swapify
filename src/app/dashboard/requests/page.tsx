'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import type { SwapRequest, UserProfile, Skill } from "@/lib/types";
import { Check, MessageCircle, X, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { collection, doc, query, where, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const statusStyles: { [key: string]: string } = {
  pending: 'bg-yellow-400/20 text-yellow-300',
  accepted: 'bg-green-400/20 text-green-300',
  declined: 'bg-red-400/20 text-red-300',
  completed: 'bg-blue-400/20 text-blue-300',
  cancelled: 'bg-gray-400/20 text-gray-300',
};


export default function RequestsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const incomingRequestsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'swap_requests'), where('receiverId', '==', user.uid));
  }, [firestore, user]);
  const { data: incomingRequests, isLoading: isLoadingIncoming } = useCollection<SwapRequest>(incomingRequestsQuery);

  const outgoingRequestsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'swap_requests'), where('requesterId', '==', user.uid));
  }, [firestore, user]);
  const { data: outgoingRequests, isLoading: isLoadingOutgoing } = useCollection<SwapRequest>(outgoingRequestsQuery);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

  const skillsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'skills');
  }, [firestore]);
  const { data: skills, isLoading: isLoadingSkills } = useCollection<Skill>(skillsQuery);
  
  const handleUpdateRequest = (requestId: string, status: 'accepted' | 'declined') => {
    if (!firestore) return;
    const requestRef = doc(firestore, 'swap_requests', requestId);
    updateDocumentNonBlocking(requestRef, { status: status, updatedAt: Timestamp.now() });
    toast({
      title: `Request ${status}`,
      description: `The swap request has been ${status}.`,
    });
  }

  const RequestRow = ({ request, type }: { request: SwapRequest, type: 'incoming' | 'outgoing' }) => {
    const otherUserId = type === 'incoming' ? request.requesterId : request.receiverId;
    const otherUser = users?.find(u => u.id === otherUserId);
    const requestedSkill = skills?.find(s => s.id === request.skillId);
    
    // The skill being offered is one of the "otherUser's" skills. For a more robust app, this would be a direct reference.
    const offeredSkillOwner = type === 'incoming' ? otherUser : users?.find(u => u.id === user?.uid);
    const skillBeingOffered = skills?.find(s => s.userId === offeredSkillOwner?.id); // This is a simplification

    if (!otherUser || !requestedSkill) {
      return (
        <TableRow>
          <TableCell colSpan={5}>
            <div className="h-10 bg-muted animate-pulse rounded-md"></div>
          </TableCell>
        </TableRow>
      )
    }

    return (
      <TableRow key={request.id}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={otherUser.profilePicture} alt={otherUser.displayName} />
              <AvatarFallback>{otherUser.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{otherUser.displayName}</span>
          </div>
        </TableCell>
        <TableCell>
            <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{skillBeingOffered?.name || 'Their Skill'}</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                <Badge variant="default">{requestedSkill.name}</Badge>
            </div>
        </TableCell>
        <TableCell>{format((request.createdAt as Timestamp)?.toDate(), "PPp")}</TableCell>
        <TableCell>
          <Badge className={`${statusStyles[request.status]} capitalize`}>{request.status}</Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            {type === 'incoming' && request.status === 'pending' && (
              <>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateRequest(request.id, 'accepted')}><Check className="h-4 w-4" /></Button>
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleUpdateRequest(request.id, 'declined')}><X className="h-4 w-4" /></Button>
              </>
            )}
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <Link href={`/dashboard/chat/${request.id}`}><MessageCircle className="h-4 w-4" /></Link>
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  const isLoading = isLoadingIncoming || isLoadingOutgoing || isLoadingUsers || isLoadingSkills;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Swap Requests</h1>
        <p className="text-muted-foreground">Manage your incoming and outgoing requests.</p>
      </div>

      <Tabs defaultValue="incoming">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="incoming">Incoming</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
        </TabsList>
        <TabsContent value="incoming">
          <Card>
            <CardContent className="p-0 sm:p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Swap</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({length: 3}).map((_, i) => <RequestRow key={i} request={{} as any} type="incoming" />)
                  ) : (
                    incomingRequests?.map(req => <RequestRow key={req.id} request={req} type="incoming" />)
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="outgoing">
           <Card>
            <CardContent className="p-0 sm:p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Swap</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({length: 3}).map((_, i) => <RequestRow key={i} request={{} as any} type="outgoing" />)
                  ) : (
                    outgoingRequests?.map(req => <RequestRow key={req.id} request={req} type="outgoing" />)
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
