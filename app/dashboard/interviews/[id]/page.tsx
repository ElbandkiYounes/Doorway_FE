"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowLeft, Mail, Video, Link as LinkIcon } from "lucide-react"
import { useTheme } from "next-themes"
import {
  interviewAPI,
  intervieweeAPI,
  technicalQuestionAPI,
  principleQuestionAPI,
  technicalAnswerAPI,
  principleAnswerAPI,
  type Interview,
  type TechnicalQuestion,
  type PrincipleQuestion,
  type Interviewee,
  Language,
} from "@/lib/api-service"
import { formatDate, formatPrinciple } from "@/lib/utils"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "react-toastify"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs"
import "prismjs/components/prism-java"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-python"
import "prismjs/components/prism-csharp"
import "prismjs/components/prism-go"
import "prismjs/themes/prism-tomorrow.css"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const statusMap = {
  HIGHLY_INCLINED: { label: "Highly Inclined", badgeClass: "bg-green-500 text-white" },
  INCLINED: { label: "Inclined", badgeClass: "bg-emerald-500 text-white" },
  NEUTRAL: { label: "Neutral", badgeClass: "bg-gray-500 text-white" },
  DECLINED: { label: "Declined", badgeClass: "bg-red-500 text-white" },
  HIGHLY_DECLINED: { label: "Highly Declined", badgeClass: "bg-red-700 text-white" },
}

const getLanguageForPrism = (language: string) => {
  switch (language.toLowerCase()) {
    case "java":
      return languages.java
    case "javascript":
    case "typescript":
      return languages.javascript
    case "python":
      return languages.python
    case "csharp":
      return languages.csharp
    case "go":
      return languages.go
    default:
      return languages.java
  }
}

const getEditorStyles = (isDarkMode: boolean) => {
  return {
    fontFamily: '"Fira code", "Fira Mono", monospace',
    fontSize: 14,
    backgroundColor: isDarkMode ? "hsl(var(--muted))" : "hsl(var(--muted))",
    color: isDarkMode ? "hsl(var(--foreground))" : "hsl(var(--foreground))",
  }
}

export default function InterviewDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const [interview, setInterview] = useState<Interview | null>(null)
  const [interviewee, setInterviewee] = useState<Interviewee | null>(null)
  const [technicalQuestions, setTechnicalQuestions] = useState<TechnicalQuestion[]>([])
  const [principleQuestions, setPrincipleQuestions] = useState<PrincipleQuestion[]>([])
  const [newTechnicalAnswer, setNewTechnicalAnswer] = useState({
    questionId: "",
    answer: "",
    bar: "MEDIUM",
    language: Language.JAVA,
  })
  const [newPrincipleAnswer, setNewPrincipleAnswer] = useState({ questionId: "", answer: "", bar: "MEDIUM" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState({
    technicalQuestion: { questionId: "", answer: "", bar: "", language: "" },
    principleQuestion: { questionId: "", answer: "", bar: "" },
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false)
  const [meetingUrl, setMeetingUrl] = useState("")

  // Function to truncate the URL for display
  const truncateUrl = (url: string, maxLength = 50) => {
    if (url.length <= maxLength) return url

    const firstPart = url.substring(0, Math.floor(maxLength / 2) - 3)
    const lastPart = url.substring(url.length - Math.floor(maxLength / 2))
    return `${firstPart}...${lastPart}`
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const id = params.id as string

        // Fetch interview and answers in parallel
        const [interviewData, techAnswers, prinAnswers, techQuestions, prinQuestions] = await Promise.all([
          interviewAPI.getById(id),
          technicalAnswerAPI.getByInterviewId(id),
          principleAnswerAPI.getByInterviewId(id),
          technicalQuestionAPI.getAll(),
          principleQuestionAPI.getAll(),
        ])

        // Merge answers into interview data
        const interviewWithAnswers = {
          ...interviewData,
          technicalAnswers: techAnswers,
          principleAnswers: prinAnswers,
        }

        setInterview(interviewWithAnswers)
        setTechnicalQuestions(techQuestions)
        setPrincipleQuestions(prinQuestions)

        // Fetch interviewee data if available
        if (interviewData.interviewingProcess?.intervieweeId) {
          const intervieweeData = await intervieweeAPI.getById(interviewData.interviewingProcess.intervieweeId)
          setInterviewee(intervieweeData)
        }

        setError(null)
      } catch (err) {
        console.error("Failed to fetch interview details:", err)
        setError("Failed to load interview details. Please try again later.")
        toast.error("Failed to load interview details")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleDelete = async () => {
    if (!interview) return

    setIsDeleting(true)
    try {
      await interviewAPI.delete(interview.id)
      toast.success("Interview deleted successfully")

      // Navigate back to the interviewee page
      if (interview.interviewingProcess?.interviewee?.id) {
        router.push(`/dashboard/interviewees/${interview.interviewingProcess.interviewee.id}`)
      } else {
        router.push("/dashboard/interviews")
      }
    } catch (err) {
      console.error("Failed to delete interview:", err)
      toast.error("Failed to delete interview")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const validateTechnicalAnswer = () => {
    const errors = { questionId: "", answer: "", bar: "", language: "" }
    let isValid = true

    if (!newTechnicalAnswer.questionId) {
      errors.questionId = "Please select a question"
      isValid = false
    }
    if (!newTechnicalAnswer.answer.trim()) {
      errors.answer = "Please provide an answer"
      isValid = false
    }
    if (!newTechnicalAnswer.bar) {
      errors.bar = "Please select a bar"
      isValid = false
    }
    if (!newTechnicalAnswer.language) {
      errors.language = "Please select a language"
      isValid = false
    }

    setFormErrors((prev) => ({
      ...prev,
      technicalQuestion: errors,
    }))
    return isValid
  }

  const validatePrincipleAnswer = () => {
    const errors = { questionId: "", answer: "", bar: "" }
    let isValid = true

    if (!newPrincipleAnswer.questionId) {
      errors.questionId = "Please select a question"
      isValid = false
    }
    if (!newPrincipleAnswer.answer.trim()) {
      errors.answer = "Please provide an answer"
      isValid = false
    }
    if (!newPrincipleAnswer.bar) {
      errors.bar = "Please select a bar"
      isValid = false
    }

    setFormErrors((prev) => ({
      ...prev,
      principleQuestion: errors,
    }))
    return isValid
  }

  const handleAddTechnicalAnswer = async () => {
    if (!interview) return

    if (!validateTechnicalAnswer()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const newAnswer = await technicalAnswerAPI.create(newTechnicalAnswer.questionId, interview.id, {
        answer: newTechnicalAnswer.answer,
        bar: newTechnicalAnswer.bar,
        language: newTechnicalAnswer.language,
      })

      const questionDetails = technicalQuestions.find((q) => q.id.toString() === newTechnicalAnswer.questionId)

      if (!questionDetails) {
        throw new Error("Question not found")
      }

      // Update with type-safe answer
      setInterview((prev) => {
        if (!prev) return null
        return {
          ...prev,
          technicalAnswers: [
            ...(prev.technicalAnswers || []),
            {
              ...newAnswer,
              question: questionDetails, // Now we know questionDetails is defined
            },
          ],
        }
      })

      toast.success("Technical answer added successfully")

      setNewTechnicalAnswer({ questionId: "", answer: "", bar: "MEDIUM", language: Language.JAVA })
    } catch (err) {
      console.error("Failed to add technical answer:", err)
      toast.error(err instanceof Error ? err.message : "Failed to add technical answer")
    }
  }

  const handleAddPrincipleAnswer = async () => {
    if (!interview) return

    if (!validatePrincipleAnswer()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const newAnswer = await principleAnswerAPI.create(newPrincipleAnswer.questionId, interview.id, {
        answer: newPrincipleAnswer.answer,
        bar: newPrincipleAnswer.bar,
      })

      const questionDetails = principleQuestions.find((q) => q.id.toString() === newPrincipleAnswer.questionId)

      if (!questionDetails) {
        throw new Error("Question not found")
      }

      // Update with type-safe answer
      setInterview((prev) => {
        if (!prev) return null
        return {
          ...prev,
          principleAnswers: [
            ...(prev.principleAnswers || []),
            {
              ...newAnswer,
              question: questionDetails, // Now we know questionDetails is defined
            },
          ],
        }
      })

      toast.success("Principle answer added successfully")

      setNewPrincipleAnswer({ questionId: "", answer: "", bar: "MEDIUM" })
    } catch (err) {
      console.error("Failed to add principle answer:", err)
      toast.error(err instanceof Error ? err.message : "Failed to add principle answer")
    }
  }

  // Generate a meeting URL based on interview ID
  const generateMeetingUrl = () => {
    const uniqueId = `${interview?.id}-${Date.now()}`
    return `${window.location.origin}/meeting/${uniqueId}`
  }

  const handleStartMeeting = () => {
    const url = generateMeetingUrl()
    setMeetingUrl(url)
    setIsMeetingDialogOpen(true)
  }

  const joinAsHost = () => {
    window.open(`${meetingUrl}?role=host`, "_blank")
    setIsMeetingDialogOpen(false)
  }

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(meetingUrl)
    toast.success("Meeting link copied to clipboard")
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading interview details...</div>
  }

  if (error || !interview) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-center">
        <p className="text-destructive">{error || "Interview not found"}</p>
        <Button variant="outline" className="mt-2" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  const process = interview.interviewingProcess
  const interviewer = interview.interviewer

  return (
    <div className="mx-auto max-w-3xl">
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Interview</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this interview? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Video Meeting</DialogTitle>
            <DialogDescription>
              Share this link with participants or join as host to start the interview.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 rounded-md border p-3 bg-muted/30">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono" title={meetingUrl}>
                  {truncateUrl(meetingUrl)}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={copyMeetingLink} className="shrink-0">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button onClick={joinAsHost}>
              <Video className="h-4 w-4 mr-2" />
              Join as Host
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Interview Details</h1>
          <div className="flex space-x-2">
            <Button variant="default" onClick={handleStartMeeting}>
              <Video className="h-4 w-4 mr-2" /> Start Meeting
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/interviews/${interview.id}/edit`}>Edit</Link>
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">
              {interview.scheduledAt && typeof interview.scheduledAt === "string"
                ? formatDate(new Date(interview.scheduledAt))
                : "Unknown date"}
            </span>
          </div>
        </div>
      </div>

      {/* Interviewee & Interviewer Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Interviewee Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Interviewee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
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
                <h3 className="text-lg font-medium">{interviewee?.name || "Unknown"}</h3>
                {interviewee?.email && (
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Mail className="h-3 w-3 mr-1" />
                    <span>{interviewee.email}</span>
                  </div>
                )}
              </div>
            </div>
            {process?.role?.name && (
              <div className="mt-3 pt-3 border-t">
                <span className="text-sm font-medium">Role: </span>
                <Badge variant="outline" className="ml-1">
                  {process.role.name}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interviewer Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Interviewer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={
                    interviewer?.profilePicture
                      ? `data:image/jpeg;base64,${interviewer.profilePicture}`
                      : "/placeholder.svg"
                  }
                  alt={interviewer?.name || "Unknown"}
                />
                <AvatarFallback>
                  {interviewer?.name
                    ? interviewer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "UN"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{interviewer?.name || "Unknown"}</h3>
                {interviewer?.email && (
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Mail className="h-3 w-3 mr-1" />
                    <span>{interviewer.email}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {/* Add Technical Answer */}
        <Card>
          <CardHeader>
            <CardTitle>Add Technical Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="technicalQuestion" className="flex justify-between">
                <span>Select Technical Question </span>
                {formErrors.technicalQuestion.questionId && (
                  <span className="text-sm text-destructive">{formErrors.technicalQuestion.questionId}</span>
                )}
              </Label>
              <Select
                value={newTechnicalAnswer.questionId}
                onValueChange={(value) => setNewTechnicalAnswer({ ...newTechnicalAnswer, questionId: value })}
              >
                <SelectTrigger className={formErrors.technicalQuestion.questionId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a question" />
                </SelectTrigger>
                <SelectContent>
                  {technicalQuestions.map((question) => (
                    <SelectItem key={question.id} value={question.id.toString()}>
                      {question.question}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="technicalAnswer" className="flex justify-between">
                <span>Answer </span>
                {formErrors.technicalQuestion.answer && (
                  <span className="text-sm text-destructive">{formErrors.technicalQuestion.answer}</span>
                )}
              </Label>
              <div
                className={`border rounded-md overflow-hidden ${formErrors.technicalQuestion.answer ? "border-destructive" : "border-input"}`}
              >
                <Editor
                  value={newTechnicalAnswer.answer}
                  onValueChange={(code) => setNewTechnicalAnswer({ ...newTechnicalAnswer, answer: code })}
                  highlight={(code) => {
                    // Select language based on the selected language in the form
                    const lang = newTechnicalAnswer.language.toLowerCase()
                    return highlight(code, getLanguageForPrism(lang), lang)
                  }}
                  padding={16}
                  style={getEditorStyles(isDarkMode)}
                  className="min-h-[200px] w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="technicalLanguage" className="flex justify-between">
                <span>Language </span>
                {formErrors.technicalQuestion.language && (
                  <span className="text-sm text-destructive">{formErrors.technicalQuestion.language}</span>
                )}
              </Label>
              <Select
                value={newTechnicalAnswer.language}
                onValueChange={(value) => setNewTechnicalAnswer({ ...newTechnicalAnswer, language: value as Language })}
              >
                <SelectTrigger className={formErrors.technicalQuestion.language ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Language).map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="technicalBar" className="flex justify-between">
                <span>Bar </span>
                {formErrors.technicalQuestion.bar && (
                  <span className="text-sm text-destructive">{formErrors.technicalQuestion.bar}</span>
                )}
              </Label>
              <Select
                value={newTechnicalAnswer.bar}
                onValueChange={(value) => setNewTechnicalAnswer({ ...newTechnicalAnswer, bar: value })}
              >
                <SelectTrigger className={formErrors.technicalQuestion.bar ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select bar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddTechnicalAnswer}>Add Technical Answer</Button>
          </CardContent>
        </Card>

        {/* Add Principle Answer */}
        <Card>
          <CardHeader>
            <CardTitle>Add Principle Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="principleQuestion" className="flex justify-between">
                <span>Select Principle Question </span>
                {formErrors.principleQuestion.questionId && (
                  <span className="text-sm text-destructive">{formErrors.principleQuestion.questionId}</span>
                )}
              </Label>
              <Select
                value={newPrincipleAnswer.questionId}
                onValueChange={(value) => setNewPrincipleAnswer({ ...newPrincipleAnswer, questionId: value })}
              >
                <SelectTrigger className={formErrors.principleQuestion.questionId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a question" />
                </SelectTrigger>
                <SelectContent>
                  {principleQuestions.map((question) => (
                    <SelectItem key={question.id} value={question.id.toString()}>
                      {question.question}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="principleAnswer" className="flex justify-between">
                <span>Answer </span>
                {formErrors.principleQuestion.answer && (
                  <span className="text-sm text-destructive">{formErrors.principleQuestion.answer}</span>
                )}
              </Label>
              <Textarea
                id="principleAnswer"
                placeholder="Provide your answer"
                value={newPrincipleAnswer.answer}
                onChange={(e) => setNewPrincipleAnswer({ ...newPrincipleAnswer, answer: e.target.value })}
                rows={4}
                className={formErrors.principleQuestion.answer ? "border-destructive" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="principleBar" className="flex justify-between">
                <span>Bar </span>
                {formErrors.principleQuestion.bar && (
                  <span className="text-sm text-destructive">{formErrors.principleQuestion.bar}</span>
                )}
              </Label>
              <Select
                value={newPrincipleAnswer.bar}
                onValueChange={(value) => setNewPrincipleAnswer({ ...newPrincipleAnswer, bar: value })}
              >
                <SelectTrigger className={formErrors.principleQuestion.bar ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select bar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddPrincipleAnswer}>Add Principle Answer</Button>
          </CardContent>
        </Card>

        {/* Tables for Questions and Answers */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Questions and Answers</CardTitle>
          </CardHeader>
          <CardContent>
            {interview.technicalAnswers && interview.technicalAnswers.length > 0 ? (
              <div className="grid gap-4">
                {interview.technicalAnswers.map((answer) => (
                  <Card key={answer.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 pb-2">
                      <CardTitle className="text-base font-medium">
                        {answer.question?.question || "Unknown Question"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="mb-4 border rounded-md overflow-hidden">
                        <Editor
                          value={answer.answer}
                          onValueChange={() => {}}
                          highlight={(code) =>
                            highlight(code, getLanguageForPrism(answer.language), answer.language.toLowerCase())
                          }
                          padding={16}
                          style={getEditorStyles(isDarkMode)}
                          readOnly={true}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <span className="mr-1 font-medium">Bar:</span>
                          <Badge variant="outline">{answer.bar}</Badge>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1 font-medium">Language:</span>
                          <Badge variant="secondary">{answer.language}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No technical answers available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Principle Questions and Answers</CardTitle>
          </CardHeader>
          <CardContent>
            {interview.principleAnswers && interview.principleAnswers.length > 0 ? (
              <div className="grid gap-4">
                {interview.principleAnswers.map((answer) => (
                  <Card key={answer.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 pb-2">
                      <CardTitle className="text-base font-medium">
                        {answer.question?.question || "Unknown Question"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="whitespace-pre-wrap mb-4">{answer.answer}</div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <span className="mr-1 font-medium">Bar:</span>
                          <Badge variant="outline">{answer.bar}</Badge>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1 font-medium">Principle:</span>
                          <Badge variant="secondary">
                            {answer.question?.principle ? formatPrinciple(answer.question.principle) : "Unknown"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No principle answers available</div>
            )}
          </CardContent>
        </Card>

        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </CardFooter>
      </div>
    </div>
  )
}

