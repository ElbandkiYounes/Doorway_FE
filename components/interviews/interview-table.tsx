"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Trash } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { interviewAPI, type Interview, type InterviewFilter } from "@/lib/api-service"
import { toast } from 'react-toastify'
import Link from "next/link"
import { formatDate } from "@/lib/utils"

const statusMap = {
  SCHEDULED: { label: "Scheduled", variant: "default" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
}

const getInterviewStatus = (interview: Interview) => {
  const now = new Date()
  const scheduledAt = new Date(interview.scheduledAt)

  if (interview.feedback) {
    return "COMPLETED"
  } else if (scheduledAt > now) {
    return "SCHEDULED"
  } else {
    return "COMPLETED"
  }
}

export function InterviewTable({ filters = {} }: { filters?: InterviewFilter }) {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [interviewToDelete, setInterviewToDelete] = useState<Interview | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true)
        const allInterviews = await interviewAPI.getAllInterviews()
        setInterviews(allInterviews)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch interviews:", err)
        setError("Failed to load interviews. Please try again later.")
        toast.error("Failed to load interviews")
      } finally {
        setLoading(false)
      }
    }
    fetchInterviews()
  }, [filters])

  const handleDelete = async () => {
    if (!interviewToDelete) return
    
    try {
      setIsDeleting(true)
      await interviewAPI.delete(interviewToDelete.id)
      setInterviews(interviews.filter((interview) => interview.id !== interviewToDelete.id))
      toast.success("Interview cancelled successfully")
      setIsDeleteDialogOpen(false)
      setInterviewToDelete(null)
    } catch (err) {
      console.error("Failed to cancel interview:", err)
      toast.error("Failed to cancel interview")
    } finally {
      setIsDeleting(false)
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
    <>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Interview</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this interview? This action cannot be undone.
              {interviewToDelete && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
                  <p><strong>Interview Details:</strong></p>
                  <p>Interviewee: {interviewToDelete.interviewingProcess?.interviewee?.name}</p>
                  <p>Interviewer: {interviewToDelete.interviewer?.name}</p>
                  <p>Role: {interviewToDelete.interviewingProcess?.role?.name}</p>
                  <p>Date: {formatDate(new Date(interviewToDelete.scheduledAt))}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setInterviewToDelete(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                        <div>
                          <div className="font-medium">{interviewee?.name || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">
                            {interviewee?.email || "No email"}
                          </div>
                        </div>
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
                        <div>
                          <div className="font-medium">{interview.interviewer?.name || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">
                            {interview.interviewer?.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {role?.name ? (
                        <Badge variant="outline">{role.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">No role</span>
                      )}
                    </TableCell>
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
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setInterviewToDelete(interview)
                                  setIsDeleteDialogOpen(true)
                                }}
                                className="text-destructive"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Cancel Interview</span>
                              </DropdownMenuItem>
                            </>
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
    </>
  )
}

