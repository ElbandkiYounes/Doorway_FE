"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

interface UpcomingInterviewsProps {
  interviews: Array<{
    id: string
    interviewee: {
      id: string
      name: string
    }
    interviewer: {
      id: string
      name: string
    }
    scheduledAt: string
  }>
}

export function UpcomingInterviews({ interviews }: UpcomingInterviewsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Interviews</CardTitle>
        <CardDescription>
          You have {interviews.length} upcoming interviews
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="mb-4 grid grid-cols-[1fr_110px] items-center"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {interview.interviewee.name} with {interview.interviewer.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(new Date(interview.scheduledAt))}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button asChild size="sm">
                  <Link href={`/meeting/${interview.id}`}>Join</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

