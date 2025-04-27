"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { intervieweeAPI, interviewerAPI, interviewAPI, interviewingProcessAPI, type Interviewee, type Interviewer, type InterviewingProcess } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export default function NewInterviewPage() {
  const [formData, setFormData] = useState({
    intervieweeId: "",
    interviewerId: "",
    processId: "",
    scheduledAt: "",
  })
  const [interviewees, setInterviewees] = useState<Interviewee[]>([])
  const [interviewers, setInterviewers] = useState<Interviewer[]>([])
  const [processes, setProcesses] = useState<InterviewingProcess[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true)
        const [intervieweesData, interviewersData] = await Promise.all([
          intervieweeAPI.getAll(),
          interviewerAPI.getAll(),
        ])

        setInterviewees(intervieweesData)
        setInterviewers(interviewersData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [toast])

  // Fetch interviewing processes when interviewee is selected
  useEffect(() => {
    const fetchProcesses = async () => {
      if (!formData.intervieweeId) return

      try {
        setLoadingData(true)
        const processesData = await interviewingProcessAPI.getByInterviewee(formData.intervieweeId)
        setProcesses(processesData)
      } catch (error) {
        console.error("Failed to fetch interviewing processes:", error)
        toast({
          title: "Error",
          description: "Failed to load interviewing processes",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }

    fetchProcesses()
  }, [formData.intervieweeId, toast])

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.intervieweeId || !formData.interviewerId || !formData.processId || !formData.scheduledAt) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const payload = {
        interviewerId: formData.interviewerId,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
      }

      await interviewAPI.create(formData.intervieweeId, formData.processId, payload)

      toast({
        title: "Success",
        description: "Interview scheduled successfully",
      })

      router.push("/dashboard/interviews")
    } catch (error) {
      console.error("Failed to schedule interview:", error)
      toast({
        title: "Error",
        description: "Failed to schedule interview. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="text-3xl font-bold mb-6">Schedule New Interview</h1>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="interviewee">Interviewee</Label>
              <Select
                value={formData.intervieweeId}
                onValueChange={(value) => handleChange("intervieweeId", value)}
                disabled={loadingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingData ? "Loading interviewees..." : "Select an interviewee"} />
                </SelectTrigger>
                <SelectContent>
                  {interviewees.map((interviewee) => (
                    <SelectItem key={interviewee.id} value={interviewee.id}>
                      {interviewee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.intervieweeId && (
              <div className="space-y-2">
                <Label htmlFor="process">Interviewing Process</Label>
                <Select
                  value={formData.processId}
                  onValueChange={(value) => handleChange("processId", value)}
                  disabled={loadingData || processes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingData
                          ? "Loading processes..."
                          : processes.length === 0
                            ? "No active processes found"
                            : "Select a process"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {processes.map((process) => (
                      <SelectItem key={process.id} value={process.id}>
                        {process.role?.name || "Unknown Role"} - {new Date(process.createdAt).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {processes.length === 0 && formData.intervieweeId && !loadingData && (
                  <p className="text-xs text-muted-foreground">
                    This interviewee has no active interviewing processes. Create one first.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="interviewer">Interviewer</Label>
              <Select
                value={formData.interviewerId}
                onValueChange={(value) => handleChange("interviewerId", value)}
                disabled={loadingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingData ? "Loading interviewers..." : "Select an interviewer"} />
                </SelectTrigger>
                <SelectContent>
                  {interviewers.map((interviewer) => (
                    <SelectItem key={interviewer.id} value={interviewer.id}>
                      {interviewer.name} - {interviewer.role?.name || "Unknown Role"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date & Time</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => handleChange("scheduledAt", e.target.value)}
                min={getMinDateTime()}
                required
              />
              <p className="text-xs text-muted-foreground">Interviews must be scheduled at least 1 hour in advance.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/interviews")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || loadingData}>
              {loading ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

function getMinDateTime() {
  const now = new Date()
  now.setHours(now.getHours() + 1)
  return now.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
}

