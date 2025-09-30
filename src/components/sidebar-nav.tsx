"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const facultyNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Good Works", href: "/good-works", icon: Award },
  { name: "Submit", href: "/good-works/submit", icon: Files },
  { name: "Appeals", href: "/appeals", icon: ShieldCheck },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

const adminNav = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Faculty Accounts", href: "/admin/users", icon: Users },
  { name: "Submissions", href: "/admin/review", icon: FolderKanban },
  { name: "Negative Remarks", href: "/admin/remarks", icon: MessageSquareWarning },
  { name: "Appeals", href: "/admin/appeals", icon: ShieldAlert },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
];

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();
  const navItems = role === "admin" ? adminNav : facultyNav;

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
            {role === 'admin' ? <LogoAdmin className="h-8 w-8 text-sidebar-primary" /> : <Logo className="h-8 w-8 text-sidebar-primary" />}
          <span className="text-lg font-semibold font-headline text-sidebar-foreground">
            Credit Hub
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                  tooltip={item.name}
                  className="justify-start"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarSeparator />
         <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/login" legacyBehavior passHref>
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
