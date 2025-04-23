"use client";

import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { IntervieweeStatusChart } from "@/components/dashboard/interviewee-status-chart";
import { RecentInterviews } from "@/components/dashboard/recent-interviews";
import { RecentProcesses } from "@/components/dashboard/recent-processes";
import { UpcomingInterviews } from "@/components/dashboard/upcoming-interviews";
import { RoleGuard } from "@/components/role-guard";

export default function DashboardPage() {
  return (
    <RoleGuard adminOnly={true} fallbackPath="/dashboard/interviews">
      <div className="flex-1 space-y-6 p-0 md:p-6">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h2>
        <DashboardStats />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <IntervieweeStatusChart className="md:col-span-4" />
          <RecentProcesses className="md:col-span-3" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <UpcomingInterviews />
          <RecentInterviews />
        </div>
      </div>
    </RoleGuard>
  );
}

