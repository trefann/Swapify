'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDoc, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { Mail, Edit, Sparkles, Star, Save } from "lucide-react";
import { suggestProfileBio, ProfileBioSuggestionInput } from '@/ai/flows/profile-bio-suggestion';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

function ProfileClient() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

  const [bio, setBio] = useState(userProfile?.bio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
      if (userProfile?.bio && !bio) {
        setBio(userProfile.bio);
      }
  }, [userProfile?.bio, bio]);


  const handleGenerateBio = async () => {
    setIsGenerating(true);
    try {
        const skills = [
            ...(userProfile?.skillsOffered?.map(s => s.name) || []),
            ...(userProfile?.skillsWanted?.map(s => s.name) || [])
        ];
      const input: ProfileBioSuggestionInput = { skills };
      const result = await suggestProfileBio(input);
      setBio(result.bio);
    } catch (error) {
      console.error("Failed to generate bio:", error);
      toast({
        title: "AI Error",
        description: "Could not generate a bio suggestion.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveBio = () => {
    if (!userProfileRef) return;
    updateDocumentNonBlocking(userProfileRef, { bio: bio });
    setIsEditingBio(false);
    toast({
        title: "Bio Updated",
        description: "Your bio has been successfully saved.",
    });
  }

  if (isLoading || !userProfile) {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <div className="h-10 w-1/3 bg-muted rounded-md animate-pulse mb-2"></div>
                <div className="h-5 w-1/4 bg-muted rounded-md animate-pulse"></div>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1 flex flex-col gap-8">
                    <Card className="shadow-lg"><CardContent className="pt-6"><div className="h-48 bg-muted animate-pulse rounded-md"></div></CardContent></Card>
                    <Card className="shadow-lg"><CardContent className="pt-6"><div className="h-32 bg-muted animate-pulse rounded-md"></div></CardContent></Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="shadow-lg"><CardContent className="pt-6"><div className="h-64 bg-muted animate-pulse rounded-md"></div></CardContent></Card>
                </div>
            </div>
        </div>
    )
  }

  return (
     <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">My Profile</h1>
            <p className="text-muted-foreground">Manage your public profile and skills.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 flex flex-col gap-8">
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4 border-4 border-background">
                    <AvatarImage src={userProfile.profilePicture} />
                    <AvatarFallback>{userProfile.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold font-headline">{userProfile.displayName}</h2>
                  <p className="text-muted-foreground">{userProfile.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">{userProfile.rating || 'New'}</span>
                    </div>
                    <span className="text-muted-foreground">·</span>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span className="font-semibold">{userProfile.credits} Credits</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg font-headline">About Me</CardTitle>
                </CardHeader>
                <CardContent>
                    {isEditingBio ? (
                      <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mb-4" />
                    ) : (
                      <p className="text-sm text-muted-foreground mb-4 h-24">
                          {bio || 'Tell us a bit about yourself...'}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2">
                        {isEditingBio ? (
                            <Button size="sm" onClick={handleSaveBio}><Save /> Save Bio</Button>
                        ) : (
                            <Button variant="outline" size="sm" onClick={() => setIsEditingBio(true)}><Edit /> Edit Bio</Button>
                        )}
                        <Button size="sm" onClick={handleGenerateBio} disabled={isGenerating}>
                            <Sparkles /> {isGenerating ? 'Generating...' : 'Suggest with AI'}
                        </Button>
                    </div>
                </CardContent>
             </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="teach">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="teach">Skills I Can Teach</TabsTrigger>
                <TabsTrigger value="learn">Skills I Want to Learn</TabsTrigger>
              </TabsList>
              <TabsContent value="teach">
                <Card className="shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                      {userProfile.skillsOffered?.map(skill => (
                        <Badge key={skill.id} variant="default" className="py-1 px-3 text-sm">{skill.name}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="learn">
                <Card className="shadow-lg">
                  <CardContent className="pt-6">
                     <div className="flex flex-wrap gap-2">
                      {userProfile.skillsWanted?.map(skill => (
                        <Badge key={skill.id} variant="secondary" className="py-1 px-3 text-sm">{skill.name}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="mt-8 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg font-headline">My Availability</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        {userProfile.availability && userProfile.availability.map((slot, index) => (
                            <li key={index} className="flex items-center gap-2">
                                <Badge variant="outline">{slot}</Badge>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

          </div>
        </div>
      </div>
  )
}


export default function ProfilePage() {
    return <ProfileClient />;
}
