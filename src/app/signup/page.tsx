'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { Icons } from "@/components/icons"
import { useAuth, useUser, useFirestore } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from "@/hooks/use-toast";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const createInitialUserProfile = (user: any, displayName: string, email: string) => {
    if (!firestore) return;
    const userProfileRef = doc(firestore, "users", user.uid);
    const newUserProfile = {
      id: user.uid,
      displayName: displayName,
      email: email,
      profilePicture: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
      bio: "Welcome to SkillSwap! Tell everyone a little bit about yourself.",
      credits: 5, // Starting credits
      skillsOffered: [],
      skillsWanted: [],
      availability: ["Weekdays 6pm-9pm EST", "Weekends 10am-2pm EST"],
      rating: 0,
    };
    // Use non-blocking write
    setDocumentNonBlocking(userProfileRef, newUserProfile, { merge: true });
  }

  const handleGoogleSignUp = async () => {
    if (!auth) return;
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener will handle routing, but we create the profile here
      if (result.user.displayName && result.user.email) {
        createInitialUserProfile(result.user, result.user.displayName, result.user.email);
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setIsLoading(false);
        return;
      }
      console.error("Error signing up with Google", error);
      toast({
        title: "Sign Up Error",
        description: "Could not sign up with Google. Please try again.",
        variant: "destructive"
      })
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!auth) return;
    if (!emailRegex.test(email)) {
        toast({
            title: "Invalid Email",
            description: "Please enter a valid email address.",
            variant: "destructive"
        });
        return;
    }
    if (password.length < 6) {
        toast({
            title: "Weak Password",
            description: "Password must be at least 6 characters long.",
            variant: "destructive"
        });
        return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      createInitialUserProfile(userCredential.user, name, email);
    } catch (error: any) {
      console.error("Error signing up with email:", error);
      toast({
        title: "Sign Up Error",
        description: error.message || "Could not create your account. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (isUserLoading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
  }
  
  // Don't show page if user is already logged in
  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center items-center gap-3 mb-6">
            <BookOpen className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-bold font-headline">SkillSwap</h1>
        </div>
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
            <CardDescription>
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Alex Doe" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
            </div>
            <Button className="w-full" onClick={handleEmailSignUp} disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or sign up with
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={isLoading}>
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="underline hover:text-primary">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
