"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoMeeting } from "@/lib/video-meeting-service"
import { demoVideoMeetingService as videoMeetingService } from "@/lib/video-meeting-service"
import { Video, Mail, Copy, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Interview } from "@/lib/api-service"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import WebRTCVideo from "@/components/interviews/webrtc-video"

interface VideoMeetingCardProps {
  interview: Interview;
}

export function VideoMeetingCard({ interview }: VideoMeetingCardProps) {
  const [meeting, setMeeting] = useState<VideoMeeting | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [isSendingInvites, setIsSendingInvites] = useState(false)
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Check if there's an existing meeting for this interview
  const checkExistingMeeting = async () => {
    try {
      const existingMeeting = await videoMeetingService.getByInterviewId(interview.id)
      if (existingMeeting) {
        setMeeting(existingMeeting)
      }
    } catch (error) {
      console.error("Failed to check for existing meeting:", error)
    }
  }

  // Use useEffect to check for existing meetings when component mounts
  useEffect(() => {
    checkExistingMeeting()
  }, [])

  // Start a new video meeting
  const startMeeting = async () => {
    try {
      setIsCreating(true)
      
      // Check for existing meeting first
      const existingMeeting = await videoMeetingService.getByInterviewId(interview.id)
      
      if (existingMeeting && existingMeeting.isActive) {
        setMeeting(existingMeeting)
        toast({
          title: "Meeting Already Active",
          description: "This interview already has an active video meeting",
        })
        return
      }
      
      // Create a new meeting
      const newMeeting = await videoMeetingService.create(interview.id)
      setMeeting(newMeeting)
      
      toast({
        title: "Meeting Created",
        description: "Video meeting has been created successfully",
      })
    } catch (error) {
      console.error("Failed to start meeting:", error)
      toast({
        title: "Error",
        description: "Failed to create video meeting",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // End the current meeting
  const endMeeting = async () => {
    if (!meeting) return
    
    try {
      setIsEnding(true)
      await videoMeetingService.end(meeting.id)
      
      // Update local state
      setMeeting({
        ...meeting,
        isActive: false,
        endedAt: new Date().toISOString()
      })
      
      toast({
        title: "Meeting Ended",
        description: "Video meeting has been ended successfully",
      })
    } catch (error) {
      console.error("Failed to end meeting:", error)
      toast({
        title: "Error",
        description: "Failed to end video meeting",
        variant: "destructive",
      })
    } finally {
      setIsEnding(false)
    }
  }

  // Send email invitations to participants
  const sendInvitations = async () => {
    if (!meeting) return
    
    try {
      setIsSendingInvites(true)
      await videoMeetingService.sendInvitations(meeting.id, interview.id)
      
      toast({
        title: "Invitations Sent",
        description: "Meeting invitations have been sent successfully",
      })
    } catch (error) {
      console.error("Failed to send invitations:", error)
      toast({
        title: "Error",
        description: "Failed to send meeting invitations",
        variant: "destructive",
      })
    } finally {
      setIsSendingInvites(false)
    }
  }

  // Copy meeting link to clipboard
  const copyMeetingLink = () => {
    if (!meeting) return;
    
    // Create a public meeting link that anyone can join without authentication
    const publicLink = `${window.location.origin}/meeting/${interview.id}?meetingId=${meeting.id}&name=${encodeURIComponent(interview.interviewingProcess?.interviewee?.name || 'Interviewee')}`;
    navigator.clipboard.writeText(publicLink);
    
    toast({
      title: "Link Copied",
      description: "Meeting link copied to clipboard. Share this with the interviewee."
    });
  }

  // Join the meeting using WebRTC - navigate to dedicated meeting page
  const joinMeeting = () => {
    if (!meeting) return;
    setIsVideoDialogOpen(true);
  }

  // Handle when call ends
  const handleEndCall = () => {
    setIsVideoDialogOpen(false);
  };
  
  const interviewerName = interview.interviewer?.name || "Unknown Interviewer"
  const intervieweeName = interview.interviewingProcess?.interviewee?.name || "Unknown Interviewee"
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="h-5 w-5 mr-2" />
            Video Interview
          </CardTitle>
          <CardDescription>
            Conduct a live video interview with {intervieweeName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!meeting ? (
            <div className="p-8 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Active Meeting</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Start a video meeting to conduct a live interview with the candidate
              </p>
              <Button 
                onClick={startMeeting} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? "Creating Meeting..." : "Start Video Interview"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Meeting Status</h3>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${meeting.isActive ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                    {meeting.isActive ? "Active" : "Ended"}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interviewer:</span>
                    <span>{interviewerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interviewee:</span>
                    <span>{intervieweeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(meeting.createdAt).toLocaleString()}</span>
                  </div>
                  {meeting.endedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ended:</span>
                      <span>{new Date(meeting.endedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center"
                  onClick={copyMeetingLink}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Meeting Link
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center"
                  onClick={sendInvitations}
                  disabled={isSendingInvites || !meeting.isActive}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {isSendingInvites ? "Sending..." : "Send Email Invites"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {meeting?.isActive ? (
            <>
              <Button 
                variant="destructive" 
                onClick={endMeeting}
                disabled={isEnding || !meeting.isActive}
              >
                <X className="h-4 w-4 mr-2" />
                {isEnding ? "Ending..." : "End Meeting"}
              </Button>
              
              <Button 
                variant="default" 
                onClick={joinMeeting}
                disabled={!meeting.isActive}
              >
                <Video className="h-4 w-4 mr-2" />
                Join Video Call
              </Button>
            </>
          ) : (
            <Button 
              onClick={startMeeting} 
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? "Creating Meeting..." : "Start Video Interview"}
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="max-w-[90vw] w-full h-[90vh]">
          <WebRTCVideo
            roomId={meeting?.id || ''}
            userName={interviewerName}
            onEndCall={handleEndCall}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}