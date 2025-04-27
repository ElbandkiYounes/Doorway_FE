"use client"

import "./style.css"
import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { momentLocalizer, View } from "react-big-calendar"
import moment from "moment"
import { interviewAPI, intervieweeAPI, type Interview } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useTheme } from "next-themes"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

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
  const [view, setView] = useState<View>("week")
  const [date, setDate] = useState(new Date())
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [interviewees, setInterviewees] = useState<Record<string, { name: string; profilePicture: string }>>({});
  const [groupedEventsPopup, setGroupedEventsPopup] = useState<{ timeSlot: string; events: any[] } | null>(null);
  const { toast } = useToast()
  const { theme } = useTheme()
  
  // Helper function to determine the actual theme considering system settings
  const isDarkTheme = () => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    // For system theme, check media query
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  };

  // Current month/date for display
  const currentMonth = moment(date).format("MMMM YYYY");
  const startOfWeek = moment(date).startOf('week');
  const endOfWeek = moment(date).endOf('week');
  const currentWeek = startOfWeek.month() === endOfWeek.month()
    ? `${startOfWeek.format("MMMM D")} - ${endOfWeek.format("D")}`
    : `${startOfWeek.format("MMMM D")} - ${endOfWeek.format("MMMM D")}`;
  const currentDate = moment(date).format("MMMM D");

  // Sample calendar days for the week view
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const timeSlots = Array.from({ length: 24 }, (_, i) => i); // 0 AM to 11 PM

  // Helper function to calculate event position and height
  const calculateEventStyle = (startTime, endTime, index, totalEvents) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60;
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60;

    // Adjust for a full 24-hour range
    const top = start * 80; // 80px per hour
    const height = (end - start) * 80;

    // Calculate width for multiple events in the same time slot
    const width = totalEvents > 1 ? (100 / totalEvents) : 100;
    const left = totalEvents > 1 ? (index * width) : 0;

    return { 
      top: `${top}px`, 
      height: `${height}px`,
      width: `${width}%`,
      left: `${left}%`
    };
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event)
  }

  // Transform interviews into calendar events
  const events = useMemo(() => interviews.map(interview => {
    const startTime = new Date(interview.scheduledAt)
    const hours = startTime.getHours()
    const minutes = startTime.getMinutes()
    
    // Format time as "HH:MM"
    const formattedStartTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    
    // Create end time 1 hour later
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)
    const endHours = endTime.getHours()
    const endMinutes = endTime.getMinutes()
    const formattedEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
    
    return {
      id: interview.id,
      title: interview.interviewer?.name || "Interview",
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      color: "bg-blue-500",
      date: startTime, // Store the full date for proper filtering
      description: "Interview",
      interviewee: interviewees[interview.interviewingProcess.intervieweeId] || { name: "Loading...", profilePicture: "" },
      organizer: interview.interviewer?.name || "Unknown",
      interview: interview,
    }
  }), [interviews, interviewees])

  useEffect(() => {
    // Set loaded state for animations
    setIsLoaded(true)
    
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

  useEffect(() => {
    // Fetch interviewees for all interviews
    const fetchInterviewees = async () => {
      try {
        const intervieweeMap: Record<string, { name: string; profilePicture: string }> = {};
        for (const interview of interviews) {
          if (!interviewees[interview.interviewingProcess.intervieweeId]) {
            const interviewee = await intervieweeAPI.getById(interview.interviewingProcess.intervieweeId);
            intervieweeMap[interview.interviewingProcess.intervieweeId] = {
              name: interviewee.name,
              profilePicture: interviewee.profilePicture,
            };
          }
        }
        setInterviewees((prev) => ({ ...prev, ...intervieweeMap }));
      } catch (err) {
        console.error("Failed to fetch interviewees:", err);
      }
    };

    if (interviews.length > 0) {
      fetchInterviewees();
    }
  }, [interviews]);

  // Sample calendars (you would replace this with actual data from your system)
  const myCalendars = [
    { name: "Interview Calendar", color: "bg-blue-500" },
    { name: "Work", color: "bg-green-500" },
    { name: "Personal", color: "bg-purple-500" },
    { name: "Recruiting", color: "bg-orange-500" },
  ]

  // Week dates for mini calendar
  const weekViewDates = useMemo(() => {
    const firstDay = moment(date).startOf('week')
    return Array.from({ length: 7 }, (_, i) => moment(firstDay).add(i, 'days').date())
  }, [date])

  // Days for mini calendar
  const miniCalendarDays = useMemo(() => {
    const firstDayOfMonth = moment(date).startOf('month')
    const firstDayOffset = firstDayOfMonth.day()
    const daysInMonth = moment(date).daysInMonth()
    
    return Array.from({ length: daysInMonth + firstDayOffset }, (_, i) =>
      i < firstDayOffset ? null : i - firstDayOffset + 1
    )
  }, [date])

  const navigateToToday = () => {
    setDate(new Date())
  }

  const navigatePrevious = () => {
    const newDate = moment(date).subtract(1, view === 'day' ? 'day' : view === 'week' ? 'week' : 'month').toDate()
    setDate(newDate)
  }

  const navigateNext = () => {
    const newDate = moment(date).add(1, view === 'day' ? 'day' : view === 'week' ? 'week' : 'month').toDate()
    setDate(newDate)
  }

  // Helper function to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return moment(date1).isSame(date2, 'day')
  }

  // Helper function to group events by time slot
  const groupEventsByTime = (eventsList) => {
    const groupedEvents = {};
    
    eventsList.forEach(event => {
      const timeKey = `${event.startTime}-${event.endTime}`;
      if (!groupedEvents[timeKey]) {
        groupedEvents[timeKey] = [];
      }
      groupedEvents[timeKey].push(event);
    });
    
    return groupedEvents;
  }

  // Helper functions for rendering different calendar views
  const renderDayView = () => {
    const today = moment().startOf('day');
    const selectedDate = moment(date).startOf('day');
    const isCurrentDay = today.isSame(selectedDate, 'day');
    
    // Get events for the selected day
    const dayEvents = events.filter(event => isSameDay(event.date, date));
    
    // Group events by time slot
    const groupedEvents = groupEventsByTime(dayEvents);
    
    return (
      <div className={`${
        isDarkTheme()
          ? "bg-white/20 border-white/20"
          : "bg-white border-gray-200"
        } backdrop-blur-lg rounded-xl border shadow-xl h-full`}
      >
        {/* Day Header */}
        <div className={`grid grid-cols-[100px_1fr] border-b ${
          isDarkTheme() ? "border-white/20" : "border-gray-200"
        }`}>
          <div className="p-2 text-center text-xs"></div>
          <div className={`p-2 text-center border-l ${
            isDarkTheme() ? "border-white/20" : "border-gray-200"
          }`}>
            <div className={`text-xs font-medium ${
              isDarkTheme() ? "text-white/70" : "text-gray-500"
            }`}>{moment(date).format('ddd').toUpperCase()}</div>
            <div
              className={`text-lg font-medium mt-1 ${
                isCurrentDay 
                  ? "bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mx-auto text-white" 
                  : isDarkTheme() ? "text-white" : "text-gray-800"
              }`}
            >
              {moment(date).date()}
            </div>
          </div>
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-[100px_1fr]">
          {/* Time Labels */}
          <div className={`${isDarkTheme() ? "text-white/70" : "text-gray-500"}`}>
            {timeSlots.map((time, i) => (
              <div key={i} className={`h-20 border-b pr-2 text-right text-xs ${
                isDarkTheme() ? "border-white/10" : "border-gray-100"
              }`}>
                {`${time.toString().padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* Day Column */}
          <div className={`border-l relative ${
            isDarkTheme() ? "border-white/20" : "border-gray-200"
          }`}>
            {timeSlots.map((_, timeIndex) => (
              <div key={timeIndex} className={`h-20 border-b ${
                isDarkTheme() ? "border-white/10" : "border-gray-100"
              }`}></div>
            ))}

            {/* Events - Render grouped events */}
            {Object.entries(groupedEvents).map(([timeSlot, timeEvents]) => {
              const firstEvent = timeEvents[0];
              const eventStyle = calculateEventStyle(
                firstEvent.startTime, 
                firstEvent.endTime, 
                0, 
                1
              );

              return (
                <div key={timeSlot} className="absolute" style={eventStyle}>
                  <div
                    className="bg-blue-500 rounded-md p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg"
                    onClick={() => handleEventClick(firstEvent)}
                  >
                    <div className="font-medium truncate">{firstEvent.title}</div>
                    <div className="opacity-80 text-[10px] mt-1 truncate">{`${firstEvent.startTime} - ${firstEvent.endTime}`}</div>
                  </div>
                  {timeEvents.length > 1 && (
                    <div className="text-xs text-blue-500 underline mt-1 cursor-pointer"
                      onClick={() => setGroupedEventsPopup({ timeSlot, events: timeEvents })}
                    >
                      See All
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = moment(date).startOf('week');
    const weekDates = Array.from({ length: 7 }, (_, i) => moment(weekStart).add(i, 'days'));
    const today = moment().startOf('day');

    const weekDayNames = weekDates.map(day => day.format('ddd').toUpperCase());

    return (
      <div className={`${
        isDarkTheme()
          ? "bg-white/20 border-white/20"
          : "bg-white border-gray-200"
        } backdrop-blur-lg rounded-xl border shadow-xl h-full`}
      >
        {/* Week Header */}
        <div className={`grid grid-cols-8 border-b ${
          isDarkTheme() ? "border-white/20" : "border-gray-200"
        }`}>
          <div className="p-2 text-center text-xs"></div>
          {weekDates.map((day, i) => (
            <div key={i} className={`p-2 text-center border-l ${
              isDarkTheme() ? "border-white/20" : "border-gray-200"
            }`}>
              <div className={`text-xs font-medium ${
                isDarkTheme() ? "text-white/70" : "text-gray-500"
              }`}>{weekDayNames[i]}</div>
              <div
                className={`text-lg font-medium mt-1 ${
                  today.isSame(day, 'day')
                    ? "bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mx-auto text-white" 
                    : isDarkTheme() ? "text-white" : "text-gray-800"
                }`}
              >
                {day.date()}
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-8">
          {/* Time Labels */}
          <div className={`${isDarkTheme() ? "text-white/70" : "text-gray-500"}`}>
            {timeSlots.map((time, i) => (
              <div key={i} className={`h-20 border-b pr-2 text-right text-xs ${
                isDarkTheme() ? "border-white/10" : "border-gray-100"
              }`}>
                {`${time.toString().padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {weekDates.map((day, dayIndex) => {
            const dayEvents = events.filter(event => isSameDay(event.date, day.toDate()));
            const groupedEvents = groupEventsByTime(dayEvents);

            return (
              <div key={dayIndex} className={`border-l relative ${
                isDarkTheme() ? "border-white/20" : "border-gray-200"
              }`}>
                {timeSlots.map((_, timeIndex) => (
                  <div key={timeIndex} className={`h-20 border-b ${
                    isDarkTheme() ? "border-white/10" : "border-gray-100"
                  }`}></div>
                ))}

                {/* Render grouped events */}
                {Object.entries(groupedEvents).map(([timeSlot, timeEvents]) => {
                  const firstEvent = timeEvents[0];
                  const eventStyle = calculateEventStyle(
                    firstEvent.startTime, 
                    firstEvent.endTime, 
                    0, 
                    1
                  );

                  return (
                    <div key={timeSlot} className="absolute" style={eventStyle}>
                      <div
                        className="bg-blue-500 rounded-md p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg"
                        onClick={() => handleEventClick(firstEvent)}
                      >
                        <div className="font-medium truncate">{firstEvent.title}</div>
                        <div className="opacity-80 text-[10px] mt-1 truncate">{`${firstEvent.startTime} - ${firstEvent.endTime}`}</div>
                      </div>
                      {timeEvents.length > 1 && (
                        <div className="text-xs text-blue-500 underline mt-1 cursor-pointer"
                          onClick={() => setGroupedEventsPopup({ timeSlot, events: timeEvents })}
                        >
                          See All
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const firstDayOfMonth = moment(date).startOf('month');
    const daysInMonth = moment(date).daysInMonth();
    const startDayOfWeek = firstDayOfMonth.day();

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const eventsByDate = {};
    events.forEach(event => {
      const eventDate = moment(event.date);
      if (eventDate.month() === moment(date).month() && eventDate.year() === moment(date).year()) {
        const eventDay = eventDate.date();
        if (!eventsByDate[eventDay]) {
          eventsByDate[eventDay] = [];
        }
        eventsByDate[eventDay].push(event);
      }
    });

    return (
      <div className={`${
        isDarkTheme()
          ? "bg-white/20 border-white/20"
          : "bg-white border-gray-200"
        } backdrop-blur-lg rounded-xl border shadow-xl h-full overflow-y-auto`}
      >
        {/* Month Header */}
        <div className={`grid grid-cols-7 ${
          isDarkTheme() ? "text-white" : "text-gray-800"
        }`}>
          {weekDays.map((day, i) => (
            <div key={i} className={`p-2 text-center font-medium ${
              isDarkTheme() ? "border-white/20" : "border-gray-200"
            }`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 grid-flow-row auto-rows-fr gap-1 p-2">
          {days.map((day, index) => (
            <div 
              key={index}
              className={`relative min-h-[100px] rounded-md p-1 ${
                day === null 
                  ? "opacity-0" 
                  : isDarkTheme() 
                    ? "bg-white/5 hover:bg-white/10" 
                    : "bg-gray-50 hover:bg-gray-100"
              } transition-colors`}
            >
              {day !== null && (
                <>
                  <div className={`${
                    moment().date() === day && moment().month() === moment(date).month() && moment().year() === moment(date).year()
                      ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      : ""
                  }`}>
                    <span className={`${isDarkTheme() ? "text-white" : "text-gray-700"}`}>{day}</span>
                  </div>

                  {/* Events for this day */}
                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                    {eventsByDate[day]?.map((event, i) => {
                      if (i === 0) {
                        return (
                          <div
                            key={i}
                            className="bg-blue-500 rounded px-1 py-0.5 text-white text-xs truncate cursor-pointer"
                            onClick={() => handleEventClick(event)}
                          >
                            {event.title}
                          </div>
                        );
                      }
                      if (i === 1) {
                        return (
                          <div
                            key={i}
                            className="text-xs text-blue-500 underline cursor-pointer"
                            onClick={() => setGroupedEventsPopup({ timeSlot: `${day}`, events: eventsByDate[day] })}
                          >
                            See All
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

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
    <div className="h-screen w-full flex flex-col">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className={`flex items-center justify-between px-8 py-4 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-4">
            <span 
              className={`text-3xl font-semibold drop-shadow-lg ${
                isDarkTheme() ? "text-white" : "text-black"
              }`}
            >
              Interviews Calendar
            </span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col pb-4">
          {/* Calendar View */}
          <div className={`flex-1 flex flex-col ${isLoaded ? "animate-fade-in" : ""}`}
            style={{ animationDelay: "0.6s" }}>
            
            {/* Calendar Controls */}
            <div 
              className={`flex items-center justify-between p-4 border-b ${
                isDarkTheme() ? "border-white/20" : "border-gray-300"
              }`}
              style={{ marginBottom: "16px" }}
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={navigateToToday} 
                  className={`px-4 py-2 rounded-md shadow-md transition-colors ${
                    isDarkTheme() 
                      ? "text-white bg-blue-500 hover:bg-blue-600" 
                      : "text-black bg-blue-200 hover:bg-blue-300"
                  }`}
                >
                  Today
                </button>
                <div className="flex">
                  <button 
                    onClick={navigatePrevious} 
                    className={`p-2 rounded-l-md transition-colors ${
                      isDarkTheme() 
                        ? "text-white hover:bg-white/10" 
                        : "text-black hover:bg-gray-200"
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={navigateNext} 
                    className={`p-2 rounded-r-md transition-colors ${
                      isDarkTheme() 
                        ? "text-white hover:bg-white/10" 
                        : "text-black hover:bg-gray-200"
                    }`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <h2 
                  className={`text-xl font-semibold ${
                    isDarkTheme() ? "text-white" : "text-black"
                  }`}
                >
                  {view === "day" && currentDate}
                  {view === "week" && currentWeek}
                  {view === "month" && currentMonth}
                </h2>
              </div>

              <div 
                className={`flex items-center gap-2 rounded-md p-1 backdrop-blur-sm ${
                  isDarkTheme() ? "bg-white/10" : "bg-gray-100"
                }`}
              >
                <button
                  onClick={() => setView("day")}
                  className={`px-3 py-1 rounded text-sm ${
                    view === "day" 
                      ? isDarkTheme() 
                        ? "bg-white/20 text-white" 
                        : "bg-gray-300 text-black"
                      : isDarkTheme() 
                        ? "text-white" 
                        : "text-black"
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setView("week")}
                  className={`px-3 py-1 rounded text-sm ${
                    view === "week" 
                      ? isDarkTheme() 
                        ? "bg-white/20 text-white" 
                        : "bg-gray-300 text-black"
                      : isDarkTheme() 
                        ? "text-white" 
                        : "text-black"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setView("month")}
                  className={`px-3 py-1 rounded text-sm ${
                    view === "month" 
                      ? isDarkTheme() 
                        ? "bg-white/20 text-white" 
                        : "bg-gray-300 text-black"
                      : isDarkTheme() 
                        ? "text-white" 
                        : "text-black"
                  }`}
                >
                  Month
                </button>
              </div>
            </div>

            {/* Calendar Content */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full">
                {view === "day" && renderDayView()}
                {view === "week" && renderWeekView()}
                {view === "month" && renderMonthView()}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl max-w-md w-full mx-4 ${
            isDarkTheme()
              ? "bg-gradient-to-br from-blue-500/70 via-blue-600/70 to-blue-700/70 backdrop-blur-lg border border-white/20"
              : "bg-white border border-gray-200"
          }`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-2xl font-bold ${isDarkTheme() ? "text-white" : "text-gray-800"}`}>
                Interview For {selectedEvent.title}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className={`${
                  isDarkTheme() 
                    ? "text-white/70 hover:text-white" 
                    : "text-gray-500 hover:text-gray-700"
                } transition-colors`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className={`space-y-4 ${isDarkTheme() ? "text-white" : "text-gray-700"}`}>
              <div className="flex items-center gap-4">
                <img 
                  src={
                    selectedEvent.interviewee.profilePicture
                      ? `data:image/jpeg;base64,${selectedEvent.interviewee.profilePicture}`
                      : "/placeholder.svg"
                  }
                  alt={selectedEvent.interviewee.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <p className="text-lg font-medium">{selectedEvent.interviewee.name}</p>
              </div>
              <p>
                Status: {selectedEvent.interview?.decision}
              </p>
              <p>
                Date: {moment(selectedEvent.date).format("MMMM D, YYYY")}
              </p>
              <p>
                Time: {selectedEvent.startTime}
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                className={`px-4 py-2 rounded-lg mr-2 transition-colors ${
                  isDarkTheme()
                    ? "bg-white/20 hover:bg-white/30 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
                onClick={() => {
                  setSelectedEvent(null);
                  if (selectedEvent.interview?.id) {
                    window.location.href = `/dashboard/interviews/${selectedEvent.interview.id}`;
                  }
                }}
              >
                View Details
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkTheme()
                    ? "bg-white text-blue-700 hover:bg-white/90"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grouped Events Popup */}
      {groupedEventsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl max-w-md w-full mx-4 ${
            isDarkTheme()
              ? "bg-gradient-to-br from-blue-500/70 via-blue-600/70 to-blue-700/70 backdrop-blur-lg border border-white/20"
              : "bg-white border border-gray-200"
          }`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-2xl font-bold ${isDarkTheme() ? "text-white" : "text-gray-800"}`}>
                Events at {groupedEventsPopup.timeSlot}
              </h3>
              <button
                onClick={() => setGroupedEventsPopup(null)}
                className={`${
                  isDarkTheme() 
                    ? "text-white/70 hover:text-white" 
                    : "text-gray-500 hover:text-gray-700"
                } transition-colors`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className={`space-y-4 ${isDarkTheme() ? "text-white" : "text-gray-700"}`}>
              {groupedEventsPopup.events.map((event, i) => (
                <div
                  key={i}
                  className="bg-blue-500 rounded-md p-2 text-white text-xs shadow-md cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(event);
                    setGroupedEventsPopup(null);
                  }}
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="opacity-80 text-[10px] mt-1">{`${event.startTime} - ${event.endTime}`}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkTheme()
                    ? "bg-white text-blue-700 hover:bg-white/90"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
                onClick={() => setGroupedEventsPopup(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}