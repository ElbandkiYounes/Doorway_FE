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
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils"

interface RecentProcessesProps {
  processes: Array<{
    id: string
    interviewee: {
      id: string
      name: string
    }
    role: {
      id: string
      name: string
    }
    progress: number
    startedAt: string
  }>
}

export function RecentProcesses({ processes }: RecentProcessesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Processes</CardTitle>
        <CardDescription>
          You have {processes.length} ongoing processes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {processes.map((process, index) => (
            <div key={process.id}>
              {index > 0 && <Separator className="my-4" />}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {process.interviewee.name} - {process.role.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Started {formatDate(new Date(process.startedAt))}
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/processes/${process.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
                <Progress value={process.progress} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
