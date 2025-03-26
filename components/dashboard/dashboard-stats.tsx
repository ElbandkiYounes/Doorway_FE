"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCircle, Calendar } from "lucide-react"
import { intervieweeAPI, interviewerAPI, interviewAPI } from "@/lib/api-service"

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalInterviewees: 0,
    activeInterviewers: 0,
    scheduledInterviews: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // Fetch data in parallel
        const [interviewees, interviewers, interviews] = await Promise.all([
          intervieweeAPI.getAll(),
          interviewerAPI.getAll(),
          interviewAPI.getAllInterviews(),
        ])

        // Calculate scheduled interviews (future interviews)
        const now = new Date()
        const scheduled = interviews.filter(interview => 
          new Date(interview.scheduledAt) > now
        ).length

        setStats({
          totalInterviewees: interviewees.length,
          activeInterviewers: interviewers.length,
          scheduledInterviews: scheduled,
        })
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Interviewees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.totalInterviewees}
          </div>
          <p className="text-xs text-muted-foreground">Total candidates in system</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Interviewers</CardTitle>
          <UserCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.activeInterviewers}
          </div>
          <p className="text-xs text-muted-foreground">Current team members</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scheduled Interviews</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.scheduledInterviews}
          </div>
          <p className="text-xs text-muted-foreground">Upcoming interviews</p>
        </CardContent>
      </Card>
    </div>
  )
}

