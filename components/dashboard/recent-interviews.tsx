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
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils"

interface RecentInterviewsProps {
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
    status: string
  }>
}

export function RecentInterviews({ interviews }: RecentInterviewsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Interviews</CardTitle>
        <CardDescription>
          You have {interviews.length} recent interviews
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {interviews.map((interview, index) => (
            <div key={interview.id}>
              {index > 0 && <Separator className="my-4" />}
              <div className="flex justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {interview.interviewee.name} with {interview.interviewer.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(new Date(interview.scheduledAt))}
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/dashboard/interviews/${interview.id}`}>
                    View
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

