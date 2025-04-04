"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Mail, Phone, School, Clock, User } from "lucide-react"
import { intervieweeAPI, interviewingProcessAPI, interviewAPI, type Interviewee, type InterviewingProcess, type Interview } from "@/lib/api-service"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from 'react-toastify'
import { formatDate } from "@/lib/utils"

const statusMap = {
  HIGHLY_INCLINED: { label: "Highly Inclined", badgeClass: "bg-green-500 text-white" },
  INCLINED: { label: "Inclined", badgeClass: "bg-emerald-500 text-white" },
  NEUTRAL: { label: "Neutral", badgeClass: "bg-gray-500 text-white" },
  DECLINED: { label: "Declined", badgeClass: "bg-red-500 text-white" },
  HIGHLY_DECLINED: { label: "Highly Declined", badgeClass: "bg-red-700 text-white" },
}

export default function IntervieweeDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [interviewee, setInterviewee] = useState<Interviewee | null>(null)
  const [processes, setProcesses] = useState<InterviewingProcess[]>([])
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null)
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingInterviews, setLoadingInterviews] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const id = params.id as string
        const [intervieweeData, processesData] = await Promise.all([
          intervieweeAPI.getById(id),
          interviewingProcessAPI.getByInterviewee(id),
        ])

        setInterviewee(intervieweeData)
        setProcesses(processesData)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch interviewee details:", err)
        setError("Failed to load interviewee details. Please try again later.")
        toast.error("Failed to load interviewee details")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  // Fetch interviews when process selection changes
  useEffect(() => {
    const fetchInterviews = async () => {
      if (!selectedProcessId) {
        setInterviews([]);
        return;
      }
      
      try {
        setLoadingInterviews(true);
        const intervieweeId = params.id as string;
        const data = await interviewAPI.getAll(intervieweeId, selectedProcessId);
        setInterviews(data);
      } catch (err) {
        console.error("Failed to fetch interviews:", err);
        toast.error("Failed to load interviews")
      } finally {
        setLoadingInterviews(false);
      }
    };

    fetchInterviews();
  }, [selectedProcessId, params.id]);

  const handleDelete = async () => {
    try {
      setLoading(true)
      await intervieweeAPI.delete(params.id as string)
      toast.success("Interviewee deleted successfully")
      router.push("/dashboard/interviewees")
    } catch (error) {
      console.error("Failed to delete interviewee:", error)
      toast.error("Failed to delete interviewee")
    } finally {
      setLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading interviewee details...</div>
  }

  if (error || !interviewee) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-center">
        <p className="text-destructive">{error || "Interviewee not found"}</p>
        <Button variant="outline" className="mt-2" onClick={() => router.push("/dashboard/interviewees")}>
          Back to Interviewees
        </Button>
      </div>
    )
  }

  // Get the decision from the newest interviewing process
  const status = interviewee.newestInterviewingProcess?.decision || null

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Interviewee Details</h1>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/interviewees/${interviewee.id}/edit`}>Edit</Link>
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Interviewee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this interviewee? This action cannot be undone 
              and will remove all associated data including interviews and processes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage
                  src={
                    interviewee.profilePicture
                      ? `data:image/jpeg;base64,${interviewee.profilePicture}`
                      : "/placeholder.svg"
                  }
                  alt={interviewee.name}
                />
                <AvatarFallback className="text-2xl">
                  {interviewee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{interviewee.name}</h2>
              {status ? (
                <Badge className={`mt-2 ${statusMap[status]?.badgeClass || ""}`}>
                  {statusMap[status]?.label || "Unknown"}
                </Badge>
              ) : (
                <Badge variant="secondary" className="mt-2">
                  No Process Available
                </Badge>
              )}

              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{interviewee.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{interviewee.phoneNumber}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">
                    {interviewee.dateOfBirth ? new Date(interviewee.dateOfBirth).toLocaleDateString() : "No DOB"}
                  </span>
                </div>
                <div className="flex items-center">
                  <School className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{interviewee.school?.name || "N/A"}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" asChild className="w-full">
                <a
                  href={`data:application/pdf;base64,${interviewee.resume}`}
                  download={`${interviewee.name.replace(/\s+/g, "_")}_resume.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Download Resume
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Interviewing Processes</CardTitle>
              <CardDescription>Overview of all interviewing processes for this candidate</CardDescription>
            </CardHeader>
            <CardContent className={`flex-1 overflow-y-auto max-h-96 ${processes.length === 0 ? "flex flex-col justify-center items-center" : ""}`}>
              {processes.length === 0 ? (
                <p className="text-muted-foreground">No interviewing processes found.</p>
              ) : (
                <div className="space-y-4">
                  {[...processes]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((process) => (
                      <div
                        key={process.id}
                        className={`border rounded-md p-4 cursor-pointer ${
                          selectedProcessId === process.id ? "border-blue-500 border-2" : ""
                        }`}
                        onClick={() => setSelectedProcessId(process.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{process.role?.name || "Unknown Role"}</h3>
                            <p className="text-sm text-muted-foreground">
                              Started: {formatDate(new Date(process.createdAt))}
                            </p>
                          </div>
                          <Badge className={`${statusMap[process.decision]?.badgeClass || ""}`}>
                            {statusMap[process.decision]?.label || "Unknown"}
                          </Badge>
                        </div>

                        {process.feedback && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Feedback:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                              {process.feedback}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex justify-end">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/interviewees/${interviewee.id}/process/${process.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href={`/dashboard/interviewees/${interviewee.id}/process/new`}>Start New Process</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Interview History</CardTitle>
              <CardDescription>
                All interviews conducted with this candidate and the selected process
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInterviews ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Loading interviews...</p>
                </div>
              ) : (
                (() => {
                  if (interviews.length === 0) {
                    return (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">
                          {selectedProcessId ? "No interviews found for this process." : "Please select a process to view interviews."}
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-4">
                      {interviews.map((interview) => (
                        <div key={interview.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center mt-1">
                                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(new Date(interview.scheduledAt))}
                                </p>
                              </div>
                              <div className="flex items-center mt-1">
                                <User className="h-4 w-4 mr-1 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Interviewer: {interview.interviewer?.name || "Unknown"}
                                </p>
                              </div>
                            </div>
                            <Badge className={`${statusMap[interview.decision]?.badgeClass || ""}`}>
                              {statusMap[interview.decision]?.label || "Unknown"}
                            </Badge>
                          </div>
                          {interview.feedback && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Feedback:</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                                {interview.feedback}
                              </p>
                            </div>
                          )}
                          <div className="mt-4 flex justify-end">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/interviews/${interview.id}`}>View Details</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </CardContent>
            <CardFooter>
              {selectedProcessId === null && (
                <p className="text-sm text-muted-foreground">Please select a process above before scheduling an interview</p>
              )}
              <Button 
                disabled={selectedProcessId === null}
                className={selectedProcessId === null ? "ml-auto" : ""}
                asChild={selectedProcessId !== null}
              >
                {selectedProcessId ? (
                  <Link href={`/dashboard/interviewees/${interviewee.id}/process/${selectedProcessId}/interview/new`}>
                    Schedule Interview
                  </Link>
                ) : (
                  "Schedule Interview"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}