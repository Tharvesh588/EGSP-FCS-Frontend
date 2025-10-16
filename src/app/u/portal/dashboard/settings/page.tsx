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
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type UserProfile = {
  name: string;
  email: string;
  phone: string;
  college: string;
  department?: string;
  avatar: string;
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      toast({ variant: "destructive", title: "Authentication Error" });
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const responseData = await response.json();
      if (responseData.success) {
        const userData = responseData.data;
        setUser({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          college: userData.college || "",
          department: userData.department || "",
          avatar: userData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`
        });
        setPreviewImage(userData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`);
      } else {
        throw new Error(responseData.message || "Failed to fetch user data");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUser();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 1024 * 1024) { // 1MB limit
            toast({ variant: "destructive", title: "Image Too Large", description: "Profile image must be less than 1MB." });
            return;
        }
        setProfileImage(file);
        setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    
    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append('name', user.name);
    formData.append('email', user.email);
    formData.append('phone', user.phone);
    if (profileImage) {
        formData.append('profileImage', profileImage);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });
        const responseData = await response.json();
        if(responseData.success) {
            toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
            fetchUser(); // Refetch user to get the latest data
        } else {
            throw new Error(responseData.message || "Failed to update profile.");
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
        setIsSaving(false);
    }
  };

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
        <form onSubmit={handleUpdateProfile}>
          <h2 className="text-xl font-bold text-foreground">
            Profile Information
          </h2>
          <div className="rounded-xl border bg-card p-6 mt-6">
            {loading ? (
                <div className="flex flex-col items-start gap-6 sm:flex-row">
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                    <Skeleton className="h-32 w-32 rounded-full flex-shrink-0" />
                </div>
            ) : user ? (
              <div className="flex flex-col-reverse items-center gap-8 sm:flex-row sm:items-start">
                <div className="flex-1 space-y-4 w-full">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" value={user.name} onChange={handleInputChange} />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={user.email} onChange={handleInputChange} />
                    </div>
                     <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" type="tel" value={user.phone} onChange={handleInputChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>College</Label>
                            <Input value={user.college} disabled />
                        </div>
                        <div>
                            <Label>Department</Label>
                            <Input value={user.department} disabled />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <Label htmlFor="profile-image-upload">
                        <Avatar className="h-32 w-32 cursor-pointer">
                            <AvatarImage src={previewImage || user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Label>
                    <Input id="profile-image-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                    <Button type="button" variant="ghost" size="sm" asChild>
                        <Label htmlFor="profile-image-upload" className="cursor-pointer">Change Photo</Label>
                    </Button>
                </div>
              </div>
            ) : (
                 <p>Could not load user profile.</p>
            )}
             <div className="pt-6 flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Update Profile"}
              </Button>
            </div>
          </div>
        </form>
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
