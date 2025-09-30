"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("faculty@egspec.org");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle authentication here
    // For this demo, we'll use a simple check on the email.
    const role = email.startsWith("admin") ? "admin" : "faculty";
    localStorage.setItem("userRole", role);
    router.push("/");
  };

  return (
    <Card className="mx-auto w-full max-w-sm shadow-2xl">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
           <Logo className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-3xl font-headline">CreditWise</CardTitle>
        <CardDescription>
          EGS Pillay Engineering College Faculty Portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@egspec.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="#"
                className="ml-auto inline-block text-sm underline"
              >
                Forgot your password?
              </Link>
            </div>
            <Input id="password" type="password" defaultValue="password" required />
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
           <p className="text-center text-xs text-muted-foreground">
              Use <code className="font-semibold">admin@egspec.org</code> to log in as an admin.
            </p>
        </form>
      </CardContent>
    </Card>
  );
}
