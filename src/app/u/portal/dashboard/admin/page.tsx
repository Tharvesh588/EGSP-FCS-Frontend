
// This file is the new location for src/app/(app)/admin/dashboard/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gsap } from "gsap";

const overviewData = [
    { title: "Pending Items", value: "12" },
    { title: "Total Faculty", value: "250" },
    { title: "Active Users", value: "235" },
]

const recentActivity = [
    { text: "New faculty member added", time: "2 hours ago" },
    { text: "Department of Computer Science updated", time: "4 hours ago" },
    { text: "Faculty performance report generated", time: "1 day ago" },
    { text: "System settings modified", time: "2 days ago" },
    { text: "User account created", time: "3 days ago" },
]

const performanceData = [
    { name: 'A', value: 50 },
    { name: 'B', value: 70 },
    { name: 'C', value: 50 },
    { name: 'D', value: 30 },
    { name: 'E', value: 80 },
]

const engagementData = [
  { name: 'Jan', value: 109 },
  { name: 'Feb', value: 21 },
  { name: 'Mar', value: 41 },
  { name: 'Apr', value: 93 },
  { name: 'May', value: 33 },
  { name: 'Jun', value: 101 },
]

const getCurrentAcademicYear = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    // Academic year starts in June (index 5)
    if (currentMonth >= 5) {
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

export default function AdminDashboard() {
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const yearOptions = generateYearOptions();
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
        gsap.fromTo(
            ".dashboard-card",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: "power3.out" }
        );
         gsap.fromTo(
            ".timeline-item",
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, stagger: 0.2, duration: 0.5, ease: "power3.out", delay: 0.2 }
        );
    }
  }, []);

  return (
    <div className="space-y-8" ref={containerRef}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h2>
        <Select value={academicYear} onValueChange={setAcademicYear}>
          <SelectTrigger className="w-full sm:w-auto">
            <SelectValue placeholder="Select Academic Year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map(year => (
                <SelectItem key={year} value={year}>Academic Year {year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {overviewData.map(item => (
            <Card key={item.title} className="bg-card p-6 dashboard-card">
              <p className="text-base font-medium text-muted-foreground">{item.title}</p>
              <p className="text-4xl font-bold text-foreground mt-2">{item.value}</p>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h3 className="text-xl font-bold text-foreground mb-4">Recent Activity</h3>
          <div className="relative pl-8">
            <div className="absolute left-4 top-0 h-full w-0.5 bg-border"></div>
            <div className="space-y-8">
              {recentActivity.map((activity, index) => (
                <div key={index} className="relative timeline-item">
                  <div className="absolute -left-5 top-1 h-3 w-3 rounded-full bg-primary"></div>
                  <p className="font-medium text-foreground">{activity.text}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <h3 className="text-xl font-bold text-foreground mb-4">User Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 dashboard-card">
              <p className="text-base font-medium text-muted-foreground">Faculty Performance Distribution</p>
              <p className="text-3xl font-bold text-foreground mt-2">Average: 75%</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">Last Quarter</p>
                <p className="text-sm font-medium text-green-600">+10%</p>
              </div>
              <div className="h-40 mt-6 px-3">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Bar dataKey="value" fill="hsl(var(--primary)/0.2)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-6 dashboard-card">
              <p className="text-base font-medium text-muted-foreground">User Engagement Over Time</p>
              <p className="text-3xl font-bold text-foreground mt-2">Trend: +5%</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">Last 6 Months</p>
                <p className="text-sm font-medium text-green-600">+5%</p>
              </div>
              <div className="h-48 mt-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engagementData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#chart-gradient)" />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
