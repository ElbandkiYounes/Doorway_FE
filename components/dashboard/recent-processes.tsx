"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { interviewingProcessAPI, intervieweeAPI } from "@/lib/api-service"
import { formatDate } from "@/lib/utils"
import { Briefcase } from "lucide-react"
import Link from "next/link"

interface RecentProcessesProps {
  className?: string;
}

export function RecentProcesses({ className }: RecentProcessesProps) {
  const [processes, setProcesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentProcesses = async () => {
      try {
        setLoading(true)
        
        // Get all interviewing processes
        const allProcesses = await interviewingProcessAPI.getAll()
        
        // Sort by date (most recent first)
        const sortedProcesses = allProcesses
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5) // Take only the 5 most recent
        
        // Fetch interviewee data for each process
        const processesWithData = await Promise.all(
          sortedProcesses.map(async (process) => {
            try {
              if (process.intervieweeId) {
                const interviewee = await intervieweeAPI.getById(process.intervieweeId)
                return {
                  ...process,
                  intervieweeData: interviewee
                }
              }
              return process
            } catch (error) {
              console.error(`Failed to fetch interviewee for process ${process.id}:`, error)
              return process
            }
          })
        )

        setProcesses(processesWithData)
      } catch (error) {
        console.error("Failed to fetch recent processes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentProcesses()
  }, [])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Processes</CardTitle>
        <CardDescription>Recently started interviewing processes</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[280px] overflow-y-auto pr-2 space-y-4">
            {processes.length > 0 ? (
              processes.map((process) => (
                <Link 
                  href={`/dashboard/interviewees/${process.intervieweeId}`} 
                  key={process.id}
                  className="flex items-start p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage 
                      src={
                        process.intervieweeData?.profilePicture 
                          ? `data:image/jpeg;base64,${process.intervieweeData.profilePicture}` 
                          : "/placeholder.svg"
                      } 
                      alt={process.intervieweeData?.name || "Unknown"} 
                    />
                    <AvatarFallback>
                      {process.intervieweeData?.name
                        ? process.intervieweeData.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                        : "UN"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{process.intervieweeData?.name || "Unknown"}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {process.role?.name || "Unknown Role"}
                    </div>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {process.createdAt ? formatDate(new Date(process.createdAt)) : "Unknown date"}
                    </div>
                  </div>
                  <div>
                    {process.decision ? (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        process.decision === "HIGHLY_INCLINED" ? "bg-green-500 text-white" :
                        process.decision === "INCLINED" ? "bg-emerald-500 text-white" :
                        process.decision === "NEUTRAL" ? "bg-gray-500 text-white" :
                        process.decision === "DECLINED" ? "bg-red-500 text-white" :
                        process.decision === "HIGHLY_DECLINED" ? "bg-red-700 text-white" :
                        "bg-gray-500 text-white"
                      }`}>
                        {process.decision.replace(/_/g, " ")}
                      </span>
                    ) : (
                      <Badge variant="secondary" className="ml-2">
                        No Decision
                      </Badge>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No recent processes found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
