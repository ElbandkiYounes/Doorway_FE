"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { principleQuestionAPI, type PrincipleQuestion } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

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
  const { toast } = useToast()
  
  const [question, setQuestion] = useState<string>("")
  const [principle, setPrinciple] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const data = await principleQuestionAPI.getById(params.id)
        setQuestion(data.question)
        setPrinciple(data.principle)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load principle question.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchQuestion()
  }, [params.id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await principleQuestionAPI.update(params.id, { question, principle })
      toast({
        title: "Success",
        description: "Principle question updated successfully",
      })
      router.push("/dashboard/questions") // redirect updated
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update principle question",
        variant: "destructive",
      })
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
            {/* ...existing form layout... */}
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
                  <SelectItem value="IMPACTFUL_DELIVERY">Impactful Delivery</SelectItem>
                  <SelectItem value="WISE_INSIGHTS">Wise Insights</SelectItem>
                  <SelectItem value="SIMPLIFIED_INNOVATION">Simplified Innovation</SelectItem>
                  <SelectItem value="OUTSTANDING_MENTORSHIP">Outstanding Mentorship</SelectItem>
                  <SelectItem value="OBSESSIVE_AMBITION">Obsessive Ambition</SelectItem>
                  <SelectItem value="CUSTOMER_DEDICATION">Customer Dedication</SelectItem>
                  <SelectItem value="DEEP_OWNERSHIP">Deep Ownership</SelectItem>
                  <SelectItem value="PERFECTIONIST_MASTERY">Perfectionist Mastery</SelectItem>
                  <SelectItem value="EMPATHIC_INCLUSION">Empathic Inclusion</SelectItem>
                  <SelectItem value="CONFIDENT_MODESTY">Confident Modesty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Question"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
