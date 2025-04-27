"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, X } from "lucide-react"
import { interviewerAPI, type Interviewer } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

export function InterviewerDetails({ id, onClose }: { id: string, onClose: () => void }) {
  const router = useRouter()
  const { toast } = useToast()
  const [interviewer, setInterviewer] = useState<Interviewer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInterviewer = async () => {
      try {
        setLoading(true)
        const data = await interviewerAPI.getById(id)
        setInterviewer(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch interviewer:", err)
        setError("Failed to load interviewer details. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load interviewer details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInterviewer()
  }, [id, toast])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this interviewer? This action cannot be undone.")) {
      return
    }

    try {
      await interviewerAPI.delete(id)
      toast({
        title: "Success",
        description: "Interviewer deleted successfully",
      })
      onClose()
    } catch (err) {
      console.error("Failed to delete interviewer:", err)
      toast({
        title: "Error",
        description: "Failed to delete interviewer",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading interviewer details...</div>
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

  if (!interviewer) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-center">
        <p className="text-destructive">Interviewer not found</p>
        <Button variant="outline" className="mt-2" onClick={onClose}>
          Back to Interviewers
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Card className="relative max-w-lg w-full mx-4">
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 rounded-full" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center">
          <Avatar className="h-32 w-32 mb-4">
            <AvatarImage
              src={
                interviewer.profilePicture
                  ? `data:image/jpeg;base64,${interviewer.profilePicture}`
                  : "/placeholder.svg"
              }
              alt={interviewer.name}
            />
            <AvatarFallback className="text-2xl">
              {interviewer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{interviewer.name}</h2>
          <Badge variant="secondary" className="mt-2">
            {interviewer.role.name}
          </Badge>

          <div className="w-full mt-6 space-y-3">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{interviewer.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{interviewer.phoneNumber}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push(`/dashboard/interviewers/${interviewer.id}/edit`)}>
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
