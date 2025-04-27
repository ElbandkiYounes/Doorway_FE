"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { interviewAPI, intervieweeAPI, type Interview } from "@/lib/api-service"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export function RecentInterviews() {
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentInterviews = async () => {
      try {
        setLoading(true)
        
        // Get all interviews
        const allInterviews = await interviewAPI.getAllInterviews()
        
        // Sort by date (most recent first)
        const sortedInterviews = allInterviews
          .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
          .slice(0, 5) // Take only the 5 most recent
        
        // Fetch interviewee data for each interview
        const interviewsWithData = await Promise.all(
          sortedInterviews.map(async (interview) => {
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
        console.error("Failed to fetch recent interviews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentInterviews()
  }, [])

  const getInterviewStatus = (interview: Interview) => {
    if (!interview.decision) {
      // If the interview itself has no decision, check if it's past scheduled time
      const now = new Date()
      const scheduledAt = new Date(interview.scheduledAt)
  
      if (interview.feedback) {
        return { label: "Completed", variant: "default" as const }
      } else if (scheduledAt > now) {
        return { label: "Scheduled", variant: "outline" as const }
      } else if (scheduledAt < now) {
        return { label: "Completed", variant: "default" as const }
      } else {
        return { label: "Unknown", variant: "secondary" as const }
      }
    }
    
    // Return the decision from the interview itself
    const decisionLabel = interview.decision.replace(/_/g, " ");
        
    // Set colors based on decision using the provided statusMap
    let badgeClass = "";
    switch (interview.decision) {
      case "HIGHLY_INCLINED":
        badgeClass = "bg-green-500 text-white";
        break;
      case "INCLINED":
        badgeClass = "bg-emerald-500 text-white";
        break;
      case "NEUTRAL":
        badgeClass = "bg-gray-500 text-white";
        break;
      case "DECLINED":
        badgeClass = "bg-red-500 text-white";
        break;
      case "HIGHLY_DECLINED":
        badgeClass = "bg-red-700 text-white";
        break;
      default:
        badgeClass = "bg-gray-500 text-white";
    }
        
    return { label: decisionLabel, badgeClass };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Interviews</CardTitle>
        <CardDescription>Overview of recently completed interviews</CardDescription>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Interviewee</TableHead>
                <TableHead>Interviewer</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews.length > 0 ? (
                interviews.map((interview) => {
                  const status = getInterviewStatus(interview)
                  return (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <Link href={`/dashboard/interviews/${interview.id}`} className="hover:underline">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
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
                            <div>
                              <div className="font-medium">{interview.intervieweeData?.name || "Unknown"}</div>
                              <div className="text-xs text-muted-foreground">{interview.intervieweeData?.email || "No email"}</div>
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={
                                interview.interviewer?.profilePicture 
                                  ? `data:image/jpeg;base64,${interview.interviewer.profilePicture}` 
                                  : "/placeholder.svg"
                              } 
                              alt={interview.interviewer?.name || "Unknown"} 
                            />
                            <AvatarFallback>
                              {interview.interviewer?.name
                                ? interview.interviewer.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                : "UN"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{interview.interviewer?.name || "Unknown"}</div>
                            <div className="text-xs text-muted-foreground">{interview.interviewer?.email || "No email"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{interview.interviewingProcess?.role?.name || "Unknown Role"}</TableCell>
                      <TableCell>
                        {interview.scheduledAt ? formatDate(new Date(interview.scheduledAt)) : "Unknown date"}
                      </TableCell>
                      <TableCell>
                        {interview.decision ? (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.badgeClass || "bg-gray-500 text-white"}`}>
                            {status.label}
                          </span>
                        ) : (
                          <Badge variant={status.variant as any}>{status.label}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No recent interviews found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

