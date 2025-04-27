"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, Mail, Briefcase, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { interviewerAPI, type Interviewer, type Interview } from "@/lib/api-service"
import { toast } from "react-toastify"
import { formatDate } from "@/lib/utils"

interface InterviewerDetailsProps {
  id: string
  onClose: () => void
}

export function InterviewerDetails({ id, onClose }: InterviewerDetailsProps) {
  const [interviewer, setInterviewer] = useState<Interviewer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await interviewerAPI.getById(id)
        setInterviewer(data)
      } catch (err) {
        console.error("Failed to fetch interviewer:", err)
        toast.error("Could not load interviewer details")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Interviewer Details</DialogTitle>
          <DialogDescription>View detailed information about this interviewer.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : !interviewer ? (
          <div className="text-center py-4 text-destructive">Failed to load interviewer details</div>
        ) : (
          <div className="grid gap-6">
            {/* Basic Info Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={
                        interviewer.profilePicture
                          ? `data:image/jpeg;base64,${interviewer.profilePicture}`
                          : "/placeholder.svg"
                      }
                      alt={interviewer.name}
                    />
                    <AvatarFallback>
                      {interviewer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold">{interviewer.name}</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{interviewer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{interviewer.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="secondary">{interviewer.role?.name || "No Role Assigned"}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Interviews */}
            <Card>
              <CardContent className="pt-6">
                <h4 className="text-lg font-semibold mb-4">Recent Interviews</h4>
                {interviewer.interviews && interviewer.interviews.length > 0 ? (
                  <div className="space-y-4">
                    {interviewer.interviews.slice(0, 5).map((interview: Interview) => (
                      <div
                        key={interview.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                interview.interviewingProcess?.interviewee?.profilePicture
                                  ? `data:image/jpeg;base64,${interview.interviewingProcess.interviewee.profilePicture}`
                                  : "/placeholder.svg"
                              }
                              alt={interview.interviewingProcess?.interviewee?.name || "Unknown"}
                            />
                            <AvatarFallback>
                              {interview.interviewingProcess?.interviewee?.name
                                ? interview.interviewingProcess.interviewee.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                : "UN"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {interview.interviewingProcess?.interviewee?.name || "Unknown Interviewee"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {interview.interviewingProcess?.role?.name || "Unknown Role"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">{formatDate(new Date(interview.scheduledAt))}</span>
                          </div>
                          {interview.decision && (
                            <Badge className="bg-green-500 text-white">
                              {interview.decision}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">No interviews found</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
