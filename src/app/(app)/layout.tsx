import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { SidebarNav } from "@/components/sidebar-nav";

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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // To test different roles, change the user object below
  const user = MOCK_USER; 
  // const user = MOCK_ADMIN;

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
