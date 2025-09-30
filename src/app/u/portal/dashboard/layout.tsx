"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { SidebarNav } from "@/components/sidebar-nav";
import { useState, useEffect, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const MOCK_USER = {
  name: "Dr. Eleanor Vance",
  email: "eleanor.v@egspec.org",
  role: "faculty" as const,
  avatar: PlaceHolderImages.find(img => img.id === 'faculty-avatar')?.imageUrl ?? "https://picsum.photos/seed/faculty/40/40",
};

const MOCK_ADMIN = {
    name: "Admin User",
    email: "admin@egspec.org",
    role: "admin" as const,
    avatar: PlaceHolderImages.find(img => img.id === 'admin-avatar')?.imageUrl ?? "https://picsum.photos/seed/admin/40/40",
}

type User = {
  name: string;
  email: string;
  role: 'faculty' | 'admin';
  avatar: string;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const role = localStorage.getItem("userRole") as 'admin' | 'faculty' | null;
    const uid = searchParams.get('uid');

    if (!role || !uid) {
        router.replace('/u/portal/auth?admin');
        return;
    }
    
    if (role === 'admin') {
      setUser(MOCK_ADMIN);
      if (pathname === '/u/portal/dashboard' && !pathname.includes('/admin')) {
        router.replace(`/u/portal/dashboard/admin?uid=${uid}`);
      }
    } else {
      setUser(MOCK_USER);
       if (pathname.includes('/admin')) {
        router.replace(`/u/portal/dashboard?uid=${uid}`);
      }
    }
  }, [router, pathname, searchParams]);

  if (!user) {
    return (
        <div className="flex min-h-screen">
            <Skeleton className="hidden md:block w-64 h-full" />
            <div className="flex-1 p-4 space-y-4">
                <Skeleton className="h-16" />
                <Skeleton className="h-96" />
            </div>
        </div>
    );
  }

  return (
    <SidebarProvider>
        <SidebarNav role={user.role} />
        <SidebarInset>
            <Header user={user} />
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
