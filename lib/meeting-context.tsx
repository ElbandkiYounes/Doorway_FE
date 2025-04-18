'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { WebRTCService } from './webrtc-service';
import { WaitingParticipant } from '@/components/meeting/waiting-participants';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install uuid package

// Define participant type
export type Participant = {
  id: string;
  name?: string;
  stream: MediaStream;
  audioEnabled: boolean;
  videoEnabled: boolean;
};

// Define meeting context type
type MeetingContextType = {
  participants: Participant[];
  waitingParticipants: WaitingParticipant[];
  localStream: MediaStream | null;
  isConnecting: boolean;
  isHost: boolean;
  isWaiting: boolean;
  isRejected: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  error: string | null;
  userName: string; // Add userName to the context
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  admitParticipant: (participantId: string) => void;
  rejectParticipant: (participantId: string) => void;
  admitAllParticipants: () => void;
  leaveCall: () => void;
};

// Create context
const MeetingContext = createContext<MeetingContextType | null>(null);

// Context provider props
type MeetingProviderProps = {
  children: ReactNode;
  meetingId: string;
  isHost: boolean;
  userName?: string;
  userAvatar?: string;
  userId: string; // Make userId required
};

export const MeetingProvider = ({ 
  children, 
  meetingId, 
  isHost, 
  userName = "User",
  userAvatar,
  userId
}: MeetingProviderProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [waitingParticipants, setWaitingParticipants] = useState<WaitingParticipant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isWaiting, setIsWaiting] = useState(!isHost); // participants start in waiting room
  const [isRejected, setIsRejected] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const webrtcServiceRef = useRef<WebRTCService | null>(null);

  // Initialize WebRTC
  useEffect(() => {
    let isMounted = true;

    const initializeWebRTC = async () => {
      try {
        setIsConnecting(true);

        // Only create a new WebRTC service if one doesn't exist
        if (!webrtcServiceRef.current) {
          console.log(`Creating WebRTC service with userId: ${userId}, isHost: ${isHost}`);

          // Create WebRTC service with the persistent userId
          const service = new WebRTCService(meetingId, userId, isHost, userName);
          webrtcServiceRef.current = service;

          // Set callbacks for participant events
          service.setCallbacks(
            (id, name, stream) => {
              setParticipants(prev => [
                ...prev.filter(p => p.id !== id),
                { id, name: name || `Guest ${id.substring(0, 4)}`, stream, audioEnabled: true, videoEnabled: true }
              ]);
            },
            (id) => {
              setParticipants(prev => prev.filter(p => p.id !== id));
            }
          );

          // Listen for media state changes
          service.signalingService.onMediaStateChanged = (userId, audioEnabled, videoEnabled) => {
            setParticipants(prev => prev.map(p => {
              if (p.id === userId) {
                return { ...p, audioEnabled, videoEnabled };
              }
              return p;
            }));
          };

          // Set callbacks for waiting room
          service.setWaitingRoomCallbacks(
            // onParticipantWaiting
            (id, name, avatar) => {
              if (isHost) {
                setWaitingParticipants(prev => [
                  ...prev.filter(p => p.id !== id),
                  { id, name, avatar, joinedAt: new Date() }
                ]);
              }
            },
            // onParticipantAdmitted
            (id) => {
              setWaitingParticipants(prev => prev.filter(p => p.id !== id));
            },
            // onAdmitted (for non-host participants)
            () => {
              setIsWaiting(false);
            },
            // onRejected (for non-host participants)
            () => {
              setIsWaiting(false);
              setIsRejected(true);
            }
          );

          // Initialize media
          if (isMounted) {
            const stream = await service.initialize();
            setLocalStream(stream);
            setError(null);
          }
        }
      } catch (err) {
        console.error('Failed to initialize WebRTC:', err);
        if (isMounted) {
          setError('Failed to access camera and microphone. Please grant permission and try again.');
        }
      } finally {
        if (isMounted) {
          setIsConnecting(false);
        }
      }
    };

    initializeWebRTC();

    // Cleanup on unmount
    return () => {
      isMounted = false;

      // Don't disconnect on hot-reload, only on actual unmount
      // We'll rely on the global socket instance management in SignalingService
      if (window.location.pathname !== `/meeting/${meetingId}`) {
        console.log('Unmounting MeetingProvider - cleaning up WebRTC connections');
        if (webrtcServiceRef.current) {
          webrtcServiceRef.current.disconnect();
          webrtcServiceRef.current = null;
        }
      }
    };
  }, [meetingId, isHost, userName, userId]);

  // Audio toggle
  const toggleAudio = () => {
    if (webrtcServiceRef.current && localStream) {
      const newState = !isAudioEnabled;
      webrtcServiceRef.current.toggleAudio(newState);
      setIsAudioEnabled(newState);
      
      // Immediately update our own state in the participants list if we're the host
      if (isHost) {
        setParticipants(prev => prev.map(p => {
          if (p.id === "host") {
            return { ...p, audioEnabled: newState };
          }
          return p;
        }));
      }
    }
  };

  // Video toggle
  const toggleVideo = () => {
    if (webrtcServiceRef.current && localStream) {
      const newState = !isVideoEnabled;
      webrtcServiceRef.current.toggleVideo(newState);
      setIsVideoEnabled(newState);
      
      // Immediately update our own state in the participants list if we're the host
      if (isHost) {
        setParticipants(prev => prev.map(p => {
          if (p.id === "host") {
            return { ...p, videoEnabled: newState };
          }
          return p;
        }));
      }
    }
  };

  // Screen sharing toggle
  const toggleScreenShare = async () => {
    if (!webrtcServiceRef.current) return;

    if (!isScreenSharing) {
      try {
        await webrtcServiceRef.current.startScreenShare();
        setIsScreenSharing(true);
      } catch (err) {
        console.error('Failed to start screen sharing:', err);
      }
    } else {
      await webrtcServiceRef.current.stopScreenShare();
      setIsScreenSharing(false);
    }
  };

  // Admit participant from waiting room
  const admitParticipant = (participantId: string) => {
    if (webrtcServiceRef.current && isHost) {
      webrtcServiceRef.current.admitParticipant(participantId);
      // UI will update through the callback
    }
  };

  // Reject participant from waiting room
  const rejectParticipant = (participantId: string) => {
    if (webrtcServiceRef.current && isHost) {
      webrtcServiceRef.current.rejectParticipant(participantId);
      // UI will update through the callback
    }
  };

  // Admit all participants in waiting room
  const admitAllParticipants = () => {
    if (webrtcServiceRef.current && isHost) {
      waitingParticipants.forEach(participant => {
        webrtcServiceRef.current.admitParticipant(participant.id);
      });
    }
  };

  // Leave call
  const leaveCall = () => {
    if (webrtcServiceRef.current) {
      webrtcServiceRef.current.disconnect();
    }

    // Redirect to interview details
    window.close(); // Or use router to navigate back
  };

  return (
    <MeetingContext.Provider value={{
      participants,
      waitingParticipants,
      localStream,
      isConnecting,
      isHost,
      isWaiting,
      isRejected,
      isAudioEnabled,
      isVideoEnabled,
      isScreenSharing,
      error,
      userName, // Expose userName to the context
      toggleAudio,
      toggleVideo,
      toggleScreenShare,
      admitParticipant,
      rejectParticipant,
      admitAllParticipants,
      leaveCall
    }}>
      {children}
    </MeetingContext.Provider>
  );
};

// Custom hook for using the meeting context
export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
};
