"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { technicalQuestionAPI, type TechnicalQuestion } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

export function TechnicalQuestionDetails({ id, onClose }: { id: number; onClose: () => void }) {
  const [questionDetail, setQuestionDetail] = useState<TechnicalQuestion | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true)
        const data = await technicalQuestionAPI.getById(id.toString())
        setQuestionDetail(data)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load question details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id, toast])

  const modal = (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Card className="max-w-lg w-full mx-4 relative">
        <CardHeader>
          <h2 className="text-xl font-bold">Technical Question Details</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : questionDetail ? (
            <div className="overflow-auto max-h-80 whitespace-normal break-words">
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
