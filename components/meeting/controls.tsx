'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, UserPlus } from "lucide-react";
import { useMeeting } from '@/lib/meeting-context';
import { toast } from 'react-toastify';

interface ControlBarProps {
  isHost: boolean;
}

export function ControlBar({ isHost }: ControlBarProps) {
  const { 
    isAudioEnabled, 
    isVideoEnabled, 
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    leaveCall
  } = useMeeting();

  // Copy meeting link
  const copyMeetingLink = () => {
    navigator.clipboard.writeText(window.location.href.replace('?role=host', ''));
    toast.success("Meeting link copied to clipboard");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4 border-t">
      <div className="container max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant={isAudioEnabled ? "outline" : "destructive"} 
            size="icon"
            onClick={toggleAudio}
            title={isAudioEnabled ? "Mute" : "Unmute"}
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button 
            variant={isVideoEnabled ? "outline" : "destructive"} 
            size="icon"
            onClick={toggleVideo}
            title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          
          <Button 
            variant={isScreenSharing ? "secondary" : "outline"} 
            size="icon"
            onClick={toggleScreenShare}
            title={isScreenSharing ? "Stop sharing" : "Share screen"}
          >
            <Monitor className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {isHost && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={copyMeetingLink}
              title="Copy meeting link"
              className="flex items-center gap-1"
            >
              <UserPlus className="h-4 w-4" />
              <span>Copy Invite Link</span>
            </Button>
          )}
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={leaveCall}
            className="flex items-center gap-1"
          >
            <PhoneOff className="h-4 w-4" />
            <span>End Call</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
