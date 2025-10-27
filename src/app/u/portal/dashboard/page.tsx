
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlert } from "@/context/alert-context";
import { gsap } from "gsap";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

type CreditActivity = {
  _id: string;
  title: string;
  points: number;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
  type: 'positive' | 'negative';
};

type UserProfile = {
  currentCredit: number;
};

const getCurrentAcademicYear = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    if (currentMonth >= 5) { // June or later
      return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
    }
    return `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
};

const generateYearOptions = () => {
    const currentYearString = getCurrentAcademicYear();
    const [startCurrentYear] = currentYearString.split('-').map(Number);
    
    const years = [];
    for (let i = 0; i < 5; i++) {
        const startYear = startCurrentYear - i;
        const endYear = (startYear + 1).toString().slice(-2);
        years.push(`${startYear}-${endYear}`);
    }
    return years;
};

export default function FacultyDashboard() {
  const { showAlert } = useAlert();
  const searchParams = useSearchParams();
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentActivities, setRecentActivities] = useState<CreditActivity[]>([]);
  const [creditHistory, setCreditHistory] = useState<{ month: string; credits: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  const yearOptions = generateYearOptions();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const facultyId = searchParams.get('uid');

    if (!token || !facultyId) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch user profile for credit balance
        const profileResponse = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const profileData = await profileResponse.json();
        if (profileData.success) {
          setUserProfile(profileData.data);
        } else {
           throw new Error(profileData.message || "Failed to fetch user profile.");
        }

        // Fetch recent activities
        const activitiesResponse = await fetch(`${API_BASE_URL}/api/v1/credits/credits/faculty/${facultyId}?limit=5`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const activitiesData = await activitiesResponse.json();
        if (activitiesData.success) {
          setRecentActivities(activitiesData.items);
        } else {
            throw new Error(activitiesData.message || "Failed to fetch recent activities.");
        }
        
        // Fetch and process credit history
        const historyResponse = await fetch(`${API_BASE_URL}/api/v1/credits/credits/faculty/${facultyId}?limit=100`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const historyData = await historyResponse.json();
        if(historyData.success) {
            const monthlyCredits: { [key: string]: number } = {};
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            historyData.items.forEach((item: CreditActivity) => {
                if(item.status === 'approved') {
                    const date = new Date(item.createdAt);
                    const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                    if(!monthlyCredits[monthKey]) {
                        monthlyCredits[monthKey] = 0;
                    }
                    monthlyCredits[monthKey] += item.points;
                }
            });

            // Get last 6 months
            const last6Months = [];
            let currentDate = new Date();
            for (let i = 0; i < 6; i++) {
                const monthKey = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
                 const shortMonthKey = monthNames[currentDate.getMonth()];
                last6Months.unshift({ month: shortMonthKey, credits: monthlyCredits[monthKey] || 0 });
                currentDate.setMonth(currentDate.getMonth() - 1);
            }
            setCreditHistory(last6Months);

        } else {
            throw new Error(historyData.message || "Failed to fetch credit history.");
        }


      } catch (error: any) {
        showAlert(
          "Failed to load dashboard",
          error.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [searchParams, showAlert]);

  useEffect(() => {
    if (!loading && containerRef.current) {
        gsap.fromTo(
            ".dashboard-card",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, stagger: 0.15, duration: 0.6, ease: "power3.out" }
        );
    }
  }, [loading]);

  if (loading) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Skeleton className="h-9 w-72" />
                <Skeleton className="h-10 w-48" />
            </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
                    <CardContent><Skeleton className="h-12 w-20" /></CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Skeleton className="h-[150px] w-full" />
                    </CardContent>
                </Card>
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
             </div>
        </div>
    )
  }

  return (
    <div className="space-y-6" ref={containerRef}>
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-foreground">Faculty Dashboard</h2>
        <Select value={academicYear} onValueChange={setAcademicYear}>
          <SelectTrigger className="w-full sm:w-auto">
            <SelectValue placeholder="Select Academic Year" />
          </SelectTrigger>
          <SelectContent>
             {yearOptions.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1 dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-muted-foreground">
              Total Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-primary">
              {userProfile?.currentCredit ?? 0}
            </div>
            {/* Logic for percentage change can be added here if historical data is available */}
            {/* <p className="text-xs text-muted-foreground mt-2">
              +20.1% from last month
            </p> */}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 dashboard-card">
          <CardHeader>
            <CardTitle>Credit History (Last 6 Months)</CardTitle>
            <CardDescription>
              Overview of credits earned over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={creditHistory}>
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Bar dataKey="credits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-3 dashboard-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity) => (
                  <TableRow key={activity._id}>
                    <TableCell className="font-medium">
                      {activity.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant={activity.status === 'approved' ? 'default' : activity.status === 'pending' ? 'secondary' : 'destructive'}>
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={activity.points > 0 ? 'text-green-600' : 'text-red-600'}>
                        {activity.points > 0 ? `+${activity.points}` : activity.points}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
