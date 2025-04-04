"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { principleQuestionAPI, ExcellencePrinciple } from "@/lib/api-service"
import { toast } from 'react-toastify'

// Helper to format principle enum values if needed
function formatPrinciple(principle: string) {
  return principle
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

export default function EditPrincipleQuestionPage() {
  const params = useParams()
  const router = useRouter()
  const [question, setQuestion] = useState<string>("")
  const [principle, setPrinciple] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id || typeof params.id !== 'string') {
      toast.error("Invalid question ID")
      router.push("/dashboard/questions")
      return
    }

    const fetchQuestion = async () => {
      try {
        const data = await principleQuestionAPI.getById(params.id as string)
        setQuestion(data.question)
        setPrinciple(data.principle)
      } catch (error: any) {
        toast.error(error.message || "Failed to load principle question.")
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
      await principleQuestionAPI.update(params.id, { question, principle })
      toast.success("Principle question updated successfully")
      router.push("/dashboard/questions")
    } catch (error: any) {
      console.error("Failed to update principle question:", error)
      toast.error(error.message || "Failed to update principle question")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center p-4">Loading...</div>

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Principle Question</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Edit Question</CardTitle>
            <CardDescription>Update your principle question details below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your principle question"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="principle">Principle</Label>
              <Select value={principle} onValueChange={setPrinciple}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a principle" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ExcellencePrinciple).map((p) => (
                    <SelectItem key={p} value={p}>
                      {formatPrinciple(p)}
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
