"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"

const MAX_LENGTH = 100

export function QuestionTruncator({ question, showButton = true }: { question: string; showButton?: boolean }) {
  const [open, setOpen] = useState(false)
  const isLong = question.length > MAX_LENGTH
  const truncated = isLong ? question.slice(0, MAX_LENGTH) + "..." : question

  const modal = (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-lg w-full mx-4 relative">
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 rounded-full" onClick={() => setOpen(false)}>
          X
        </Button>
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Full Question</h2>
          <p>{question}</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div>
        <span>{truncated}</span>
        {showButton && isLong && (
          <Button variant="link" onClick={() => setOpen(true)} className="ml-2">
            View Details
          </Button>
        )}
      </div>
      {open && typeof window !== "undefined" && createPortal(modal, document.body)}
    </>
  )
}
