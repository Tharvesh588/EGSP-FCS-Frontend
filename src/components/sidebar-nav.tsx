"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Award, BarChart3, BotMessageSquare, GanttChart, LayoutDashboard, ShieldCheck, Users, Files, LogOut, Settings, Bell, History, MessageSquareWarning, FolderKanban, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Logo, LogoAdmin } from "@/components/icons";

type SidebarNavProps = {
  role: "faculty" | "admin";
};

const getFacultyNav = (uid: string) => [
  { name: "Dashboard", href: `/u/portal/dashboard?uid=${uid}`, icon: LayoutDashboard },
  { name: "Good Works", href: `/u/portal/dashboard/good-works?uid=${uid}`, icon: Award },
  { name: "Submit", href: `/u/portal/dashboard/good-works/submit?uid=${uid}`, icon: Files },
  { name: "Appeals", href: `/u/portal/dashboard/appeals?uid=${uid}`, icon: ShieldCheck },
  { name: "Notifications", href: `/u/portal/dashboard/notifications?uid=${uid}`, icon: Bell },
  { name: "Settings", href: `/u/portal/dashboard/settings?uid=${uid}`, icon: Settings },
];

const getAdminNav = (uid: string) => [
  { name: "Dashboard", href: `/u/portal/dashboard/admin?uid=${uid}`, icon: LayoutDashboard },
  { name: "Faculty Accounts", href: `/u/portal/dashboard/admin/users?uid=${uid}`, icon: Users },
  { name: "Submissions", href: `/u/portal/dashboard/admin/review?uid=${uid}`, icon: FolderKanban },
  { name: "Negative Remarks", href: `/u/portal/dashboard/admin/remarks?uid=${uid}`, icon: MessageSquareWarning },
  { name: "Appeals", href: `/u/portal/dashboard/admin/appeals?uid=${uid}`, icon: ShieldAlert },
  { name: "Reports", href: `/u/portal/dashboard/admin/reports?uid=${uid}`, icon: BarChart3 },
];

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid') || '';

  const navItems = role === "admin" ? getAdminNav(uid) : getFacultyNav(uid);

  const getLoginUrl = () => {
    return role === 'admin' ? '/u/portal/auth?admin' : '/u/portal/auth?faculty_login';
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <Link href={role === 'admin' ? `/u/portal/dashboard/admin?uid=${uid}` : `/u/portal/dashboard?uid=${uid}`} className="flex items-center gap-2">
          <span className="text-lg font-semibold font-headline text-sidebar-foreground">
            EGSPGOI
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
                <SidebarMenuItem key={item.name}>
                <Link href={item.href}>
                    <SidebarMenuButton
                    isActive={pathname === item.href.split('?')[0]}
                    tooltip={item.name}
                    className="justify-start"
                    >
                    {Icon && <Icon className="h-5 w-5" />}
                    <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarSeparator />
         <SidebarMenu>
            <SidebarMenuItem>
                <Link href={getLoginUrl()} onClick={() => localStorage.removeItem('userRole')}>
                    <SidebarMenuButton tooltip="Logout" className="justify-start">
                        <LogOut className="h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
