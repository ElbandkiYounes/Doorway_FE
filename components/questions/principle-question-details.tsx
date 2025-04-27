"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { principleQuestionAPI, type PrincipleQuestion } from "@/lib/api-service"
import { toast } from "react-toastify"

interface PrincipleQuestionDetailsProps {
  id: string
  onClose: () => void
}

export function PrincipleQuestionDetails({ id, onClose }: PrincipleQuestionDetailsProps) {
  const [question, setQuestion] = useState<PrincipleQuestion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true)
        const data = await principleQuestionAPI.getById(id)
        setQuestion(data)
      } catch (err) {
        console.error("Failed to fetch question:", err)
        toast.error("Could not load question details")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchQuestion()
    }
  }, [id])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Question Details</DialogTitle>
          <DialogDescription>View detailed information about this question.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : !question ? (
          <div className="text-center py-4 text-destructive">Failed to load question details</div>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue="question">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="question">Question</TabsTrigger>
                <TabsTrigger value="solution">Solution</TabsTrigger>
              </TabsList>
              <TabsContent value="question" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <h3>{question.title}</h3>
                      <p>{question.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="solution" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p>{question.solution}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
