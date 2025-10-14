"use client"

import { usePathname, useSearchParams } from 'next/navigation';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import { Button } from "./ui/button";
import Link from 'next/link';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const READ_NOTIFICATIONS_KEY = 'readNotificationIds';

type User = {
  name: string;
  email: string;
  avatar: string;
  role: "faculty" | "admin";
}

export function Header({ user }: { user: User }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [hasUnread, setHasUnread] = useState(false);
    
    const uid = searchParams.get('uid') || '';
    const notificationsHref = user.role === 'admin' 
        ? `/u/portal/dashboard/admin/notifications?uid=${uid}`
        : `/u/portal/dashboard/notifications?uid=${uid}`;
    
    useEffect(() => {
        const checkNotifications = async () => {
            const token = localStorage.getItem("token");
            const facultyId = searchParams.get('uid');

            if (!token || !facultyId || user.role === 'admin') {
                setHasUnread(false);
                return;
            }

            try {
                const url = `${API_BASE_URL}/api/v1/credits/faculty/${facultyId}?limit=50`;
                const response = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
                const data = await response.json();
                
                if (data.success && data.items.length > 0) {
                    const storedReadIds = JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) || '[]');
                    const readIdsSet = new Set(storedReadIds);
                    const hasNew = data.items.some((item: any) => !readIdsSet.has(item._id));
                    setHasUnread(hasNew);
                } else {
                    setHasUnread(false);
                }
            } catch (error) {
                // Don't show toast for background check
                console.error("Failed to check notifications", error);
                setHasUnread(false);
            }
        };

        // Check on initial load and whenever path changes
        checkNotifications();

        // Also check periodically
        const interval = setInterval(checkNotifications, 60000); // every 60 seconds
        return () => clearInterval(interval);

    }, [pathname, searchParams, user.role, toast]);


  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <div className="hidden md:flex relative w-full max-w-sm items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="w-full bg-background pl-10"
            />
        </div>
      </div>
      <div className="flex w-full items-center justify-end gap-4">
          <Link href={notificationsHref}>
              <Button variant="ghost" size="icon" className="rounded-full relative text-muted-foreground hover:text-foreground">
                  <span className="material-symbols-outlined">notifications</span>
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                  <span className="sr-only">Toggle notifications</span>
              </Button>
          </Link>
        <UserNav user={user} />
      </div>
    </header>
  );
}
