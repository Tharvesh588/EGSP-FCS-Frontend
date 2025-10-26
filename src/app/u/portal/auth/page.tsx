
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from 'next/image';
import { format } from 'date-fns';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import Turnstile from "react-turnstile";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';
const SESSION_DURATION_SECONDS = 10 * 60; // 10 minutes

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  
  const isAdminLogin = searchParams.has('admin');
  const showTurnstile = email && password;

  useEffect(() => {
    const updateTimestamp = () => {
      setTimestamp(format(new Date(), 'HH:mm:ss'));
    };
    updateTimestamp();
    const timer = setInterval(updateTimestamp, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
        toast({
            variant: "destructive",
            title: "Verification Failed",
            description: "Please complete the security check before logging in.",
        });
        return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, turnstileToken }),
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Login failed");
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "An unknown server error occurred.");
        }
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.message || "Login failed");
      }
      
      const { token, role, id } = responseData.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);
      
      const sessionExpiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
      localStorage.setItem("sessionExpiresAt", sessionExpiresAt.toString());

      const redirectUrl = role === 'admin' 
        ? `/u/portal/dashboard/admin?uid=${id}`
        : `/u/portal/dashboard?uid=${id}`;
      
      router.push(redirectUrl);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-lg border border-border">
          <div className="flex justify-center mb-4">
              <Image
                  src="https://egspgroup.in/_next/image?url=%2Fassets%2Fegspgoi___logo.webp&w=256&q=75"
                  alt="College Logo"
                  width={120}
                  height={120}
                  className="bg-white"
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {showTurnstile && (
                    <div className="flex justify-center">
                        <Turnstile
                            sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!}
                            onVerify={(token) => setTurnstileToken(token)}
                            onExpire={() => setTurnstileToken(null)}
                            theme="light"
                        />
                    </div>
                )}
                
                <div className="flex items-center justify-end">
                    <div className="text-sm">
                        <a href="#" className="font-medium text-primary hover:text-primary/80">Forgot your password?</a>
                    </div>
                </div>
                <div>
                    <button type="submit" disabled={isLoading || !turnstileToken} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-colors disabled:opacity-50">
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </div>
            </form>
        </div>
      </main>
      <footer className="w-full bg-background border-t border-border p-4">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-2">
            <span>App Version: 0.1.0</span>
            <span suppressHydrationWarning>Session Time: {timestamp || 'Loading...'}</span>
            {isAdminLogin ? (
              <Link href="/u/portal/auth?faculty_login" className="text-primary hover:underline font-medium">
                Faculty Login
              </Link>
            ) : (
              <Link href="/u/portal/auth?admin" className="text-primary hover:underline font-medium">
                Admin Login
              </Link>
            )}
        </div>
      </footer>
    </div>
  );
}
