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
  { name: "Dashboard", href: `/u/portal/dashboard?uid=${uid}` },
  { name: "Good Works", href: `/u/portal/dashboard/good-works?uid=${uid}`},
  { name: "Submit", href: `/u/portal/dashboard/good-works/submit?uid=${uid}`},
  { name: "Appeals", href: `/u/portal/dashboard/appeals?uid=${uid}`},
  { name: "Notifications", href: `/u/portal/dashboard/notifications?uid=${uid}`},
  { name: "Settings", href: `/u/portal/dashboard/settings?uid=${uid}`},
];

const getAdminNav = (uid: string) => [
  { name: "Dashboard", href: `/u/portal/dashboard/admin?uid=${uid}` },
  { name: "Faculty Accounts", href: `/u/portal/dashboard/admin/users?uid=${uid}` },
  { name: "Submissions", href: `/u/portal/dashboard/admin/review?uid=${uid}` },
  { name: "Negative Remarks", href: `/u/portal/dashboard/admin/remarks?uid=${uid}` },
  { name: "Appeals", href: `/u/portal/dashboard/admin/appeals?uid=${uid}` },
  { name: "Reports", href: `/u/portal/dashboard/admin/reports?uid=${uid}` },
];

const iconMap: { [key: string]: React.ElementType } = {
    Dashboard: LayoutDashboard,
    "Good Works": Award,
    Submit: Files,
    Appeals: ShieldCheck,
    Notifications: Bell,
    Settings: Settings,
    "Faculty Accounts": Users,
    Submissions: FolderKanban,
    "Negative Remarks": MessageSquareWarning,
    Reports: BarChart3,
};


export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid') || '';

  const navItems = role === "admin" ? getAdminNav(uid) : getFacultyNav(uid);

  const getLoginUrl = () => {
    return role === 'admin' ? '/u/portal/auth?admin' : '/u/portal/auth?faculty_login';
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href={role === 'admin' ? `/u/portal/dashboard/admin?uid=${uid}` : `/u/portal/dashboard?uid=${uid}`} className="flex items-center gap-2">
            {role === 'admin' ? <LogoAdmin className="h-8 w-8 text-sidebar-primary" /> : <Logo className="h-8 w-8 text-sidebar-primary" />}
          <span className="text-lg font-semibold font-headline text-sidebar-foreground">
            Credit Hub
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = iconMap[item.name];
            return (
                <SidebarMenuItem key={item.name}>
                <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                    isActive={pathname === item.href.split('?')[0]}
                    tooltip={item.name}
                    className="justify-start"
                    >
                    {Icon && <Icon className="h-5 w-5" />}
                    <span>{item.name}</span>
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
                <Link href={getLoginUrl()} legacyBehavior passHref>
                    <SidebarMenuButton tooltip="Logout" className="justify-start" onClick={() => localStorage.removeItem('userRole')}>
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
