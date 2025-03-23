import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentInterviews } from "@/components/dashboard/recent-interviews"
import { UpcomingInterviews } from "@/components/dashboard/upcoming-interviews"
import { IntervieweeStatusChart } from "@/components/dashboard/interviewee-status-chart"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <DashboardStats />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IntervieweeStatusChart />
        <UpcomingInterviews />
      </div>
      <RecentInterviews />
    </div>
  )
}

