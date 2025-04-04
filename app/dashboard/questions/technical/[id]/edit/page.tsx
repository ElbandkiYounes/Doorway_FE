"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { technicalQuestionAPI, type TechnicalQuestion } from "@/lib/api-service"
import { toast } from 'react-toastify'

export default function EditTechnicalQuestionPage() {
  const params = useParams()
  const router = useRouter()
  const [question, setQuestion] = useState<string>("")
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!params.id || typeof params.id !== 'string') {
      toast.error("Invalid question ID")
      router.push("/dashboard/questions")
      return
    }

    const fetchQuestion = async () => {
      try {
        const data = await technicalQuestionAPI.getById(params.id as string)
        setQuestion(data.question)
      } catch (error: any) {
        toast.error(error.message || "Failed to load technical question.")
      } finally {
        setLoading(false)
      }
    }
    fetchQuestion()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!params.id || typeof params.id !== 'string') {
      toast.error("Invalid question ID")
      return
    }

    try {
      setLoading(true)
      await technicalQuestionAPI.update(params.id, { question })
      toast.success("Technical question updated successfully")
      router.push("/dashboard/questions")
    } catch (error: any) {
      console.error("Failed to update technical question:", error)
      toast.error(error.message || "Failed to update technical question")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center p-4">Loading...</div>

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Technical Question</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Edit Question</CardTitle>
            <CardDescription>Update your technical question below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your technical question"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/questions")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Question"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
