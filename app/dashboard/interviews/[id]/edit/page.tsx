"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format, parseISO, addDays } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { interviewAPI, interviewerAPI, type Interview, type Interviewer, Decision } from "@/lib/api-service"
import { toast } from 'react-toastify'

interface FormData {
  interviewerId: string;
  scheduledAt: Date;
  interviewTime: string;
  decision: string;
  feedback?: string;
}

interface FormErrors {
  [key: string]: string; // Add index signature
  interviewerId: string;
  scheduledAt: string;
  interviewTime: string;
  decision: string;
}

export default function EditInterviewPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [interviewers, setInterviewers] = useState<Interviewer[]>([])
  const [interview, setInterview] = useState<Interview | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({
    interviewerId: "",
    scheduledAt: "",
    interviewTime: "",
    decision: "",
  })
  
  const [formData, setFormData] = useState<FormData>({
    interviewerId: "",
    scheduledAt: new Date(),
    feedback: "",
    interviewTime: "12:00",
    decision: Decision.NEUTRAL,
  })

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const interviewData = await interviewAPI.getById(params.id as string)
        setInterview(interviewData)
        setFormData({
          interviewerId: interviewData.interviewer.id,
          scheduledAt: parseISO(interviewData.scheduledAt),
          feedback: interviewData.feedback || "",
          interviewTime: format(parseISO(interviewData.scheduledAt), "HH:mm"),
          decision: interviewData.decision || Decision.NEUTRAL,
        })
      } catch (error) {
        console.error("Failed to fetch interview:", error)
        toast.error("Could not load interview details")
      }
    }

    const fetchInterviewers = async () => {
      try {
        const interviewers = await interviewerAPI.getAll()
        setInterviewers(interviewers)
      } catch (error) {
        console.error("Failed to fetch interviewers:", error)
        toast.error("Could not load interviewers")
      }
    }

    fetchInterview()
    fetchInterviewers()
  }, [params.id])

  const handleInputChange = (field: keyof FormData, value: string | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (field in formErrors) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const errors = { ...formErrors }
    let isValid = true

    if (!formData.interviewerId) {
      errors.interviewerId = "Please select an interviewer"
      isValid = false
    }

    if (!formData.scheduledAt) {
      errors.scheduledAt = "Please select a date"
      isValid = false
    }

    if (!formData.interviewTime) {
      errors.interviewTime = "Please select a time"
      isValid = false
    }

    // Check if selected date and time is in the future
    const now = new Date()
    const scheduledDateTime = new Date(formData.scheduledAt)
    const [hours, minutes] = formData.interviewTime.split(":").map(Number)
    scheduledDateTime.setHours(hours, minutes, 0, 0)

    if (scheduledDateTime <= now) {
      errors.scheduledAt = "Interview must be scheduled for a future date and time"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please correct the errors in the form")
      return
    }
    
    setIsLoading(true)

    try {
      const dateTime = new Date(formData.scheduledAt)
      const [hours, minutes] = formData.interviewTime.split(":").map(Number)
      dateTime.setHours(hours, minutes, 0, 0)

      const interviewData = {
        interviewerId: formData.interviewerId,
        scheduledAt: dateTime.toISOString(),
        feedback: formData.feedback || null,
        decision: formData.decision,
      }

      if (interview && interview.interviewingProcess) {
        await interviewAPI.update(interview.id as string, interview.interviewingProcess.intervieweeId, interview.interviewingProcess.id, interviewData)

        toast.success("Interview updated successfully")
        router.push(`/dashboard/interviews/${params.id}`)
      } else {
        throw new Error("Interview or interviewing process not found")
      }
    } catch (error) {
      console.error("Failed to update interview:", error)
      toast.error("Failed to update the interview")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="text-3xl font-bold mb-6">Edit Interview</h1>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="interviewer" className="flex justify-between">
                <span>Select Interviewer</span>
                {formErrors.interviewerId && (
                  <span className="text-sm text-destructive">{formErrors.interviewerId}</span>
                )}
              </Label>
              <Select
                value={formData.interviewerId}
                onValueChange={(value) => handleInputChange("interviewerId", value)}
              >
                <SelectTrigger className={formErrors.interviewerId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select an interviewer" />
                </SelectTrigger>
                <SelectContent>
                  {interviewers.map((interviewer) => (
                    <SelectItem key={interviewer.id} value={interviewer.id}>
                      {interviewer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt" className="flex justify-between">
                <span>Interview Date</span>
                {formErrors.scheduledAt && (
                  <span className="text-sm text-destructive">{formErrors.scheduledAt}</span>
                )}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.scheduledAt && "text-muted-foreground",
                      formErrors.scheduledAt && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduledAt ? format(formData.scheduledAt, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.scheduledAt}
                    onSelect={(date) => handleInputChange("scheduledAt", date || new Date())}
                    disabled={(date) => date < addDays(new Date(), -1)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interviewTime" className="flex justify-between">
                <span>Interview Time</span>
                {formErrors.interviewTime && (
                  <span className="text-sm text-destructive">{formErrors.interviewTime}</span>
                )}
              </Label>
              <Input
                id="interviewTime"
                type="time"
                value={formData.interviewTime}
                onChange={(e) => handleInputChange("interviewTime", e.target.value)}
                className={formErrors.interviewTime ? "border-destructive" : ""}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Add any special requirements or feedback for this interview"
                value={formData.feedback}
                onChange={(e) => handleInputChange("feedback", e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="decision" className="flex justify-between">
                <span>Decision</span>
                {formErrors.decision && (
                  <span className="text-sm text-destructive">{formErrors.decision}</span>
                )}
              </Label>
              <Select
                value={formData.decision}
                onValueChange={(value) => handleInputChange("decision", value)}
              >
                <SelectTrigger className={formErrors.decision ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a decision" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Decision).map((decision) => (
                    <SelectItem key={decision} value={decision}>
                      {decision.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, char => char.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/interviews/${params.id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
