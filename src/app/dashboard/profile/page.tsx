'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentUser } from "@/lib/data";
import { Mail, Edit, Sparkles, Star } from "lucide-react";
import { suggestProfileBio, ProfileBioSuggestionInput } from '@/ai/flows/profile-bio-suggestion';

function ProfileClient() {
  const [bio, setBio] = useState(currentUser.bio);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateBio = async () => {
    setIsGenerating(true);
    try {
      const input: ProfileBioSuggestionInput = { skills: [...currentUser.skillsToTeach, ...currentUser.skillsToLearn] };
      const result = await suggestProfileBio(input);
      setBio(result.bio);
    } catch (error) {
      console.error("Failed to generate bio:", error);
      // Here you would use a toast to show an error message
    } finally {
      setIsGenerating(false);
    }
  };


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
                    <AvatarImage src={currentUser.avatarUrl} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold font-headline">{currentUser.name}</h2>
                  <p className="text-muted-foreground">{currentUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">{currentUser.rating}</span>
                    </div>
                    <span className="text-muted-foreground">·</span>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span className="font-semibold">{currentUser.credits} Credits</span>
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
                    <p className="text-sm text-muted-foreground mb-4">
                        {bio}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm"><Edit /> Edit Bio</Button>
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
                      {currentUser.skillsToTeach.map(skill => (
                        <Badge key={skill} variant="default" className="py-1 px-3 text-sm">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="learn">
                <Card className="shadow-lg">
                  <CardContent className="pt-6">
                     <div className="flex flex-wrap gap-2">
                      {currentUser.skillsToLearn.map(skill => (
                        <Badge key={skill} variant="secondary" className="py-1 px-3 text-sm">{skill}</Badge>
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
                        {currentUser.availability.map((slot, index) => (
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
