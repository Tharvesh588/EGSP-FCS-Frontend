
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { colleges } from "@/lib/colleges";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera } from "lucide-react"
import { useAlert } from "@/context/alert-context"
import { gsap } from "gsap";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

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
  const { showAlert } = useAlert();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Departments>({});
  const containerRef = useRef(null);

  const fetchUser = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      showAlert("Authentication Error", "You are not logged in.");
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
      showAlert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
        gsap.fromTo(
            (containerRef.current as any).children,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: "power3.out" }
        );
    }
  }, [loading]);

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
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            showAlert("Image Too Large", "Profile image must be less than 2MB.");
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
    if(user.phone) formData.append('phone', user.phone);
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
            fetchUser();
        } else {
            throw new Error(responseData.message || "Failed to update profile.");
        }
    } catch (error: any) {
        showAlert("Update Failed", error.message);
    } finally {
        setIsSaving(false);
    }
  };
  
  if (loading) {
      return (
          <div className="mx-auto max-w-4xl space-y-8">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-4 w-96" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                      <Skeleton className="h-48 w-full" />
                  </div>
                  <div className="md:col-span-2">
                       <Skeleton className="h-10 w-full mb-4" />
                       <Skeleton className="h-64 w-full" />
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8" ref={containerRef}>
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
            <p className="mt-1 text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <Card className="text-center">
                    <CardContent className="p-6">
                         <div className="relative inline-block group">
                            <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                                <AvatarImage src={previewImage || user?.avatar} />
                                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                             <Label htmlFor="profile-image-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="h-6 w-6" />
                            </Label>
                             <Input id="profile-image-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                         </div>
                        <h2 className="text-xl font-semibold mt-4">{user?.name}</h2>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                <Tabs defaultValue="profile">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile">
                        <form onSubmit={handleUpdateProfile}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>Update your personal details here.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" name="name" value={user?.name} onChange={handleInputChange} />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input id="phone" name="phone" type="tel" value={user?.phone} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>College</Label>
                                            <Input value={user?.college} disabled className="mt-1 bg-muted/50" />
                                        </div>
                                        <div>
                                            <Label htmlFor="department">Department</Label>
                                            <Select onValueChange={handleDepartmentChange} value={user?.department}>
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
                                </CardContent>
                                <CardContent className="pt-6 border-t flex justify-end">
                                    <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Update Profile"}</Button>
                                </CardContent>
                            </Card>
                        </form>
                    </TabsContent>
                    <TabsContent value="password">
                         <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>For security, choose a strong password.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Input id="current-password" placeholder="Enter current password" type="password" />
                                </div>
                                <div>
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input id="new-password" placeholder="Enter new password" type="password" />
                                </div>
                                <div>
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input id="confirm-password" placeholder="Confirm new password" type="password" />
                                </div>
                            </CardContent>
                             <CardContent className="pt-6 border-t flex justify-end">
                                <Button>Update Password</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="notifications">
                         <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Manage how you receive notifications.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div>
                                        <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">Receive email notifications for important updates.</p>
                                    </div>
                                    <Switch id="email-notifications" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                     <div>
                                        <Label htmlFor="app-notifications" className="font-medium">In-App Notifications</Label>
                                        <p className="text-sm text-muted-foreground">Get in-app notifications for immediate alerts.</p>
                                    </div>
                                    <Switch id="app-notifications" />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    </div>
  )
}
