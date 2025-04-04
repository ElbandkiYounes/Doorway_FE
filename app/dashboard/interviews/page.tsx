"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, momentLocalizer, View } from "react-big-calendar"
import moment from "moment"
import { interviewAPI, type Interview } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { InterviewFilters } from "@/components/interviews/interview-filters"
import { InterviewCalendarEvent } from "@/components/interviews/interview-calendar-event"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useTheme } from "next-themes"

// Configure moment to start week on Monday
moment.updateLocale('en', {
  week: {
    dow: 1, // Monday is the first day of the week
    doy: 4  // Used for calculating the first week of the year
  }
})

const localizer = momentLocalizer(moment)

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>("month")
  const [date, setDate] = useState(new Date())
  const { toast } = useToast()
  const { theme } = useTheme()

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true)
        const allInterviews = await interviewAPI.getAllInterviews()
        setInterviews(allInterviews)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch interviews:", err)
        setError("Failed to load interviews. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load interviews",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInterviews()
  }, [toast])

  const calendarEvents = useMemo(() => {
    // Group interviews by date and time for day and week views
    const eventMap = new Map<string, any[]>();
    
    interviews.forEach((interview) => {
      const startTime = new Date(interview.scheduledAt);
      const key = view === 'month' 
        ? startTime.toDateString() 
        : `${startTime.toDateString()}-${startTime.getHours()}`;
      
      if (!eventMap.has(key)) {
        eventMap.set(key, []);
      }
      
      eventMap.get(key)!.push({
        id: interview.id,
        start: startTime,
        end: new Date(startTime.getTime() + 60 * 60 * 1000), // 1 hour duration
        interview: interview,
      });
    });

    // Convert map to array, handling grouped events
    return Array.from(eventMap.entries()).flatMap(([key, events]) => {
      if (events.length > 1 && view !== 'month') {
        // For day/week views with multiple events, create a grouped event
        return [{
          id: `grouped-${key}`,
          start: events[0].start,
          end: events[0].end,
          groupedEvents: events,
        }];
      }
      return events;
    });
  }, [interviews, view]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-4">
        <div className="text-center">
          <p className="mt-2 text-muted-foreground">Loading interviews...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button 
          variant="outline" 
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Interview Calendar</h1>
      </div>

      <Card className="shadow-md border-none">
        <CardContent className="p-0">
          <div className="h-[700px]">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              views={["month", "week", "day", "agenda"]}
              defaultView="week"
              view={view}
              onView={(newView) => setView(newView)}
              date={date}
              onNavigate={(newDate) => setDate(newDate)}
              components={{
                event: InterviewCalendarEvent,
              }}
              className={`px-4 py-2 rounded-b-lg calendar-container ${
                theme === "dark" 
                  ? "calendar-dark" 
                  : "calendar-light"
              }`}
              dayPropGetter={(date) => {
                const isToday = moment().isSame(date, "day")
                if (isToday) {
                  return {
                    className: 'current-day',
                    style: {
                      fontWeight: 'bold',
                    },
                  }
                }
                return {}
              }}
              eventPropGetter={(event) => ({
                className: theme === "dark" ? "event-dark" : "event-light"
              })}
              popup
              selectable
              onSelectEvent={(event) => {
                // For grouped events, handle selection differently
                if (event.groupedEvents) {
                  // You might want to show a modal or dropdown with all interviews
                  console.log('Grouped events:', event.groupedEvents);
                } else {
                  window.location.href = `/dashboard/interviews/${event.interview.id}`;
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}