"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { intervieweeAPI } from "@/lib/api-service"

// Status mapping for different interview statuses with specific colors
const statusMap = {
  SCHEDULED: { label: "Scheduled", variant: "outline" },
  COMPLETED: { label: "Completed", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  NO_PROCESS: { label: "No Process Available", variant: "secondary" },
  HIGHLY_INCLINED: { label: "HIGHLY INCLINED", color: "bg-green-500 text-white" },
  INCLINED: { label: "INCLINED", color: "bg-emerald-500 text-white" },
  NEUTRAL: { label: "NEUTRAL", color: "bg-gray-500 text-white" },
  DECLINED: { label: "DECLINED", color: "bg-red-500 text-white" },
  HIGHLY_DECLINED: { label: "HIGHLY DECLINED", color: "bg-red-700 text-white" },
}

export function InterviewCalendarEvent({ event, viewType }: { event: any, viewType?: string }) {
  // For day or week views, hide time and show a minimal representation
  if (viewType === "day" || viewType === "week") {
    // For grouped events, show the count
    if (event.groupedEvents) {
      const count = event.groupedEvents.length;
      
      return (
        <div className="flex items-center justify-between p-1 w-full bg-blue-100 rounded-sm">
          <span className="text-xs font-medium text-blue-700">
            {count} {count === 1 ? 'interview' : 'interviews'}
            {count > 1 ? ` (+${count-1} more)` : ''}
          </span>
        </div>
      );
    }
    
    // For single events in day/week view, show minimal info without time
    const interview = event.interview;
    return (
      <div className="flex items-center justify-between p-1 w-full">
        <span className="text-xs font-medium truncate">
          {interview?.interviewer?.name || "Interview"}
        </span>
      </div>
    );
  }

  // Handle grouped events for other views (like month)
  if (event.groupedEvents) {
    const count = event.groupedEvents.length;
    
    return (
      <div className="flex items-center justify-between p-1 w-full bg-blue-100 rounded-sm">
        <span className="text-xs font-medium text-blue-700">
          {count} {count === 1 ? 'interview' : 'interviews'}
          {count > 1 ? ` (+${count-1} more)` : ''}
        </span>
      </div>
    );
  }

  const [interviewee, setInterviewee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // The interview object is now directly in the event
  const interview = event.interview
  const interviewer = interview?.interviewer
  const status = interview.decision
  const intervieweeId = interview?.interviewingProcess?.intervieweeId

  useEffect(() => {
    const fetchIntervieweeData = async () => {
      if (intervieweeId) {
        try {
          const data = await intervieweeAPI.getById(intervieweeId)
          setInterviewee(data)
        } catch (error) {
          console.error("Failed to fetch interviewee data:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchIntervieweeData()
  }, [intervieweeId])

  return (
    <div className="flex items-center space-x-2 p-1 w-full">
      <Avatar className="h-6 w-6">
        <AvatarImage
          src={
            interviewee?.profilePicture 
              ? `data:image/jpeg;base64,${interviewee.profilePicture}` 
              : "/placeholder.svg"
          }
          alt={interviewee?.name || "Unknown"}
        />
        <AvatarFallback className="text-xs">
          {interviewee?.name
            ? interviewee.name
                .split(" ")
                .map((n) => n[0])
                .join("")
            : "UN"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-grow overflow-hidden">
        <div className="font-medium text-sm truncate">
          {loading ? "Loading..." : (interviewee?.name || "Unknown")}
        </div>
        <div className="text-xs text-white truncate">
          {interviewer?.name || "Unknown Interviewer"}
        </div>
      </div>
      
      {status && (
        status !== "NO_PROCESS" && status !== "SCHEDULED" && status !== "COMPLETED" && status !== "CANCELLED" ? (
          <Badge 
            className={`text-[10px] px-2 py-0 h-5 ${statusMap[status]?.color || "bg-gray-500 text-white"}`}
          >
            {status.replace(/_/g, " ")}
          </Badge>
        ) : (
          <Badge 
            variant={(statusMap[status]?.variant as any) || "secondary"}
            className="text-[10px] px-2 py-0 h-5"
          >
            {statusMap[status]?.label || "Unknown"}
          </Badge>
        )
      )}
    </div>
  )
}