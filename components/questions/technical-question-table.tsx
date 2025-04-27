"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { technicalQuestionAPI, type TechnicalQuestion } from "@/lib/api-service"
import { toast } from "react-toastify"
import { QuestionTruncator } from "@/components/question-truncator"
import { TechnicalQuestionDetails } from "./technical-question-details"

export function TechnicalQuestionTable() {
  const [questions, setQuestions] = useState<TechnicalQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const data = await technicalQuestionAPI.getAll()
        setQuestions(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch questions:", err)
        setError("Failed to load questions. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      return
    }

    try {
      await technicalQuestionAPI.delete(id)
      setQuestions(questions.filter((question) => question.id !== id))
      toast.success("Question deleted successfully")
    } catch (err) {
      console.error("Failed to delete question:", err)
      toast.error("Failed to delete question")
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading questions...</div>
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
            <TableHead>Title</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No technical questions found. Add your first technical question to get started.
              </TableCell>
            </TableRow>
          ) : (
            questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell>{question.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{question.language}</Badge>
                </TableCell>
                <TableCell>
                  <Badge>{question.difficulty}</Badge>
                </TableCell>
                <TableCell>
                  <QuestionTruncator text={question.description} maxLength={100} />
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
                      <DropdownMenuItem onClick={() => setSelectedQuestionId(question.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/questions/technical/${question.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(question.id)}
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedQuestionId && (
        <TechnicalQuestionDetails
          id={selectedQuestionId}
          onClose={() => setSelectedQuestionId(null)}
        />
      )}
    </div>
  )
}

