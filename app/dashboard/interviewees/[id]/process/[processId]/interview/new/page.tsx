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
import { format, addDays } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { interviewAPI, interviewerAPI } from "@/lib/api-service"

export default function NewInterviewPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [interviewers, setInterviewers] = useState([])
  const [formErrors, setFormErrors] = useState({
    interviewerId: "",
    scheduledAt: "",
    interviewTime: "",
  })
  
  const [formData, setFormData] = useState({
    interviewerId: "",
    scheduledAt: addDays(new Date(), 1), // Default to tomorrow
    feedback: "", // Changed from notes to feedback
    interviewTime: "12:00", // Default time
  })

  // Fetch available interviewers when component mounts
  useEffect(() => {
    const fetchInterviewers = async () => {
      try {
        const interviewers = await interviewerAPI.getAll()
        // Filter users who can be interviewers if needed
        setInterviewers(interviewers)
      } catch (error) {
        console.error("Failed to fetch interviewers:", error)
        toast({
          title: "Error",
          description: "Could not load interviewers",
          variant: "destructive",
        })
      }
    }

    fetchInterviewers()
  }, [toast])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    
    // Clear error when field is changed
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const validateForm = () => {
    const errors = {}
    let isValid = true

    // Validate interviewer
    if (!formData.interviewerId) {
      errors.interviewerId = "Please select an interviewer"
      isValid = false
    }

    // Validate date (not in the past)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Form validation failed",
        description: "Please correct the errors in the form",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)

    try {
      // Combine date and time
      const dateTime = new Date(formData.scheduledAt)
      const [hours, minutes] = formData.interviewTime.split(":").map(Number)
      dateTime.setHours(hours, minutes, 0, 0)

      const interviewData = {
        interviewerId: formData.interviewerId,
        scheduledAt: dateTime.toISOString(),
        feedback: formData.feedback || null, // Changed from notes to feedback
      }

      // Use the correct API function with interviewee ID and process ID params
      await interviewAPI.create(params.id as string, params.processId as string, interviewData)

      toast({
        title: "Interview scheduled",
        description: "The interview has been successfully scheduled",
      })

      // Navigate back to the interviewee details page
      router.push(`/dashboard/interviewees/${params.id}`)
    } catch (error) {
      console.error("Failed to schedule interview:", error)
      
      // Handle specific API errors if available
      const errorMessage = error.response?.data?.message || error.message || "Failed to schedule the interview";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
              <Label className="flex justify-between">
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
                    disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/interviewees/${params.id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
