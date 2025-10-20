import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/componentsui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { skills } from "@/lib/data";
import { Star, MessageCircle } from "lucide-react";
import Image from "next/image";

export default function BrowsePage() {
  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Explore Skills</h1>
        <p className="text-muted-foreground">Find a skill you want to learn and connect with a teacher.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {skills.map((skill) => (
          <Card key={skill.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
            <CardHeader className="p-0">
                <div className="relative aspect-video">
                    <Image 
                        src={skill.imageUrl}
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
                        <AvatarImage src={skill.user.avatarUrl} alt={skill.user.name} />
                        <AvatarFallback>{skill.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
                <div className="text-sm text-muted-foreground">
                    <p>Taught by <span className="font-semibold text-foreground">{skill.user.name}</span></p>
                    <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span>{skill.user.rating}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 bg-secondary/30">
              <Button className="w-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">Request Swap</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
