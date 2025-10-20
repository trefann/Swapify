'use client';

import React, { useState, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import type { ScheduledSession, UserProfile } from "@/lib/types";
import { add, format, isSameDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { checkScheduleConflict } from '@/ai/flows/smart-scheduler';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { collection, query, where, Timestamp, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

async function createSession(firestore: any, sessionData: Omit<ScheduledSession, 'id' | 'swapRequestId'>, currentUser: any) {
    if (!currentUser) throw new Error("User not authenticated");
    const batch = writeBatch(firestore);

    // 1. Create the canonical session document
    const sessionRef = doc(collection(firestore, 'scheduled_sessions'));
    const fullSessionData = { 
      ...sessionData, 
      id: sessionRef.id, 
      swapRequestId: 'manual' // Or derive from a selected swap request
    };
    batch.set(sessionRef, fullSessionData);

    // 2. Create a reference for each participant in their own subcollection
    sessionData.participants.forEach(participantId => {
        const userSessionRef = doc(firestore, `users/${participantId}/scheduled_sessions`, sessionRef.id);
        batch.set(userSessionRef, fullSessionData);
    });

    // Commit the batch
    await batch.commit();
}


export default function SchedulePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isChecking, setIsChecking] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const { toast } = useToast();

  // state for the new session dialog
  const [isScheduling, setIsScheduling] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionParticipant, setNewSessionParticipant] = useState('');
  const [newSessionDate, setNewSessionDate] = useState<Date | undefined>(new Date());
  const [newSessionTime, setNewSessionTime] = useState("12:00");


  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // Query the user's own scheduled_sessions subcollection
    return query(collection(firestore, `users/${user.uid}/scheduled_sessions`));
  }, [firestore, user]);
  const { data: scheduledSessions, isLoading: isLoadingSessions } = useCollection<ScheduledSession>(sessionsQuery);
  
  const allParticipantIds = useMemo(() => {
    if(!scheduledSessions) return [];
    const ids = new Set<string>();
    scheduledSessions.forEach(s => s.participants.forEach(p => ids.add(p)));
    // Also add current user to fetch all users for the dropdown
    if (user) ids.add(user.uid);
    return Array.from(ids);
  }, [scheduledSessions, user]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore ) return null;
     // Fetch all users to populate the participant dropdown
    return query(collection(firestore, 'users'));
  }, [firestore]);
  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

  const sessionsForSelectedDay = scheduledSessions?.filter(session =>
    date && isSameDay((session.startTime as Timestamp).toDate(), date)
  ) || [];

 const handleScheduleSession = async () => {
    if (!user || !firestore || !newSessionDate || !newSessionParticipant || !newSessionTitle) {
      toast({ title: "Please fill out all fields", variant: "destructive" });
      return;
    }
    setIsScheduling(true);

    const [hours, minutes] = newSessionTime.split(':').map(Number);
    const startTime = new Date(newSessionDate);
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = add(startTime, { hours: 1 }); // Assume 1-hour sessions

    const newSession: Omit<ScheduledSession, 'id' | 'swapRequestId'> = {
      title: newSessionTitle,
      participants: [user.uid, newSessionParticipant],
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
    };

    try {
      await createSession(firestore, newSession, user);
      toast({ title: "Session Scheduled!", description: "The new session has been added to your calendar." });
      // Reset form
      setNewSessionTitle('');
      setNewSessionParticipant('');
    } catch(e) {
      console.error(e);
      toast({ title: "Scheduling failed", description: "Could not create the new session.", variant: "destructive" });
    } finally {
      setIsScheduling(false);
    }
  }


  const handleCheckConflict = async () => {
    setIsChecking(true);
    setConflict(null);
    if (!scheduledSessions || !newSessionDate) {
        toast({ title: "Please select a date and time", variant: "destructive" });
        setIsChecking(false);
        return;
    }
    
    const [hours, minutes] = newSessionTime.split(':').map(Number);
    const proposedStart = new Date(newSessionDate);
    proposedStart.setHours(hours, minutes, 0, 0);
    
    const proposedStartTime = proposedStart.toISOString();
    const proposedEndTime = add(proposedStart, { hours: 1 }).toISOString();
    
    const existingSchedulesForAI = scheduledSessions.map(s => ({
        startTime: (s.startTime as Timestamp).toDate().toISOString(),
        endTime: (s.endTime as Timestamp).toDate().toISOString(),
    }));

    try {
        const result = await checkScheduleConflict({ 
            proposedStartTime, 
            proposedEndTime,
            existingSchedules: existingSchedulesForAI
        });

        if (result.hasConflict) {
            setConflict(result.conflictDetails || "A conflict was found.");
        } else {
            toast({
                title: "No Conflict Found",
                description: "This time slot is available.",
                variant: "default",
            });
        }
    } catch(e) {
        toast({
            title: "Error",
            description: "Could not check for schedule conflicts.",
            variant: "destructive",
        });
    } finally {
        setIsChecking(false);
    }
  }
  
  const isLoading = isLoadingSessions || isLoadingUsers;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Schedule</h1>
        <p className="text-muted-foreground">View and manage your upcoming swap sessions.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
                disabled={isLoading}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sessions for {date ? format(date, "PPP") : "Today"}</CardTitle>
               <Dialog>
                <DialogTrigger asChild>
                    <Button disabled={isLoading}><PlusCircle /> New Session</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Schedule a New Swap</DialogTitle>
                        <DialogDescription>Fill in the details for your new session. Use the Smart Scheduler to avoid conflicts.</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4 py-4'>
                        <div className="space-y-2">
                            <Label htmlFor="title">Session Title</Label>
                            <Input id="title" placeholder="e.g., React Basics" value={newSessionTitle} onChange={e => setNewSessionTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="participant">Participant</Label>
                            <Select value={newSessionParticipant} onValueChange={setNewSessionParticipant}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users?.filter(u => u.id !== user?.uid).map(u => <SelectItem key={u.id} value={u.id}>{u.displayName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !newSessionDate && "text-muted-foreground"
                                        )}
                                        >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newSessionDate ? format(newSessionDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                        mode="single"
                                        selected={newSessionDate}
                                        onSelect={setNewSessionDate}
                                        initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="time">Time</Label>
                                <Input id="time" type="time" value={newSessionTime} onChange={e => setNewSessionTime(e.target.value)} />
                            </div>
                        </div>
                        {conflict && (
                            <Alert variant="destructive">
                                <AlertTitle>Scheduling Conflict</AlertTitle>
                                <AlertDescription>{conflict}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={handleCheckConflict} disabled={isChecking}>
                            <Sparkles /> {isChecking ? 'Checking...' : 'Smart Check'}
                        </Button>
                        <Button onClick={handleScheduleSession} disabled={isScheduling}>
                            {isScheduling ? 'Scheduling...' : 'Schedule'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
               </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                        <p>Loading sessions...</p>
                    </div>
                ) : sessionsForSelectedDay.length > 0 ? (
                  sessionsForSelectedDay.map((session: ScheduledSession) => {
                    const otherUserId = session.participants.find(p => p !== user?.uid);
                    const participant = users?.find(u => u.id === otherUserId);
                    if (!participant) return null;

                    return (
                        <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-secondary">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={participant.profilePicture} alt={participant.displayName} />
                                    <AvatarFallback>{participant.displayName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{session.title}</p>
                                    <p className="text-sm text-muted-foreground">with {participant.displayName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-sm">{format((session.startTime as Timestamp).toDate(), "p")} - {format((session.endTime as Timestamp).toDate(), "p")}</p>
                            </div>
                        </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No sessions scheduled for this day.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
