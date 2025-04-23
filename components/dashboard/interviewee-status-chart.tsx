"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { intervieweeAPI, interviewAPI, Decision } from "@/lib/api-service"
import { Skeleton } from "@/components/ui/skeleton"

interface IntervieweeStatusChartProps {
  className?: string;
}

export function IntervieweeStatusChart({ className }: IntervieweeStatusChartProps) {
  const [chartData, setChartData] = useState<{ name: string; value: number; color: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDecisionStats = async () => {
      try {
        setLoading(true)

        // Get all interviews
        const allInterviewees = await intervieweeAPI.getAll()
        
        // Initialize counters for each decision
        const decisions = {
          [Decision.HIGHLY_INCLINED]: { count: 0, color: "#10b981" },  // green-500
          [Decision.INCLINED]: { count: 0, color: "#22c55e" },  // green-600
          [Decision.NEUTRAL]: { count: 0, color: "#a3a3a3" },  // neutral-400
          [Decision.DECLINED]: { count: 0, color: "#ef4444" },  // red-500
          [Decision.HIGHLY_DECLINED]: { count: 0, color: "#b91c1c" },  // red-700
          "IN_PROGRESS": { count: 0, color: "#3b82f6" }  // blue-500
        }

        // Count interviews by decision
        allInterviewees.forEach(interviewee => {
          const process = interviewee.newestInterviewingProcess
          
          if (process && process.decision) {
            decisions[process.decision].count++
          } else {
            decisions["IN_PROGRESS"].count++
          }
        })

        // Format data for the chart
        const formattedData = Object.entries(decisions)
          .filter(([_, stats]) => stats.count > 0)
          .map(([decision, stats]) => ({
            name: decision === "IN_PROGRESS" ? "In Progress" : decision.replace(/_/g, " ").toLowerCase(),
            value: stats.count,
            color: stats.color
          }))

        setChartData(formattedData)
      } catch (error) {
        console.error("Failed to fetch interviewee status data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDecisionStats()
  }, [])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Interviewee Status</CardTitle>
        <CardDescription>Distribution of interviewees by current status</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Skeleton className="w-[300px] h-[300px] rounded-full" />
          </div>
        ) : (
          <div className="h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

