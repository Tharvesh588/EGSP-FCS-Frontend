"use client"

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";

type User = {
  name: string;
  email: string;
  avatar: string;
  role: "faculty" | "admin";
}

function getTitleFromPathname(pathname: string): string {
    if (pathname === '/dashboard') return 'Faculty Dashboard';
    if (pathname === '/admin/dashboard') return 'Admin Dashboard';
    if (pathname === '/admin/credit-tool') return 'AI Credit Allocation Tool';
    
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Dashboard';

    const title = parts[parts.length - 1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    return title;
}


export function Header({ user }: { user: User }) {
    const pathname = usePathname();
    const title = getTitleFromPathname(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex w-full items-center justify-between">
        <h1 className="text-xl font-semibold font-headline md:text-2xl">{title}</h1>
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Toggle notifications</span>
            </Button>
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}
