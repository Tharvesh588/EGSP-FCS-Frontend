// This file is the new location for src/app/(app)/settings/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SettingsPage() {
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
            <div className="flex flex-col items-start gap-6 sm:flex-row">
              <div className="flex-1">
                <p className="text-lg font-bold text-foreground">Dr. Priya Sharma</p>
                <p className="text-muted-foreground">Professor, Computer Science</p>
              </div>
              <Avatar className="h-32 w-32 flex-shrink-0">
                <AvatarImage src="https://images.unsplash.com/photo-1573165850883-9b0e18c44bd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxwcm9mZXNzaW9uYWwlMjB3b21hbnxlbnwwfHx8fDE3NTkxMzA2NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080" />
                <AvatarFallback>PS</AvatarFallback>
              </Avatar>
            </div>
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
