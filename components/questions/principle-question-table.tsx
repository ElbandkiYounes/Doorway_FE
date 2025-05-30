"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react"
import { principleQuestionAPI, type PrincipleQuestion } from "@/lib/api-service"
import Link from "next/link"
import { QuestionTruncator } from "@/components/question-truncator"
import { PrincipleQuestionDetails } from "@/components/questions/principle-question-details"
import { toast } from 'react-toastify'

// Helper function to format principle enum values
const formatPrinciple = (principle: string) => {
  return principle
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

export function PrincipleQuestionTable() {
  const [questions, setQuestions] = useState<PrincipleQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPrincipleQuestionId, setSelectedPrincipleQuestionId] = useState<number | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const data = await principleQuestionAPI.getAll()
        setQuestions(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch principle questions:", err)
        setError("Failed to load principle questions. Please try again later.")
        toast.error("Failed to load principle questions. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await principleQuestionAPI.delete(id)
      setQuestions(questions.filter((question) => question.id.toString() !== id))
      toast.success("Principle question deleted successfully")
    } catch (err: any) {
      console.error("Failed to delete principle question:", err)
      toast.error(err.message || "Failed to delete principle question. Please try again.")
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading principle questions...</div>
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
            <TableHead className="w-[60%]">Question</TableHead>
            <TableHead>Principle</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8">
                No principle questions found. Add your first question to get started.
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
                <TableCell>
                  <Badge variant="outline">{formatPrinciple(question.principle)}</Badge>
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
                      <DropdownMenuItem onClick={() => setSelectedPrincipleQuestionId(question.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/questions/principle/${question.id}/edit`}>
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
      {selectedPrincipleQuestionId && (
        <PrincipleQuestionDetails
          id={selectedPrincipleQuestionId}
          onClose={() => setSelectedPrincipleQuestionId(null)}
        />
      )}
    </div>
  )
}

