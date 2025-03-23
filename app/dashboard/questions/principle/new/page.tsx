"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { principleQuestionAPI, ExcellencePrinciple } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

// Helper function to format principle enum values for display
const formatPrinciple = (principle: string) => {
  return principle
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

export default function NewPrincipleQuestionPage() {
  const [question, setQuestion] = useState("")
  const [principle, setPrinciple] = useState<ExcellencePrinciple | "">("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim() || !principle) {
      toast({
        title: "Validation Error",
        description: "Question and principle are required",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await principleQuestionAPI.create({
        question,
        principle,
      })
      toast({
        title: "Success",
        description: "Principle question created successfully",
      })
      router.push("/dashboard/questions")
    } catch (error) {
      console.error("Failed to create principle question:", error)
      toast({
        title: "Error",
        description: "Failed to create principle question. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Add New Principle Question</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Principle Question Details</CardTitle>
            <CardDescription>Add a new principle question to assess candidates against company values.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Describe a situation where you had to make a difficult decision with limited information."
                className="min-h-[120px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="principle">Excellence Principle</Label>
              <Select value={principle} onValueChange={(value) => setPrinciple(value as ExcellencePrinciple)}>
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
              {loading ? "Creating..." : "Create Question"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

