"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BarChart3, BotMessageSquare, GanttChart, LayoutDashboard, ShieldCheck, Users, Files, LogOut } from "lucide-react";

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
import { Logo } from "@/components/icons";

type SidebarNavProps = {
  role: "faculty" | "admin";
};

const facultyNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Good Works", href: "/good-works/submit", icon: Award },
  { name: "Appeals", href: "/appeals", icon: ShieldCheck },
  { name: "History", href: "/history", icon: Files },
];

const adminNav = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Credit Tool", href: "/admin/credit-tool", icon: BotMessageSquare },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Review Submissions", href: "/admin/review", icon: GanttChart },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
];

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();
  const navItems = role === "admin" ? adminNav : facultyNav;

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-sidebar-primary" />
          <span className="text-lg font-semibold font-headline text-sidebar-foreground">
            CreditWise
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
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
                    <SidebarMenuButton tooltip="Logout" className="justify-start">
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
