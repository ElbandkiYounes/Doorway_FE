"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowLeft, Mail, Phone, MapPin } from "lucide-react"
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
  Language 
} from "@/lib/api-service"
import { formatDate, formatPrinciple } from "@/lib/utils"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from 'react-toastify'

const statusMap = {
  HIGHLY_INCLINED: { label: "Highly Inclined", badgeClass: "bg-green-500 text-white" },
  INCLINED: { label: "Inclined", badgeClass: "bg-emerald-500 text-white" },
  NEUTRAL: { label: "Neutral", badgeClass: "bg-gray-500 text-white" },
  DECLINED: { label: "Declined", badgeClass: "bg-red-500 text-white" },
  HIGHLY_DECLINED: { label: "Highly Declined", badgeClass: "bg-red-700 text-white" },
}

export default function InterviewDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [interview, setInterview] = useState<Interview | null>(null)
  const [interviewee, setInterviewee] = useState<Interviewee | null>(null)
  const [technicalQuestions, setTechnicalQuestions] = useState<TechnicalQuestion[]>([])
  const [principleQuestions, setPrincipleQuestions] = useState<PrincipleQuestion[]>([])
  const [newTechnicalAnswer, setNewTechnicalAnswer] = useState({ questionId: "", answer: "", bar: "MEDIUM", language: Language.JAVA })
  const [newPrincipleAnswer, setNewPrincipleAnswer] = useState({ questionId: "", answer: "", bar: "MEDIUM" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState({
    technicalQuestion: { questionId: "", answer: "", bar: "", language: "" },
    principleQuestion: { questionId: "", answer: "", bar: "" }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const id = params.id as string
        
        // Fetch interview and answers in parallel
        const [
          interviewData, 
          techAnswers, 
          prinAnswers,
          techQuestions,
          prinQuestions
        ] = await Promise.all([
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

    if (!confirm("Are you sure you want to delete this interview? This action cannot be undone.")) {
      return
    }

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

    setFormErrors(prev => ({
      ...prev,
      technicalQuestion: errors
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

    setFormErrors(prev => ({
      ...prev,
      principleQuestion: errors
    }))
    return isValid
  }

  const handleAddTechnicalAnswer = async () => {
    if (!interview) return;

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

      const questionDetails = technicalQuestions.find(
        q => q.id.toString() === newTechnicalAnswer.questionId
      )

      if (!questionDetails) {
        throw new Error("Question not found")
      }

      // Update with type-safe answer
      setInterview(prev => {
        if (!prev) return null
        return {
          ...prev,
          technicalAnswers: [
            ...(prev.technicalAnswers || []),
            {
              ...newAnswer,
              question: questionDetails // Now we know questionDetails is defined
            }
          ]
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
    if (!interview) return;

    if (!validatePrincipleAnswer()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const newAnswer = await principleAnswerAPI.create(newPrincipleAnswer.questionId, interview.id, {
        answer: newPrincipleAnswer.answer,
        bar: newPrincipleAnswer.bar,
      })

      const questionDetails = principleQuestions.find(
        q => q.id.toString() === newPrincipleAnswer.questionId
      )

      if (!questionDetails) {
        throw new Error("Question not found")
      }

      // Update with type-safe answer
      setInterview(prev => {
        if (!prev) return null
        return {
          ...prev,
          principleAnswers: [
            ...(prev.principleAnswers || []),
            {
              ...newAnswer,
              question: questionDetails // Now we know questionDetails is defined
            }
          ]
        }
      })

      toast.success("Principle answer added successfully")
      
      setNewPrincipleAnswer({ questionId: "", answer: "", bar: "MEDIUM" })
    } catch (err) {
      console.error("Failed to add principle answer:", err)
      toast.error(err instanceof Error ? err.message : "Failed to add principle answer")
    }
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
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Interview Details</h1>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/interviews/${interview.id}/edit`}>
                Edit
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">
              {interview.scheduledAt && typeof interview.scheduledAt === 'string' 
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
                  src={interviewee?.profilePicture 
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
                <Badge variant="outline" className="ml-1">{process.role.name}</Badge>
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
                  src={interviewer?.profilePicture 
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
                onValueChange={(value) => setNewTechnicalAnswer({ ...newTechnicalAnswer, questionId: value })}>
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
              <Textarea
                id="technicalAnswer"
                placeholder="Provide your answer"
                value={newTechnicalAnswer.answer}
                onChange={(e) => setNewTechnicalAnswer({ ...newTechnicalAnswer, answer: e.target.value })}
                rows={4}
                className={formErrors.technicalQuestion.answer ? "border-destructive" : ""} />
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
                onValueChange={(value) => setNewTechnicalAnswer({ ...newTechnicalAnswer, language: value as Language })}>
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
                onValueChange={(value) => setNewTechnicalAnswer({ ...newTechnicalAnswer, bar: value })}>
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
                onValueChange={(value) => setNewPrincipleAnswer({ ...newPrincipleAnswer, questionId: value })}>
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
                className={formErrors.principleQuestion.answer ? "border-destructive" : ""} />
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
                onValueChange={(value) => setNewPrincipleAnswer({ ...newPrincipleAnswer, bar: value })}>
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
            <div className="border rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Question</th>
                    <th className="text-left p-4 font-medium">Answer</th>
                    <th className="text-left p-4 font-medium">Bar</th>
                    <th className="text-left p-4 font-medium">Language</th>
                  </tr>
                </thead>
                <tbody>
                  {interview.technicalAnswers && interview.technicalAnswers.length > 0 ? (
                    interview.technicalAnswers.map((answer) => (
                      <tr key={answer.id} className="border-b last:border-0">
                        <td className="p-4">
                          {answer.question?.question || "Unknown Question"}
                        </td>
                        <td className="p-4 whitespace-pre-wrap">
                          {answer.answer}
                        </td>
                        <td className="p-4">
                          <Badge>{answer.bar}</Badge>
                        </td>
                        <td className="p-4">
                          {answer.language}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No technical answers available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Principle Questions and Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Question</th>
                    <th className="text-left p-4 font-medium">Answer</th>
                    <th className="text-left p-4 font-medium">Bar</th>
                    <th className="text-left p-4 font-medium">Principle</th>
                  </tr>
                </thead>
                <tbody>
                  {interview.principleAnswers && interview.principleAnswers.length > 0 ? (
                    interview.principleAnswers.map((answer) => (
                      <tr key={answer.id} className="border-b last:border-0">
                        <td className="p-4">
                          {answer.question?.question || "Unknown Question"}
                        </td>
                        <td className="p-4 whitespace-pre-wrap">
                          {answer.answer}
                        </td>
                        <td className="p-4">
                          <Badge>{answer.bar}</Badge>
                        </td>
                        <td className="p-4">
                          {answer.question?.principle ? formatPrinciple(answer.question.principle) : "Unknown"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No principle answers available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
