"use client"

import { usePathname, useSearchParams } from 'next/navigation';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import { Button } from "./ui/button";
import Link from 'next/link';

type User = {
  name: string;
  email: string;
  avatar: string;
  role: "faculty" | "admin";
}

function getTitleFromPathname(pathname: string): string {
    const parts = pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];

    if (!lastPart || lastPart === 'dashboard' || lastPart === 'admin' || lastPart === 'faculty') {
        const rolePart = parts.find(p => p === 'admin' || p === 'faculty');
        return rolePart ? `${rolePart.charAt(0).toUpperCase() + rolePart.slice(1)} Dashboard` : 'Dashboard';
    }
    
    return lastPart
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}


export function Header({ user }: { user: User }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const uid = searchParams.get('uid') || '';
    const title = getTitleFromPathname(pathname);
    const notificationsHref = user.role === 'admin' 
        ? `/u/portal/dashboard/admin/notifications?uid=${uid}`
        : `/u/portal/dashboard/notifications?uid=${uid}`;


  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex w-full items-center justify-between">
        <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
        <div className="flex items-center gap-4">
            <Link href={notificationsHref}>
                <Button variant="ghost" size="icon" className="rounded-full relative text-muted-foreground hover:text-foreground">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </Link>
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}
