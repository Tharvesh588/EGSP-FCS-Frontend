"use client"

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import { Button } from "./ui/button";

type User = {
  name: string;
  email: string;
  avatar: string;
  role: "faculty" | "admin";
}

function getTitleFromPathname(pathname: string, role: 'faculty' | 'admin'): string {
    if (pathname.startsWith('/admin')) {
        if (pathname === '/admin/dashboard') return 'Super Admin Dashboard';
        if (pathname === '/admin/users') return 'Faculty Accounts';
        if (pathname === '/admin/review') return 'Good Works Submissions';
        if (pathname === '/admin/reports') return 'Reports & Analytics';
        if (pathname === '/admin/remarks') return 'Manage Negative Remarks';
        if (pathname === '/admin/appeals') return 'Appeal Review';
    } else {
        if (pathname === '/dashboard') return 'Dashboard';
        if (pathname === '/good-works') return 'My Good Works';
        if (pathname === '/good-works/submit') return 'Submit Achievement';
        if (pathname === '/appeals') return 'Appeals';
        if (pathname === '/notifications') return 'Notifications';
        if (pathname === '/settings') return 'Settings';
    }

    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Dashboard';

    const title = parts[parts.length - 1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    return title;
}


export function Header({ user }: { user: User }) {
    const pathname = usePathname();
    const title = getTitleFromPathname(pathname, user.role);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex w-full items-center justify-between">
        <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="sr-only">Toggle notifications</span>
            </Button>
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}
