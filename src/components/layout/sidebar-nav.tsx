'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutGrid,
  Search,
  User,
  ArrowRightLeft,
  Calendar,
  Settings,
  Star,
  BookOpen,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useDoc, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { Separator } from '../ui/separator';
import { doc } from 'firebase/firestore';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/dashboard/browse', label: 'Browse Skills', icon: Search },
  { href: '/dashboard/profile', label: 'My Profile', icon: User },
  { href: '/dashboard/requests', label: 'Swap Requests', icon: ArrowRightLeft },
  { href: '/dashboard/schedule', label: 'My Schedule', icon: Calendar },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary"/>
            <h1 className="text-xl font-bold font-headline">SkillSwap</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href}>
                <SidebarMenuButton
                  isActive={pathname === link.href}
                  tooltip={link.label}
                  asChild={false}
                >
                  <link.icon />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <Separator className="my-2" />
        {isLoading ? (
            <div className="flex items-center gap-3 p-2">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded-md"></div>
                    <div className="h-3 w-16 bg-muted animate-pulse rounded-md"></div>
                </div>
            </div>
        ) : userProfile && (
            <Link href="/dashboard/profile" className='block'>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent cursor-pointer">
                    <Avatar>
                        <AvatarImage src={userProfile.profilePicture} alt={userProfile.displayName} />
                        <AvatarFallback>{userProfile.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                        <p className="font-semibold truncate">{userProfile.displayName}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span>{userProfile.credits} Credits</span>
                        </div>
                    </div>
                </div>
            </Link>
        )}
      </SidebarFooter>
    </>
  );
}
