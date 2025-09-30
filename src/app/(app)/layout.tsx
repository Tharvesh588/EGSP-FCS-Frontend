"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { SidebarNav } from "@/components/sidebar-nav";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Faking user role for demonstration. Change 'faculty' to 'admin' to see the admin view.
const MOCK_USER = {
  name: "Dr. Eleanor Vance",
  email: "eleanor.v@egspec.org",
  role: "faculty", // "faculty" or "admin"
  avatar: "https://picsum.photos/seed/faculty/40/40",
};

const MOCK_ADMIN = {
    name: "Admin User",
    email: "admin@egspec.org",
    role: "admin",
    avatar: "https://picsum.photos/seed/admin/40/40",
}

type User = {
  name: string;
  email: string;
  role: 'faculty' | 'admin';
  avatar: string;
}

function AppLayoutContent({ user }: { user: User }) {
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
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as 'faculty' | 'admin' | null;
    if (role === 'admin') {
      setUser(MOCK_ADMIN);
    } else {
      setUser(MOCK_USER);
    }
  }, []);

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
