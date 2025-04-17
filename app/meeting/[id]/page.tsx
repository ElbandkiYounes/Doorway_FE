'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { VideoGrid } from '@/components/meeting/video-grid';
import { ControlBar } from '@/components/meeting/controls';
import { WaitingRoom } from '@/components/meeting/waiting-room';
import { WaitingParticipants } from '@/components/meeting/waiting-participants';
import { MeetingProvider, useMeeting } from '@/lib/meeting-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Store user ID in sessionStorage to prevent regeneration on refresh/HMR
const getOrCreateUserId = () => {
  if (typeof window !== 'undefined') {
    const storedId = sessionStorage.getItem('doorway-meeting-user-id');
    if (storedId) {
      return storedId;
    }
    const newId = uuidv4();
    sessionStorage.setItem('doorway-meeting-user-id', newId);
    return newId;
  }
  return uuidv4(); // Fallback for SSR
};

function MeetingContent() {
  const { 
    participants, 
    waitingParticipants,
    localStream, 
    isConnecting, 
    error,
    isHost,
    isWaiting,
    isRejected,
    isAudioEnabled, 
    isVideoEnabled,
    admitParticipant,
    rejectParticipant,
    admitAllParticipants,
    leaveCall
  } = useMeeting();
  
  const router = useRouter();

  // If the participant was rejected
  if (isRejected) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="max-w-md p-6 bg-destructive/10 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="mb-4">Your request to join this meeting was rejected by the host.</p>
          <Button onClick={() => router.back()}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  // If participant is waiting to be admitted
  if (isWaiting) {
    return (
      <WaitingRoom
        userName="Participant"
        meetingTitle="Interview Meeting"
        onLeave={leaveCall}
      />
    );
  }

  // If still connecting
  if (isConnecting) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl font-medium">Connecting to meeting...</p>
      </div>
    );
  }

  // If there was an error
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="max-w-md p-6 bg-destructive/10 rounded-lg text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">Connection Error</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 container max-w-6xl mx-auto p-4 pb-24">
        {/* Video Grid */}
        <VideoGrid 
          participants={participants} 
          localStream={localStream}
          localAudioEnabled={isAudioEnabled}
          localVideoEnabled={isVideoEnabled}
        />
        
        {/* Waiting Room Notification Panel (only for host) */}
        {isHost && (
          <WaitingParticipants 
            participants={waitingParticipants}
            onAdmit={admitParticipant}
            onReject={rejectParticipant}
            onAdmitAll={waitingParticipants.length > 1 ? admitAllParticipants : undefined}
          />
        )}
      </main>
      
      {/* Controls */}
      <ControlBar isHost={isHost} />
    </div>
  );
}

export default function MeetingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [meetingId, setMeetingId] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [userName, setUserName] = useState('Guest');
  const userIdRef = useRef<string>(getOrCreateUserId());
  
  useEffect(() => {
    const id = params.id as string;
    setMeetingId(id);
    
    // Check if user is host
    const role = searchParams.get('role');
    setIsHost(role === 'host');
    
    // Get user name if provided
    const name = searchParams.get('name');
    if (name) {
      setUserName(name);
    }

    console.log(`MeetingPage mounted with userId: ${userIdRef.current}, isHost: ${role === 'host'}`);

    // Clean up function to help with HMR/refresh issues
    return () => {
      console.log('MeetingPage unmounting, cleaning up connections');
    };
  }, [params.id, searchParams]);
  
  if (!meetingId) {
    return <div className="flex justify-center p-4">Loading...</div>;
  }

  // Only render the provider once we have the necessary data
  return (
    <MeetingProvider 
      meetingId={meetingId} 
      isHost={isHost}
      userName={userName}
      userId={userIdRef.current}  // Pass the persistent userId
    >
      <MeetingContent />
    </MeetingProvider>
  );
}
