'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Participant } from '@/lib/meeting-context';
import { useMeeting } from '@/lib/meeting-context';
import { User, VideoOff, MicOff } from 'lucide-react';

interface VideoStreamProps {
  stream: MediaStream;
  isMuted: boolean;
  isVideoOff: boolean;
  displayName?: string;
}

// Individual video component
function VideoStream({ stream, isMuted, isVideoOff, displayName }: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoActive, setVideoActive] = useState(!isVideoOff);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  // Update videoActive state when isVideoOff prop changes
  useEffect(() => {
    setVideoActive(!isVideoOff && stream?.getVideoTracks().some(track => track.enabled) === true);
  }, [isVideoOff, stream]);
  
  return (
    <div className="relative overflow-hidden rounded-lg bg-muted h-full">
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted} 
        className={videoActive ? "w-full h-full object-cover" : "hidden"}
      />
      
      {/* Camera off placeholder */}
      {!videoActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/90">
          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mb-3">
            {displayName ? (
              <span className="text-3xl font-medium text-primary/90">{displayName.charAt(0).toUpperCase()}</span>
            ) : (
              <User className="h-10 w-10 text-primary/80" />
            )}
          </div>
          <p className="text-gray-200 font-medium">{displayName || 'Unknown'}</p>
          <div className="flex items-center mt-2 bg-black/40 px-3 py-1 rounded-full">
            <VideoOff className="h-3 w-3 text-red-400 mr-1.5" />
            <span className="text-xs text-gray-300">Camera off</span>
          </div>
        </div>
      )}
      
      {/* Status indicators */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <span className="bg-black/60 px-2 py-1 rounded text-xs text-white">
          {displayName || 'Unknown'}
        </span>
        
        {/* Muted indicator */}
        {isMuted && (
          <span className="bg-red-600/70 px-2 py-1 rounded text-xs text-white flex items-center">
            <MicOff className="h-3 w-3 mr-1" />
            <span>Muted</span>
          </span>
        )}
      </div>
    </div>
  );
}

interface VideoGridProps {
  participants: Participant[];
  localStream: MediaStream | null;
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
}

export function VideoGrid({ participants, localStream, localAudioEnabled, localVideoEnabled }: VideoGridProps) {
  // Get userName from the meeting context
  const { userName } = useMeeting();
  
  // Determine grid layout class based on number of participants
  const getGridClass = () => {
    const count = participants.length + (localStream ? 1 : 0);
    
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    if (count <= 9) return "grid-cols-3";
    return "grid-cols-4";
  };
  
  return (
    <div className={`grid ${getGridClass()} gap-4 h-full`}>
      {/* Local stream */}
      {localStream && (
        <VideoStream 
          stream={localStream} 
          isMuted={true} // Always mute local stream to prevent echo
          isVideoOff={!localVideoEnabled}
          displayName={userName} // Use the actual user name instead of "You"
        />
      )}
      
      {/* Remote streams - now showing mic/camera status from participant data */}
      {participants.map((participant) => (
        <VideoStream 
          key={participant.id}
          stream={participant.stream} 
          isMuted={!participant.audioEnabled} // Use the current audioEnabled state from participant
          isVideoOff={!participant.videoEnabled} // Use the current videoEnabled state from participant
          displayName={participant.name} // Always use the participant's actual name
        />
      ))}
    </div>
  );
}
