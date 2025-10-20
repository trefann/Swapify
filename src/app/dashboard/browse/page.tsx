'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useUser, useFirestore } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import type { Skill, UserProfile } from "@/lib/types";
import { Star } from "lucide-react";
import Image from "next/image";
import { collection, query, where, getDocs, Timestamp, collectionGroup } from "firebase/firestore";
import { useMemo } from "react";
import { useMemoFirebase } from "@/firebase/provider";

export default function BrowsePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const skillsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'skills');
  }, [firestore]);
  const { data: skills, isLoading: isLoadingSkills } = useCollection<Skill>(skillsQuery);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

  const handleRequestSwap = async (skill: Skill) => {
    if (!user || !firestore) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to request a swap.",
        variant: "destructive",
      });
      return;
    }

    if (user.uid === skill.userId) {
      toast({
        title: "Invalid Request",
        description: "You cannot request to swap a skill with yourself.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if a swap request already exists
      const swapRequestsRef = collection(firestore, "swap_requests");
      const q = query(
        swapRequestsRef,
        where("requesterId", "==", user.uid),
        where("receiverId", "==", skill.userId),
        where("skillId", "==", skill.id)
      );

      const existingRequest = await getDocs(q);
      if (!existingRequest.empty) {
        toast({
          title: "Request Already Sent",
          description: "You have already sent a swap request for this skill.",
          variant: "destructive",
        });
        return;
      }
      
      const newRequest = {
        requesterId: user.uid,
        receiverId: skill.userId,
        skillId: skill.id,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDocumentNonBlocking(collection(firestore, "swap_requests"), newRequest);

      toast({
        title: "Swap Request Sent!",
        description: `Your request to learn ${skill.name} has been sent.`,
      });

    } catch (error) {
      console.error("Error requesting swap:", error);
      toast({
        title: "Uh oh! Something went wrong.",
        description: "Could not send swap request.",
        variant: "destructive",
      });
    }
  };

  const getUserForSkill = (userId: string) => users?.find(u => u.id === userId);


  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Explore Skills</h1>
        <p className="text-muted-foreground">Find a skill you want to learn and connect with a teacher.</p>
      </div>
      
      {(isLoadingSkills || isLoadingUsers) && (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="flex flex-col overflow-hidden shadow-lg">
                    <div className="relative aspect-video bg-muted animate-pulse"></div>
                    <CardContent className="p-4 flex-grow">
                        <div className="h-4 w-1/4 bg-muted animate-pulse rounded-md mb-2"></div>
                        <div className="h-6 w-3/4 bg-muted animate-pulse rounded-md mb-2"></div>
                        <div className="h-4 w-1/2 bg-muted animate-pulse rounded-md"></div>
                    </CardContent>
                    <CardFooter className="p-4 bg-secondary/30">
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
                    </CardFooter>
                </Card>
            ))}
        </div>
      )}


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {skills?.map((skill) => {
          const skillUser = getUserForSkill(skill.userId);
          if (!skillUser) return null; // Don't render if user data is not loaded yet
          return (
            <Card key={skill.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
              <CardHeader className="p-0">
                  <div className="relative aspect-video">
                      <Image 
                          src={skill.imageUrl || "https://picsum.photos/seed/skill-placeholder/600/400"}
                          alt={skill.name}
                          fill
                          className="object-cover"
                          data-ai-hint={skill.imageHint}
                      />
                  </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                  <div className="flex items-start justify-between">
                      <div>
                          <Badge variant="secondary" className="mb-2">{skill.category}</Badge>
                          <CardTitle className="text-lg font-headline mb-2">{skill.name}</CardTitle>
                      </div>
                      <Avatar className="h-12 w-12 border-2 border-background">
                          <AvatarImage src={skillUser.profilePicture} alt={skillUser.displayName} />
                          <AvatarFallback>{skillUser.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                  </div>
                  <div className="text-sm text-muted-foreground">
                      <p>Taught by <span className="font-semibold text-foreground">{skillUser.displayName}</span></p>
                      <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span>{skillUser.rating || 'New'}</span>
                      </div>
                  </div>
              </CardContent>
              <CardFooter className="p-4 bg-secondary/30">
                <Button onClick={() => handleRequestSwap(skill)} className="w-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30" disabled={!user || user.uid === skill.userId}>
                  Request Swap
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
