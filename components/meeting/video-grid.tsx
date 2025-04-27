"use client"

import { useEffect, useRef } from "react"
import { MicOff, Video, VideoOff, Mic } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface VideoGridProps {
  localStream: MediaStream | null
  remoteStreams: MediaStream[]
  localMuted: boolean
  localVideoEnabled: boolean
  remoteParticipants: { id: string; name: string }[]
}

export function VideoGrid({
  localStream,
  remoteStreams,
  remoteParticipants,
  localMuted,
  localVideoEnabled,
}: VideoGridProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  return (
    <div className="flex flex-wrap gap-4 justify-center items-center h-full">
      {/* Local Video */}
      <div className="relative rounded-lg overflow-hidden shadow-xl h-[calc(35vh-2rem)] aspect-video">
        <div
          className={cn(
            "absolute inset-0 bg-black flex items-center justify-center text-white",
            localVideoEnabled ? "hidden" : "block"
          )}
        >
          <VideoOff className="h-12 w-12" />
        </div>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "h-full w-full object-cover",
            !localVideoEnabled && "hidden"
          )}
        />
        <div className="absolute bottom-2 left-2 flex gap-2">
          <Badge variant="secondary" className="font-medium">
            You
          </Badge>
          {localMuted && (
            <Badge variant="destructive" className="font-medium">
              <MicOff className="h-3 w-3 mr-1" />
              Muted
            </Badge>
          )}
        </div>
      </div>

      {/* Remote Videos */}
      {remoteStreams.map((stream, index) => {
        const participant = remoteParticipants[index]
        const videoRef = useRef<HTMLVideoElement>(null)

        useEffect(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        }, [stream])

        return (
          <div key={stream.id} className="relative rounded-lg overflow-hidden shadow-xl h-[calc(35vh-2rem)] aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            {participant && (
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="font-medium">
                  {participant.name}
                </Badge>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
