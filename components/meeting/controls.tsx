"use client"

import { MicOff, Mic, Video, VideoOff, Share, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ControlsProps {
  audioEnabled: boolean
  videoEnabled: boolean
  isScreenSharing: boolean
  toggleAudio: () => void
  toggleVideo: () => void
  toggleScreenShare: () => void
}

export function Controls({
  audioEnabled,
  videoEnabled,
  isScreenSharing,
  toggleAudio,
  toggleVideo,
  toggleScreenShare,
}: ControlsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container h-full flex items-center justify-center gap-4">
        <Button
          variant={audioEnabled ? "outline" : "destructive"}
          size="icon"
          onClick={toggleAudio}
          className="h-12 w-12"
        >
          {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>
        <Button
          variant={videoEnabled ? "outline" : "destructive"}
          size="icon"
          onClick={toggleVideo}
          className="h-12 w-12"
        >
          {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </Button>
        <Button
          variant={isScreenSharing ? "default" : "outline"}
          size="icon"
          onClick={toggleScreenShare}
          className="h-12 w-12"
        >
          {isScreenSharing ? <Share2 className="h-6 w-6" /> : <Share className="h-6 w-6" />}
        </Button>
      </div>
    </div>
  )
}
