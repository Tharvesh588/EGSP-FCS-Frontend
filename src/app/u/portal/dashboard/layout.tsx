
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import React, { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardClientWrapper from "@/components/dashboard-client-wrapper";

const LoadingSkeleton = () => (
    <div className="flex min-h-screen">
        <div className="hidden md:block w-64 h-full bg-white dark:bg-card border-r">
            <div className="p-4 space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-96" />
        </div>
    </div>
);


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
        <Suspense fallback={<LoadingSkeleton />}>
            <DashboardClientWrapper>
                {children}
            </DashboardClientWrapper>
        </Suspense>
    </SidebarProvider>
  );
}
