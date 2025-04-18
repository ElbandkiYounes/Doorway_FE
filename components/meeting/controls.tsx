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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4 border-t">
      <div className="container max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant={isAudioEnabled ? "outline" : "destructive"} 
            size="icon"
            onClick={handleToggleAudio}
            className="relative"
            title={isAudioEnabled ? "Mute" : "Unmute"}
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            {!isAudioEnabled && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background"></span>
            )}
          </Button>
          
          <Button 
            variant={isVideoEnabled ? "outline" : "destructive"} 
            size="icon"
            onClick={handleToggleVideo}
            className="relative"
            title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            {!isVideoEnabled && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background"></span>
            )}
          </Button>
          
          <Button 
            variant={isScreenSharing ? "secondary" : "outline"} 
            size="icon"
            onClick={toggleScreenShare}
            className={isScreenSharing ? "bg-amber-500/20 border-amber-500 text-amber-700" : ""}
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
              className="flex items-center gap-1"
              title="Copy meeting link to clipboard"
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
            title="Leave the meeting"
          >
            <PhoneOff className="h-4 w-4" />
            <span>End Call</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
