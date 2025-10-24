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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { colleges } from "@/lib/colleges";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type UserProfile = {
  name: string;
  email: string;
  phone: string;
  college: string;
  department?: string;
  avatar: string;
};

type Departments = {
    [key: string]: string[];
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Departments>({});

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
        const userProfile: UserProfile = {
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          college: userData.college || "",
          department: userData.department || "",
          avatar: userData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`
        };
        setUser(userProfile);
        setPreviewImage(userProfile.avatar);

        if (userProfile.college && colleges[userProfile.college as keyof typeof colleges]) {
          setDepartments(colleges[userProfile.college as keyof typeof colleges]);
        }
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
  
  const handleDepartmentChange = (value: string) => {
    if (!user) return;
    setUser({ ...user, department: value });
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
    if(user.department) {
      formData.append('department', user.department);
    }
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
          <div className="rounded-xl border bg-card p-6 mt-6">
            <h2 className="text-xl font-bold text-foreground mb-6">
                Profile Information
            </h2>
            {loading ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-6">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            ) : user ? (
                <div>
                  <div className="flex flex-col items-center sm:flex-row gap-6 mb-8">
                      <div className="flex flex-col items-center gap-2 flex-shrink-0">
                          <Label htmlFor="profile-image-upload" className="cursor-pointer">
                              <Avatar className="h-24 w-24">
                                  <AvatarImage src={previewImage || user.avatar} />
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                          </Label>
                          <Input id="profile-image-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                          <Button type="button" variant="ghost" size="sm" asChild>
                              <Label htmlFor="profile-image-upload" className="cursor-pointer">Change Photo</Label>
                          </Button>
                      </div>
                      <div className="text-center sm:text-left">
                          <h3 className="text-2xl font-bold">{user.name}</h3>
                          <p className="text-muted-foreground">{user.email}</p>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                              <Label htmlFor="name">Full Name</Label>
                              <Input id="name" name="name" value={user.name} onChange={handleInputChange} />
                          </div>
                          <div>
                              <Label htmlFor="phone">Phone</Label>
                              <Input id="phone" name="phone" type="tel" value={user.phone} onChange={handleInputChange} />
                          </div>
                      </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                              <Label>College</Label>
                              <Input value={user.college} disabled className="mt-1 bg-muted/50" />
                          </div>
                          <div>
                            <Label htmlFor="department">Department</Label>
                            <Select onValueChange={handleDepartmentChange} value={user.department}>
                                <SelectTrigger id="department">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(departments).map(([group, courses]) => (
                                        <SelectGroup key={group}>
                                            <SelectLabel>{group}</SelectLabel>
                                            {courses.map(course => (
                                                <SelectItem key={course} value={course}>{course}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))}
                                </SelectContent>
                            </Select>
                          </div>
                      </div>
                  </div>
                </div>
            ) : (
                 <p>Could not load user profile.</p>
            )}
             <div className="pt-6 mt-6 border-t flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Update Profile"}
              </Button>
            </div>
          </div>
        </form>
        <div className="rounded-xl border bg-card p-6 mt-6">
          <h2 className="text-xl font-bold text-foreground">Change Password</h2>
          <div className="space-y-4 max-w-lg mt-6">
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
            <div className="pt-2 flex justify-end">
              <Button>Update Password</Button>
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
