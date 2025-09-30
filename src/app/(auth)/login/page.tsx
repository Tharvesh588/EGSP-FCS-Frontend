"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("faculty@egspec.org");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const role = email.startsWith("admin") ? "admin" : "faculty";
    localStorage.setItem("userRole", role);
    router.push("/");
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-card rounded-xl shadow-lg border border-border">
        <div className="text-center">
            <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary rounded-full">
                    <Logo className="w-8 h-8 text-white" />
                </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">EGS Pillay Credit Hub</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to manage faculty performance</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
                <div>
                    <label className="sr-only" htmlFor="email">Email address</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">mail</span>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full pl-10 pr-3 py-3 border border-border bg-background rounded-lg placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="sr-only" htmlFor="password">Password</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">lock</span>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="w-full pl-10 pr-3 py-3 border border-border bg-background rounded-lg placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            placeholder="Password"
                            defaultValue="password"
                        />
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <p className="text-center text-xs text-muted-foreground">
                    Use <code className="font-semibold">admin@egspec.org</code> to log in as an admin.
                </p>
                <div className="text-sm">
                    <a href="#" className="font-medium text-primary hover:text-primary/80">Forgot your password?</a>
                </div>
            </div>
            <div>
                <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-colors">
                    Login
                </button>
            </div>
        </form>
    </div>
  );
}
