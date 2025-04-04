"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react"
import { technicalQuestionAPI, type TechnicalQuestion } from "@/lib/api-service"
import Link from "next/link"
import { QuestionTruncator } from "@/components/question-truncator"
import { TechnicalQuestionDetails } from "@/components/questions/technical-question-details"
import { toast } from 'react-toastify'

export function TechnicalQuestionTable() {
  const [questions, setQuestions] = useState<TechnicalQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTechnicalQuestionId, setSelectedTechnicalQuestionId] = useState<number | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const data = await technicalQuestionAPI.getAll()
        setQuestions(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch technical questions:", err)
        setError("Failed to load technical questions. Please try again later.")
        toast.error("Failed to load technical questions. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await technicalQuestionAPI.delete(id)
      setQuestions(questions.filter((question) => question.id.toString() !== id))
      toast.success("Technical question deleted successfully")
    } catch (err: any) {
      console.error("Failed to delete technical question:", err)
      toast.error(err.message || "Failed to delete technical question. Please try again.")
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading technical questions...</div>
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
            <TableHead className="w-[80%]">Question</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-8">
                No technical questions found. Add your first question to get started.
              </TableCell>
            </TableRow>
          ) : (
            questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="font-medium">
                  <div className="whitespace-normal break-words">
                    <QuestionTruncator question={question.question} showButton={false} />
                  </div>
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
                      <DropdownMenuItem onClick={() => setSelectedTechnicalQuestionId(question.id)}>
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
                        className="text-destructive"
                        onClick={() => handleDelete(question.id.toString())}
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
      {selectedTechnicalQuestionId && (
        <TechnicalQuestionDetails
          id={selectedTechnicalQuestionId}
          onClose={() => setSelectedTechnicalQuestionId(null)}
        />
      )}
    </div>
  )
}

