"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash, FileText } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { interviewAPI, type Interview } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

// Update the statusMap to match the new Decision enum values
const statusMap = {
  SCHEDULED: { label: "Scheduled", variant: "default" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
}

// Helper function to determine interview status
const getInterviewStatus = (interview: Interview) => {
  const now = new Date()
  const scheduledAt = new Date(interview.scheduledAt)

  if (interview.feedback) {
    return "COMPLETED"
  } else if (scheduledAt > now) {
    return "SCHEDULED"
  } else {
    return "COMPLETED" // Assuming past interviews without feedback are still completed
  }
}

export function InterviewTable() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true)
        // This is a simplified approach - in a real app, you might want to fetch all interviews
        // or provide filters to get interviews for specific interviewees/processes
        const allProcesses = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interviewing-processes`).then((res) =>
          res.json(),
        )

        let allInterviews: Interview[] = []
        for (const process of allProcesses) {
          if (process.intervieweeId && process.id) {
            const processInterviews = await interviewAPI.getAll(process.intervieweeId, process.id)
            allInterviews = [...allInterviews, ...processInterviews]
          }
        }

        setInterviews(allInterviews)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch interviews:", err)
        setError("Failed to load interviews. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load interviews",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInterviews()
  }, [toast])

  const handleDelete = async (id: string) => {
    try {
      await interviewAPI.delete(id)
      setInterviews(interviews.filter((interview) => interview.id !== id))
      toast({
        title: "Success",
        description: "Interview cancelled successfully",
      })
    } catch (err) {
      console.error("Failed to cancel interview:", err)
      toast({
        title: "Error",
        description: "Failed to cancel interview",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading interviews...</div>
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Interviewee</TableHead>
            <TableHead>Interviewer</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interviews.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No interviews found. Schedule your first interview to get started.
              </TableCell>
            </TableRow>
          ) : (
            interviews.map((interview) => {
              const status = getInterviewStatus(interview)
              const interviewee = interview.interviewingProcess?.interviewee
              const role = interview.interviewingProcess?.role

              return (
                <TableRow key={interview.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={
                            interviewee?.profilePicture
                              ? `data:image/jpeg;base64,${interviewee.profilePicture}`
                              : "/placeholder.svg"
                          }
                          alt={interviewee?.name || "Unknown"}
                        />
                        <AvatarFallback>
                          {interviewee?.name
                            ? interviewee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : "UN"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{interviewee?.name || "Unknown"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
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
                                .map((n) => n[0])
                                .join("")
                            : "UN"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{interview.interviewer?.name || "Unknown"}</div>
                    </div>
                  </TableCell>
                  <TableCell>{role?.name || "Unknown"}</TableCell>
                  <TableCell>{formatDate(new Date(interview.scheduledAt))}</TableCell>
                  <TableCell>
                    <Badge variant={(statusMap[status]?.variant as any) || "default"}>
                      {statusMap[status]?.label || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/interviews/${interview.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </Link>
                        </DropdownMenuItem>
                        {status === "SCHEDULED" && (
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/interviews/${interview.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {status === "COMPLETED" && (
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/interviews/${interview.id}/feedback`}>
                              <FileText className="mr-2 h-4 w-4" />
                              <span>View Feedback</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {status === "SCHEDULED" && (
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(interview.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Cancel</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

