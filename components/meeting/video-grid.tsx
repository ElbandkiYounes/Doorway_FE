'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Participant } from '@/lib/meeting-context';
import { useMeeting } from '@/lib/meeting-context';
import { User, VideoOff, MicOff } from 'lucide-react';

interface VideoStreamProps {
  stream: MediaStream;
  isMuted: boolean;           // Whether audio playback is muted
  isLocalUser: boolean;       // New prop to identify if this is current user's stream
  microphoneEnabled: boolean; // New prop for actual microphone state
  isVideoOff: boolean;
  displayName?: string;
  recentlyChanged?: boolean;
  changedState?: 'audio' | 'video' | null;
}

// Individual video component
function VideoStream({ 
  stream, 
  isMuted, 
  isLocalUser,
  microphoneEnabled,
  isVideoOff, 
  displayName,
  recentlyChanged,
  changedState 
}: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoActive, setVideoActive] = useState(!isVideoOff);
  const [showChangeIndicator, setShowChangeIndicator] = useState(false);
  
  // Determine if we should show the mic muted icon
  // For local user: show based on actual microphone state
  // For remote users: show based on the isMuted prop
  const showMicMutedIcon = isLocalUser ? !microphoneEnabled : isMuted;
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  // Update videoActive state when isVideoOff prop changes
  useEffect(() => {
    setVideoActive(!isVideoOff && stream?.getVideoTracks().some(track => track.enabled) === true);
  }, [isVideoOff, stream]);
  
  // Show change indicator when media state changes
  useEffect(() => {
    if (recentlyChanged) {
      setShowChangeIndicator(true);
      const timer = setTimeout(() => setShowChangeIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [recentlyChanged]);
  
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
          {displayName || 'Unknown'}{isLocalUser ? ' (You)' : ''}
        </span>
        
        <div className="flex items-center gap-1">
          {/* Video status indicator */}
          {isVideoOff && (
            <span className="bg-red-600/70 w-6 h-6 flex items-center justify-center rounded-full">
              <VideoOff className="h-3 w-3" />
            </span>
          )}
          
          {/* Muted indicator - show based on actual mic state, not playback muted state */}
          {showMicMutedIcon && (
            <span className="bg-red-600/70 w-6 h-6 flex items-center justify-center rounded-full">
              <MicOff className="h-3 w-3" />
            </span>
          )}
        </div>
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
  const [recentChanges, setRecentChanges] = useState<Record<string, {type: 'audio' | 'video', timestamp: number}>>({});
  
  // Track media state changes to show indicators
  useEffect(() => {
    const newChanges = {...recentChanges};
    
    // Add each participant change to the tracking object
    participants.forEach(p => {
      const key = p.id;
      const prevState = newChanges[key];
      
      if (!prevState) {
        // Initial state - don't show notification
        return;
      }
      
      // If the state changed in the last 3 seconds, update the timestamp and type
      const now = Date.now();
      if (now - prevState.timestamp < 3000) {
        newChanges[key] = { ...prevState, timestamp: now };
      }
    });
    
    setRecentChanges(newChanges);
    
    // Clean up old notifications
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const currentChanges = {...recentChanges};
      let hasChanges = false;
      
      Object.entries(currentChanges).forEach(([key, value]) => {
        if (now - value.timestamp > 3000) {
          delete currentChanges[key];
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        setRecentChanges(currentChanges);
      }
    }, 1000);
    
    return () => clearInterval(cleanupInterval);
  }, [participants]);
  
  // Initialize tracking for new participants
  useEffect(() => {
    const newChanges = {...recentChanges};
    
    participants.forEach(p => {
      if (!newChanges[p.id]) {
        newChanges[p.id] = { type: 'audio', timestamp: Date.now() - 3000 }; // Initialize with expired timestamp
      }
    });
    
    setRecentChanges(newChanges);
  }, [participants.length]);
  
  // Record changes when audio/video state changes
  useEffect(() => {
    const newChanges = {...recentChanges};
    
    participants.forEach(p => {
      const key = p.id;
      const prevState = newChanges[key];
      
      if (!prevState) {
        newChanges[key] = { type: 'audio', timestamp: Date.now() - 3000 }; // Initialize with expired timestamp
        return;
      }
      
      // If audio state changed, update timestamp
      if (prevState.type === 'audio' && !p.audioEnabled) {
        newChanges[key] = { type: 'audio', timestamp: Date.now() };
      }
      
      // If video state changed, update timestamp
      if (prevState.type === 'video' && !p.videoEnabled) {
        newChanges[key] = { type: 'video', timestamp: Date.now() };
      }
    });
    
    setRecentChanges(newChanges);
  }, [participants.map(p => p.audioEnabled + '|' + p.videoEnabled).join(',')]);
  
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
          isLocalUser={true} // Identify this as the local user's stream
          microphoneEnabled={localAudioEnabled} // Pass actual microphone state
          isVideoOff={!localVideoEnabled}
          displayName={userName}
        />
      )}
      
      {/* Remote streams */}
      {participants.map((participant) => {
        const change = recentChanges[participant.id];
        const isRecentlyChanged = change && (Date.now() - change.timestamp < 3000);
        
        return (
          <VideoStream 
            key={participant.id}
            stream={participant.stream} 
            isMuted={!participant.audioEnabled} 
            isLocalUser={false} // This is a remote participant
            microphoneEnabled={participant.audioEnabled} 
            isVideoOff={!participant.videoEnabled}
            displayName={participant.name} 
            recentlyChanged={isRecentlyChanged}
            changedState={change?.type || null}
          />
        );
      })}
    </div>
  );
}
