// This file is the new location for src/app/(app)/settings/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type UserProfile = {
  name: string;
  email: string;
  college: string;
  department?: string;
  avatar: string;
};

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        // Optionally redirect to login
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const responseData = await response.json();
        if (responseData.success) {
          const userData = responseData.data;
          setUser({
            name: userData.name,
            email: userData.email,
            college: userData.college,
            department: userData.department,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <div className="space-y-12">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">
            Profile Information
          </h2>
          <div className="rounded-xl border bg-card p-6">
            {loading ? (
                <div className="flex flex-col items-start gap-6 sm:flex-row">
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-5 w-64" />
                    </div>
                    <Skeleton className="h-32 w-32 rounded-full flex-shrink-0" />
                </div>
            ) : user ? (
                <div className="flex flex-col items-start gap-6 sm:flex-row">
                <div className="flex-1">
                    <p className="text-lg font-bold text-foreground">{user.name}</p>
                    <p className="text-muted-foreground">{user.department || 'N/A'}, {user.college}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Avatar className="h-32 w-32 flex-shrink-0">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                </div>
            ) : (
                 <p>Could not load user profile.</p>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Change Password</h2>
          <div className="space-y-4 max-w-lg">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                placeholder="Enter current password"
                type="password"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                placeholder="Enter new password"
                type="password"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                placeholder="Confirm new password"
                type="password"
                className="mt-1"
              />
            </div>
            <div className="pt-2">
              <p className="text-sm font-medium text-foreground mb-2">Password Strength</p>
              <div className="flex items-center gap-2">
                <Progress value={75} className="h-2 flex-1" />
                <p className="text-sm font-medium text-primary">Strong</p>
              </div>
            </div>
            <div className="pt-2">
              <Button className="w-full">Update Password</Button>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">
            Notification Preferences
          </h2>
          <div className="divide-y rounded-xl border bg-card">
            <div className="flex items-center justify-between p-4 sm:p-6">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important updates.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 sm:p-6">
              <div>
                <p className="font-medium text-foreground">In-App Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get in-app notifications for immediate alerts.
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
