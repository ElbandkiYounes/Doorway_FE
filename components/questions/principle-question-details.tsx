"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { principleQuestionAPI, type PrincipleQuestion } from "@/lib/api-service"
import { toast } from 'react-toastify'
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Helper function to format principle enum values
function formatPrinciple(principle: string) {
  return principle
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

export function PrincipleQuestionDetails({ id, onClose }: { id: number; onClose: () => void }) {
  const [questionDetail, setQuestionDetail] = useState<PrincipleQuestion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true)
        const data = await principleQuestionAPI.getById(id.toString())
        setQuestionDetail(data)
      } catch (error: any) {
        toast.error(error.message || "Failed to load question details")
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  const modal = (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Card className="max-w-lg w-full mx-4 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <h2 className="text-xl font-bold">Principle Question Details</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : questionDetail ? (
            <div className="overflow-auto max-h-80 whitespace-normal break-words">
              <Badge variant="outline" className="text-sm font-medium mb-2">
                {formatPrinciple(questionDetail.principle)}
              </Badge>
              <p className="font-medium">Question:</p>
              <p>{questionDetail.question}</p>
            </div>
          ) : (
            <p>No details found.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={onClose}>Close</Button>
        </CardFooter>
      </Card>
    </div>
  )

  return <>{typeof window !== "undefined" && createPortal(modal, document.body)}</>
}
