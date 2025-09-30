"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  { name 'Mar', value: 41 },
  { name: 'Apr', value: 93 },
  { name: 'May', value: 33 },
  { name: 'Jun', value: 101 },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h2>
      
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {overviewData.map(item => (
            <Card key={item.title} className="bg-card p-6">
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
                <div key={index} className="relative">
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
            <Card className="p-6">
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
            <Card className="p-6">
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
