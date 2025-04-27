"use client"

import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  participantCount: number
  isRecording?: boolean
  onLeave: () => void
  intervieweeName?: string
  interviewerName?: string
}

export function Header({ participantCount, isRecording, onLeave, intervieweeName, interviewerName }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <img src="/placeholder-logo.svg" alt="Logo" className="h-8" />
          </Link>
          <div className="flex items-center gap-2">
            {intervieweeName && (
              <Badge variant="outline">Interviewee: {intervieweeName}</Badge>
            )}
            {interviewerName && (
              <Badge variant="outline">Interviewer: {interviewerName}</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="outline">
            {participantCount} {participantCount === 1 ? "participant" : "participants"}
          </Badge>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">Recording</Badge>
          )}
          <div className="w-px h-6 bg-border" />
          <Button variant="destructive" size="sm" onClick={onLeave}>
            Leave
          </Button>
        </div>
      </div>
    </header>
  )
}
