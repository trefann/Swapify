'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRightLeft, Calendar, Star } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { collection, query, where, doc, limit } from "firebase/firestore";
import type { SwapRequest, ScheduledSession, UserProfile } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const incomingRequestsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'swap_requests'),
      where('receiverId', '==', user.uid),
      where('status', '==', 'pending'),
      limit(5)
    );
  }, [firestore, user]);
  const { data: pendingRequests, isLoading: isLoadingRequests } = useCollection<SwapRequest>(incomingRequestsQuery);

  const upcomingSessionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // This is a simplified query. A real implementation would need to query based on user involvement.
    // This requires a `participants` array field on the session document.
    return query(
        collection(firestore, 'scheduled_sessions'), 
        where('participants', 'array-contains', user.uid),
        where('startTime', '>', new Date()),
        limit(5)
    );
  }, [firestore, user]);
  const { data: upcomingSessions, isLoading: isLoadingSessions } = useCollection<ScheduledSession>(upcomingSessionsQuery);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

  const getUserForEntity = (userId: string) => users?.find(u => u.id === userId);


  if (!userProfile || isLoadingRequests || isLoadingSessions || isLoadingUsers) {
    return (
       <div className="flex flex-col gap-8">
          <div>
            <div className="h-10 w-1/2 bg-muted rounded-md animate-pulse mb-2"></div>
            <div className="h-5 w-1/3 bg-muted rounded-md animate-pulse"></div>
          </div>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="shadow-lg"><CardContent className="pt-6"><div className="h-24 bg-muted animate-pulse rounded-md"></div></CardContent></Card>
              <Card className="shadow-lg"><CardContent className="pt-6"><div className="h-24 bg-muted animate-pulse rounded-md"></div></CardContent></Card>
              <Card className="shadow-lg"><CardContent className="pt-6"><div className="h-24 bg-muted animate-pulse rounded-md"></div></CardContent></Card>
           </div>
           <div className="grid gap-8 lg:grid-cols-2">
              <Card className="shadow-lg"><CardContent className="pt-6"><div className="h-64 bg-muted animate-pulse rounded-md"></div></CardContent></Card>
              <Card className="shadow-lg"><CardContent className="pt-6"><div className="h-64 bg-muted animate-pulse rounded-md"></div></CardContent></Card>
           </div>
       </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, {userProfile.displayName?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here&apos;s a quick look at your SkillSwap activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Credits</CardTitle>
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProfile.credits}</div>
            <p className="text-xs text-muted-foreground">
              Earn credits by teaching others.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              You have sessions scheduled soon.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{pendingRequests?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              New swap requests await your review.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingSessions && upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => {
                const otherParticipantId = session.participants.find(p => p !== user.uid);
                const participant = otherParticipantId ? getUserForEntity(otherParticipantId) : null;
                
                if (!participant) return null;
                
                return (
                  <div key={session.id} className="flex items-center justify-between p-2 rounded-lg bg-background hover:bg-secondary">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={participant.profilePicture} />
                        <AvatarFallback>{participant.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{session.title}</p>
                        <p className="text-sm text-muted-foreground">with {participant.displayName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{format(session.startTime.toDate(), "EEE, MMM d")}</p>
                      <p className="text-sm text-muted-foreground">{format(session.startTime.toDate(), "p")}</p>
                    </div>
                  </div>
                )
              })
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <p>No upcoming sessions.</p>
                    <Button variant="link" asChild><Link href="/dashboard/browse">Explore skills to learn</Link></Button>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Pending Swap Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests && pendingRequests.length > 0 ? (
              pendingRequests.map((request) => {
                const fromUser = getUserForEntity(request.requesterId);
                const skillBeingTaught = fromUser?.skillsOffered?.find(s => s.id === request.skillId);

                if (!fromUser) return null;

                return (
                  <div key={request.id} className="flex items-center justify-between p-2 rounded-lg bg-background hover:bg-secondary">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={fromUser.profilePicture} />
                        <AvatarFallback>{fromUser.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">Swap with {fromUser.displayName}</p>
                        <p className="text-sm text-muted-foreground">Wants to learn your skill</p>
                      </div>
                    </div>
                    <Button asChild size="sm">
                      <Link href="/dashboard/requests">View</Link>
                    </Button>
                  </div>
                )
              })
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <p>Your request inbox is empty.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
