"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentInterviews } from "@/components/dashboard/recent-interviews"
import { RecentProcesses } from "@/components/dashboard/recent-processes"
import { IntervieweeStatusChart } from "@/components/dashboard/interviewee-status-chart"

export default function Dashboard() {

  return (
    <div className="space-y-6 p-4">
      <DashboardStats />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IntervieweeStatusChart />
        <RecentProcesses />
      </div>
      <RecentInterviews />
    </div>
  );
}

