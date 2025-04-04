"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { technicalQuestionAPI } from "@/lib/api-service"
import { toast } from 'react-toastify'

export default function NewTechnicalQuestionPage() {
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim()) {
      toast.error("Question is required")
      return
    }

    try {
      setLoading(true)
      await technicalQuestionAPI.create({ question })
      toast.success("Technical question created successfully")
      router.push("/dashboard/questions")
    } catch (error: any) {
      console.error("Failed to create technical question:", error)
      toast.error(error.message || "Failed to create technical question. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Add New Technical Question</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Technical Question Details</CardTitle>
            <CardDescription>Add a new technical question to ask during interviews.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Explain the difference between let, const, and var in JavaScript."
                className="min-h-[120px]"
                required
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
              {loading ? "Creating..." : "Create Question"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

