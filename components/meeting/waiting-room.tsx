"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MicOff, Mic, Video, VideoOff } from "lucide-react"

interface WaitingRoomProps {
  onJoinMeeting: () => void
  localStream: MediaStream | null
  audioEnabled: boolean
  videoEnabled: boolean
  toggleAudio: () => void
  toggleVideo: () => void
}

export function WaitingRoom({
  onJoinMeeting,
  localStream,
  audioEnabled,
  videoEnabled,
  toggleAudio,
  toggleVideo,
}: WaitingRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream
    }
  }, [localStream])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-primary/10 via-primary/5 to-background">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Meeting Room</CardTitle>
          <CardDescription>Check your audio and video before joining</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="relative mx-auto rounded-lg overflow-hidden shadow-xl aspect-video">
              <div
                className={`absolute inset-0 bg-black flex items-center justify-center text-white ${
                  videoEnabled ? "hidden" : "block"
                }`}
              >
                <VideoOff className="h-12 w-12" />
              </div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full ${!videoEnabled && "hidden"}`}
              />
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant={audioEnabled ? "default" : "destructive"}
                size="icon"
                onClick={toggleAudio}
              >
                {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button
                variant={videoEnabled ? "default" : "destructive"}
                size="icon"
                onClick={toggleVideo}
              >
                {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex justify-center">
              <Button onClick={onJoinMeeting}>Join Meeting</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
