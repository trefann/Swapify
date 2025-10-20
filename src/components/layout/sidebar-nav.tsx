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
import { currentUser } from '@/lib/data';
import { Separator } from '../ui/separator';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/dashboard/browse', label: 'Browse Skills', icon: Search },
  { href: '/dashboard/profile', label: 'My Profile', icon: User },
  { href: '/dashboard/requests', label: 'Swap Requests', icon: ArrowRightLeft },
  { href: '/dashboard/schedule', label: 'My Schedule', icon: Calendar },
];

export function SidebarNav() {
  const pathname = usePathname();

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
              <Link href={link.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === link.href}
                  tooltip={link.label}
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
        <Link href="/dashboard/profile" className='block'>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent cursor-pointer">
                <Avatar>
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <p className="font-semibold truncate">{currentUser.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span>{currentUser.credits} Credits</span>
                    </div>
                </div>
            </div>
        </Link>
      </SidebarFooter>
    </>
  );
}
