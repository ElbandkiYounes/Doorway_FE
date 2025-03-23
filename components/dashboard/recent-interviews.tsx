import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"

const recentInterviews = [
  {
    id: "1",
    interviewee: {
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "/placeholder.svg",
    },
    interviewer: {
      name: "Jane Smith",
      email: "jane.smith@doorway.com",
      avatar: "/placeholder.svg",
    },
    date: new Date(2023, 2, 15, 10, 0),
    status: "completed",
    role: "Frontend Developer",
  },
  {
    id: "2",
    interviewee: {
      name: "Michael Johnson",
      email: "michael.johnson@example.com",
      avatar: "/placeholder.svg",
    },
    interviewer: {
      name: "Robert Brown",
      email: "robert.brown@doorway.com",
      avatar: "/placeholder.svg",
    },
    date: new Date(2023, 2, 16, 14, 30),
    status: "completed",
    role: "Backend Developer",
  },
  {
    id: "3",
    interviewee: {
      name: "Emily Davis",
      email: "emily.davis@example.com",
      avatar: "/placeholder.svg",
    },
    interviewer: {
      name: "Sarah Wilson",
      email: "sarah.wilson@doorway.com",
      avatar: "/placeholder.svg",
    },
    date: new Date(2023, 2, 17, 11, 0),
    status: "completed",
    role: "UX Designer",
  },
  {
    id: "4",
    interviewee: {
      name: "David Miller",
      email: "david.miller@example.com",
      avatar: "/placeholder.svg",
    },
    interviewer: {
      name: "James Taylor",
      email: "james.taylor@doorway.com",
      avatar: "/placeholder.svg",
    },
    date: new Date(2023, 2, 18, 15, 0),
    status: "completed",
    role: "DevOps Engineer",
  },
]

export function RecentInterviews() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Interviews</CardTitle>
        <CardDescription>Overview of recently completed interviews</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Interviewee</TableHead>
              <TableHead>Interviewer</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentInterviews.map((interview) => (
              <TableRow key={interview.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={interview.interviewee.avatar} alt={interview.interviewee.name} />
                      <AvatarFallback>
                        {interview.interviewee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{interview.interviewee.name}</div>
                      <div className="text-xs text-muted-foreground">{interview.interviewee.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={interview.interviewer.avatar} alt={interview.interviewer.name} />
                      <AvatarFallback>
                        {interview.interviewer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{interview.interviewer.name}</div>
                      <div className="text-xs text-muted-foreground">{interview.interviewer.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{interview.role}</TableCell>
                <TableCell>{formatDate(interview.date)}</TableCell>
                <TableCell>
                  <Badge variant={interview.status === "completed" ? "success" : "default"}>{interview.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

