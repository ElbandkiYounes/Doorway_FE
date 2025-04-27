"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { interviewAPI, intervieweeAPI } from "@/lib/api-service"
import { formatDate } from "@/lib/utils"
import { Calendar } from "lucide-react"
import Link from "next/link"

export function UpcomingInterviews() {
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpcomingInterviews = async () => {
      try {
        setLoading(true)
        
        // Get all interviews
        const allInterviews = await interviewAPI.getAllInterviews()
        
        // Filter to get only upcoming interviews
        const now = new Date()
        const upcomingInterviews = allInterviews
          .filter(interview => new Date(interview.scheduledAt) > now)
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
          .slice(0, 5) // Take only the 5 nearest upcoming interviews
        
        // Fetch interviewee data for each interview
        const interviewsWithData = await Promise.all(
          upcomingInterviews.map(async (interview) => {
            try {
              const intervieweeId = interview.interviewingProcess?.intervieweeId
              if (intervieweeId) {
                const interviewee = await intervieweeAPI.getById(intervieweeId)
                return {
                  ...interview,
                  intervieweeData: interviewee
                }
              }
              return interview
            } catch (error) {
              console.error(`Failed to fetch interviewee for interview ${interview.id}:`, error)
              return interview
            }
          })
        )

        setInterviews(interviewsWithData)
      } catch (error) {
        console.error("Failed to fetch upcoming interviews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingInterviews()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Interviews</CardTitle>
        <CardDescription>Next scheduled interviews</CardDescription>
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
            {interviews.length > 0 ? (
              interviews.map((interview) => (
                <Link 
                  href={`/dashboard/interviews/${interview.id}`} 
                  key={interview.id}
                  className="flex items-start p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage 
                      src={
                        interview.intervieweeData?.profilePicture 
                          ? `data:image/jpeg;base64,${interview.intervieweeData.profilePicture}` 
                          : "/placeholder.svg"
                      } 
                      alt={interview.intervieweeData?.name || "Unknown"} 
                    />
                    <AvatarFallback>
                      {interview.intervieweeData?.name
                        ? interview.intervieweeData.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                        : "UN"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{interview.intervieweeData?.name || "Unknown"}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {interview.interviewingProcess?.role?.name || "Unknown Role"}
                    </div>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {interview.scheduledAt ? formatDate(new Date(interview.scheduledAt)) : "Unknown date"}
                    </div>
                  </div>
                  <div>
                    {interview.interviewingProcess?.decision ? (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        interview.interviewingProcess.decision === "HIGHLY_INCLINED" ? "bg-green-500 text-white" :
                        interview.interviewingProcess.decision === "INCLINED" ? "bg-emerald-500 text-white" :
                        interview.interviewingProcess.decision === "NEUTRAL" ? "bg-gray-500 text-white" :
                        interview.interviewingProcess.decision === "DECLINED" ? "bg-red-500 text-white" :
                        interview.interviewingProcess.decision === "HIGHLY_DECLINED" ? "bg-red-700 text-white" :
                        "bg-gray-500 text-white"
                      }`}>
                        {interview.interviewingProcess.decision.replace(/_/g, " ")}
                      </span>
                    ) : (
                      <Badge variant={interview.interviewingProcess ? "outline" : "secondary"} className="ml-2">
                        {interview.interviewingProcess ? "Scheduled" : "No Process Available"}
                      </Badge>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No upcoming interviews scheduled
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

