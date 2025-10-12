
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from 'next/image';
import { format } from 'date-fns';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isLoginAsAdmin, setIsLoginAsAdmin] = useState(false);
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    if (searchParams.has("admin")) {
      setEmail("admin@egspec.org");
      setIsLoginAsAdmin(true);
    } else if (searchParams.has("faculty_login")) {
      setEmail("faculty@egspec.org");
      setIsLoginAsAdmin(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const updateTimestamp = () => {
      setTimestamp(format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
    };
    updateTimestamp();
    const timer = setInterval(updateTimestamp, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const role = email.startsWith("admin") ? "admin" : "faculty";
    localStorage.setItem("userRole", role);
    router.push(`/u/portal/dashboard?uid=${role === 'admin' ? 'admin123' : 'faculty456'}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-card rounded-xl shadow-lg border border-border">
          <div className="flex justify-center mb-4">
              <Image
                  src="https://egspgroup.in/_next/image?url=%2Fassets%2Fegspgoi___logo.webp&w=256&q=75"
                  alt="College Logo"
                  width={120}
                  height={120}
                  className="dark:invert"
              />
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
                <div className="flex items-center justify-end">
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
      </main>
      <footer className="w-full bg-background border-t border-border p-4">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-2">
            <span>App Version: 1.0.0</span>
            <span suppressHydrationWarning>Session Time: {timestamp || 'Loading...'}</span>
            <Link href="/u/portal/auth?admin" className="text-primary hover:underline font-medium">
                Admin Login
            </Link>
        </div>
      </footer>
    </div>
  );
}
