"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const notifications = [
  {
    type: "new_faculty",
    title: "New Faculty Member",
    message: "New faculty member, Dr. Anjali Sharma, has joined the department.",
    time: "2d ago",
    read: false,
    icon: "group_add",
  },
  {
    type: "deadline",
    title: "Activity Report Deadline",
    message: "The deadline for submitting faculty activity reports for the semester is approaching.",
    time: "3d ago",
    read: false,
    icon: "event",
  },
  {
    type: "approved",
    title: "Publication Approved",
    message: "Your recent publication in the Journal of Engineering Education has been approved.",
    time: "1w ago",
    read: true,
    icon: "task_alt",
  },
  {
    type: "evaluation",
    title: "Performance Evaluation",
    message: "The faculty performance evaluation for the academic year 2023-2024 is now available.",
    time: "2w ago",
    read: true,
    icon: "grading",
  },
  {
    type: "training",
    title: "Training Session",
    message: "A new training session on innovative teaching methodologies is scheduled for next month.",
    time: "3w ago",
    read: true,
    icon: "model_training",
  },
]

export default function NotificationsPage() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                All
                <span className="material-symbols-outlined ml-2 text-base">expand_more</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>All</DropdownMenuItem>
              <DropdownMenuItem>Unread</DropdownMenuItem>
              <DropdownMenuItem>Read</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="group flex cursor-pointer items-start gap-4 rounded-lg bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`relative flex shrink-0 items-center justify-center rounded-full size-12 ${
                  notification.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                }`}
              >
                <span className="material-symbols-outlined">{notification.icon}</span>
                {!notification.read && (
                  <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-primary ring-2 ring-card"></span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="mt-1 text-xs text-muted-foreground/80">{notification.time}</p>
              </div>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-base">more_vert</span>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
