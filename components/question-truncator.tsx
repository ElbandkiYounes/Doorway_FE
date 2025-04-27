"use client"

interface QuestionTruncatorProps {
  text: string;
  maxLength: number;
}

export function QuestionTruncator({ text, maxLength }: QuestionTruncatorProps) {
  if (text.length <= maxLength) {
    return <span>{text}</span>
  }

  return <span>{text.slice(0, maxLength)}...</span>
}
