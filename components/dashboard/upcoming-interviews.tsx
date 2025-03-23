import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"

const upcomingInterviews = [
  {
    id: "1",
    interviewee: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg",
    },
    role: "Senior Frontend Developer",
    date: new Date(2023, 2, 20, 10, 0),
  },
  {
    id: "2",
    interviewee: {
      name: "Samantha Lee",
      avatar: "/placeholder.svg",
    },
    role: "Product Manager",
    date: new Date(2023, 2, 20, 14, 30),
  },
  {
    id: "3",
    interviewee: {
      name: "Ryan Garcia",
      avatar: "/placeholder.svg",
    },
    role: "Backend Developer",
    date: new Date(2023, 2, 21, 11, 0),
  },
  {
    id: "4",
    interviewee: {
      name: "Emma Wilson",
      avatar: "/placeholder.svg",
    },
    role: "UX Designer",
    date: new Date(2023, 2, 22, 13, 0),
  },
  {
    id: "5",
    interviewee: {
      name: "Daniel Kim",
      avatar: "/placeholder.svg",
    },
    role: "DevOps Engineer",
    date: new Date(2023, 2, 23, 15, 30),
  },
]

export function UpcomingInterviews() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Interviews</CardTitle>
        <CardDescription>Scheduled interviews for the next 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingInterviews.map((interview) => (
            <div key={interview.id} className="flex items-center justify-between space-x-4 rounded-md border p-3">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={interview.interviewee.avatar} alt={interview.interviewee.name} />
                  <AvatarFallback>
                    {interview.interviewee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{interview.interviewee.name}</p>
                  <p className="text-xs text-muted-foreground">{interview.role}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">{formatDate(interview.date)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

