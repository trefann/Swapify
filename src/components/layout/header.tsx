'use client';
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "./user-nav";
import { Search } from "lucide-react";
import { useUser } from "@/firebase";

export function Header() {
  const { user } = useUser();

  if (!user) {
    return null; // Or a loading spinner
  }
  
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6 lg:px-8">
      <SidebarTrigger className="md:hidden" />

      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search skills..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      
      <UserNav />
    </header>
  );
}
