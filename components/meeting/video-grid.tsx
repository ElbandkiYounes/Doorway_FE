'use client';

import React, { useRef, useEffect } from 'react';
import { Participant } from '@/lib/meeting-context';

interface VideoStreamProps {
  stream: MediaStream;
  isMuted: boolean;
  isVideoOff: boolean;
  displayName?: string;
}

// Individual video component
function VideoStream({ stream, isMuted, isVideoOff, displayName }: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  return (
    <div className="relative overflow-hidden rounded-lg bg-muted">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted} 
        className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
      />
      
      {isVideoOff && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-semibold">
            {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      )}
      
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
        {displayName || 'Unknown'} {isMuted && '(muted)'}
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
          displayName="You"
        />
      )}
      
      {/* Remote streams */}
      {participants.map((participant) => (
        <VideoStream 
          key={participant.id}
          stream={participant.stream} 
          isMuted={!participant.audioEnabled}
          isVideoOff={!participant.videoEnabled}
          displayName={`Participant ${participant.id.substring(0, 4)}`}
        />
      ))}
    </div>
  );
}
