"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart, Tooltip } from "recharts"

const barData = [
  { name: 'CSE', value: 40 },
  { name: 'ECE', value: 80 },
  { name: 'EEE', value: 60 },
  { name: 'MECH', value: 90 },
  { name: 'IT', value: 55 },
]

const lineData = [
  { name: 'Jan', value: 109 },
  { name: 'Feb', value: 21 },
  { name: 'Mar', value: 41 },
  { name: 'Apr', value: 93 },
  { name: 'May', value: 33 },
  { name: 'Jun', value: 101 },
  { name: 'Jul', value: 61 },
  { name: 'Aug', value: 45 },
  { name: 'Sep', value: 121 },
  { name: 'Oct', value: 149 },
  { name: 'Nov', value: 1 },
  { name: 'Dec', value: 81 },
]

export default function ReportsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Generate and analyze faculty performance reports.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-card p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Report Configuration
          </h3>
          <form className="space-y-6">
            <div>
              <label
                className="block text-sm font-medium text-muted-foreground mb-1"
                htmlFor="start-date"
              >
                Start Date
              </label>
              <Input id="start-date" type="date" />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-muted-foreground mb-1"
                htmlFor="end-date"
              >
                End Date
              </label>
              <Input id="end-date" type="date" />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-muted-foreground mb-1"
                htmlFor="report-type"
              >
                Report Type
              </label>
              <Select>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Overall Performance Summary" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall Performance Summary</SelectItem>
                  <SelectItem value="distribution">Credit Distribution by Department</SelectItem>
                  <SelectItem value="individual">Individual Faculty Report</SelectItem>
                  <SelectItem value="trends">Performance Trends Over Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button className="w-full" type="button">
                <span className="material-symbols-outlined text-base">summarize</span>
                Generate Report
              </Button>
              <Button className="w-full" variant="secondary" type="button">
                <span className="material-symbols-outlined text-base">download</span>
                Export
              </Button>
            </div>
          </form>
        </div>
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-base font-semibold text-foreground">
                  Credit Distribution by Department
                </h4>
                <p className="text-sm text-muted-foreground">Last 6 Months</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-foreground">
                  120 <span className="text-base font-medium text-muted-foreground">avg</span>
                </p>
                <p className="text-sm font-medium text-green-600 dark:text-green-500">+15%</p>
              </div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                        <Bar dataKey="value" fill="hsl(var(--primary) / 0.2)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-base font-semibold text-foreground">
                  User Performance Over Time
                </h4>
                <p className="text-sm text-muted-foreground">Last 12 Months</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-foreground">Increasing</p>
                <p className="text-sm font-medium text-green-600 dark:text-green-500">+8%</p>
              </div>
            </div>
            <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                         <defs>
                            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
                        <Area type="monotone" dataKey="value" stroke="false" fill="url(#chart-gradient)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// Note: You might need to add an 'Area' import from recharts if it's not already there.
// e.g. import { ... Area } from "recharts"
function Area(props: any) {
    return null
}
