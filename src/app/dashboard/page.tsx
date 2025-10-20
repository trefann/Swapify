import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { currentUser, scheduledSessions, swapRequests } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRightLeft, Calendar, Star } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const pendingRequestsCount = swapRequests.filter(r => r.toUser.id === currentUser.id && r.status === 'pending').length;
  const upcomingSessions = scheduledSessions.filter(s => s.startTime > new Date());

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, {currentUser.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here&apos;s a quick look at your SkillSwap activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Credits</CardTitle>
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentUser.credits}</div>
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
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
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
            <div className="text-2xl font-bold">+{pendingRequestsCount}</div>
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
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-2 rounded-lg bg-background hover:bg-secondary">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={session.participant.avatarUrl} />
                      <AvatarFallback>{session.participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{session.title}</p>
                      <p className="text-sm text-muted-foreground">with {session.participant.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{format(session.startTime, "EEE, MMM d")}</p>
                    <p className="text-sm text-muted-foreground">{format(session.startTime, "p")}</p>
                  </div>
                </div>
              ))
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
            {swapRequests.filter(r => r.toUser.id === currentUser.id && r.status === 'pending').length > 0 ? (
              swapRequests.filter(r => r.toUser.id === currentUser.id && r.status === 'pending').map((request) => (
                <div key={request.id} className="flex items-center justify-between p-2 rounded-lg bg-background hover:bg-secondary">
                  <div className="flex items-center gap-4">
                     <Avatar>
                      <AvatarImage src={request.fromUser.avatarUrl} />
                      <AvatarFallback>{request.fromUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Swap with {request.fromUser.name}</p>
                      <p className="text-sm text-muted-foreground">Wants to learn {request.requestedSkill}</p>
                    </div>
                  </div>
                  <Button asChild size="sm">
                    <Link href="/dashboard/requests">View</Link>
                  </Button>
                </div>
              ))
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
