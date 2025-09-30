"use client";

import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from "recharts";
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
import { adminDashboardData } from "@/lib/mock-data";
import { Award, ShieldAlert, Users, Sigma } from "lucide-react";

const statCards = [
    { title: "Pending Submissions", value: adminDashboardData.stats.pendingSubmissions, icon: Award, change: "+5 this week" },
    { title: "Active Appeals", value: adminDashboardData.stats.activeAppeals, icon: ShieldAlert, change: "+1 today" },
    { title: "Total Users", value: adminDashboardData.stats.totalUsers, icon: Users, change: "+12 this month" },
    { title: "Total Credits Awarded", value: adminDashboardData.stats.totalCreditsAwarded, icon: Sigma, change: "45,200 total" },
]

export default function AdminDashboard() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
            <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <card.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold font-headline">{card.value}</div>
                    <p className="text-xs text-muted-foreground">{card.change}</p>
                </CardContent>
            </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Credit Distribution</CardTitle>
            <CardDescription>By category across the institution.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={adminDashboardData.creditDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return (
                      <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {adminDashboardData.creditDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminDashboardData.recentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.description}</TableCell>
                    <TableCell>{activity.user}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{activity.date}</TableCell>
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
