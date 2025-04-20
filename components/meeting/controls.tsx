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
    leaveCall,
    userName
  } = useMeeting();

  // Copy meeting link
  const copyMeetingLink = () => {
    navigator.clipboard.writeText(window.location.href.replace('?role=host', ''));
    toast.success("Meeting link copied to clipboard");
  };

  // Enhanced toggle handlers with toast notifications
  const handleToggleAudio = () => {
    const newState = !isAudioEnabled;
    toggleAudio();
    
    // Toast will be visible only to the current user
    toast.info(`You ${newState ? 'unmuted' : 'muted'} your microphone`, { 
      autoClose: 2000,
      position: "bottom-center"
    });
  };

  const handleToggleVideo = () => {
    const newState = !isVideoEnabled;
    toggleVideo();
    
    // Toast will be visible only to the current user
    toast.info(`You turned ${newState ? 'on' : 'off'} your camera`, { 
      autoClose: 2000,
      position: "bottom-center"
    });
  };

  const handleLeaveCall = () => {
    // Use the leaveCall function from context which has been updated to redirect
    leaveCall();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm p-3 md:p-4 border-t shadow-lg">
      <div className="container max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-1 md:gap-2">
          <Button 
            variant={isAudioEnabled ? "outline" : "destructive"} 
            size="icon"
            onClick={handleToggleAudio}
            className="relative h-9 w-9 md:h-10 md:w-10"
            title={isAudioEnabled ? "Mute" : "Unmute"}
          >
            {isAudioEnabled ? <Mic className="h-4 w-4 md:h-5 md:w-5" /> : <MicOff className="h-4 w-4 md:h-5 md:w-5" />}
            {!isAudioEnabled && (
              <span className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full border-2 border-background"></span>
            )}
          </Button>
          
          <Button 
            variant={isVideoEnabled ? "outline" : "destructive"} 
            size="icon"
            onClick={handleToggleVideo}
            className="relative h-9 w-9 md:h-10 md:w-10"
            title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {isVideoEnabled ? <Video className="h-4 w-4 md:h-5 md:w-5" /> : <VideoOff className="h-4 w-4 md:h-5 md:w-5" />}
            {!isVideoEnabled && (
              <span className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full border-2 border-background"></span>
            )}
          </Button>
          
          <Button 
            variant={isScreenSharing ? "secondary" : "outline"} 
            size="icon"
            onClick={toggleScreenShare}
            className={`h-9 w-9 md:h-10 md:w-10 ${isScreenSharing ? "bg-amber-500/20 border-amber-500 text-amber-700" : ""}`}
            title={isScreenSharing ? "Stop sharing" : "Share screen"}
          >
            <Monitor className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {isHost && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={copyMeetingLink}
              className="flex items-center gap-1 text-xs md:text-sm"
              title="Copy meeting link to clipboard"
            >
              <UserPlus className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Copy Invite Link</span>
              <span className="inline sm:hidden">Invite</span>
            </Button>
          )}
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleLeaveCall}
            className="flex items-center gap-1 text-xs md:text-sm"
            title="Leave the meeting"
          >
            <PhoneOff className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">End Call</span>
            <span className="inline sm:hidden">End</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
