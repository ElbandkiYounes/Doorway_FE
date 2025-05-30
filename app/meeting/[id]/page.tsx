'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { VideoGrid } from '@/components/meeting/video-grid';
import { ControlBar } from '@/components/meeting/controls';
import { WaitingRoom } from '@/components/meeting/waiting-room';
import { WaitingParticipants } from '@/components/meeting/waiting-participants';
import { ParticipantsNotification } from '@/components/meeting/participants-notification';
import { MeetingProvider, useMeeting } from '@/lib/meeting-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, X, Code } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { CodeEditor } from '@/components/meeting/code-editor';

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

function MeetingContent({ userId }: { userId: string }) {
  const params = useParams();
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
    leaveCall,
    userName
  } = useMeeting();
  
  const router = useRouter();
  const [isCodeEditorVisible, setIsCodeEditorVisible] = useState(true);
  
  // Find the host participant if we're not the host
  const hostParticipant = !isHost ? participants.find(p => p.id === "host") : null;
  const hostName = hostParticipant?.name || "Host";

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
    <div className="flex flex-col h-full">
      <main className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
        {/* Left side - Video Grid */}
        <div 
          className={`${
            isCodeEditorVisible ? 'w-full lg:w-1/2' : 'w-full'
          } h-full transition-all duration-300 ease-in-out flex flex-col`}
        >
          <div className="flex-1 p-1 md:p-2 overflow-hidden">
            <VideoGrid 
              participants={participants} 
              localStream={localStream}
              localAudioEnabled={isAudioEnabled}
              localVideoEnabled={isVideoEnabled}
            />
          </div>
        </div>
        
        {/* Right side - Code Editor (conditionally rendered) */}
        {isCodeEditorVisible ? (
          <div className="w-full lg:w-1/2 h-full border-t lg:border-t-0 lg:border-l transition-all duration-300 ease-in-out flex flex-col">
            <div className=" p-2 border-b flex justify-between items-center fixed right-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsCodeEditorVisible(false)}
                className="h-7 w-7 p-0"
              >
                <span className="sr-only">Hide Editor</span>
                <X className=" h-4 w-4 " />
              </Button>
            </div>
            {/* Make sure to specify that this div takes all available height */}
            <div className="flex-1 h-full overflow-hidden">
              <CodeEditor 
                roomId={params.id as string}
                userId={userId}
              />
            </div>
          </div>
        ) : (
          <div className="fixed top-16 right-4 z-10">
            <Button 
              onClick={() => setIsCodeEditorVisible(true)}
              className="shadow-lg rounded-full p-2.5 bg-primary/90 hover:bg-primary text-primary-foreground"
              size="sm"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
      
      {/* Waiting Room Notification Panel (only for host) */}
      {isHost && (
        <WaitingParticipants
          participants={waitingParticipants}
          onAdmit={admitParticipant}
          onReject={rejectParticipant}
          onAdmitAll={waitingParticipants.length > 1 ? admitAllParticipants : undefined}
        />
      )}
      
      {/* Participants Notification UI */}
      <ParticipantsNotification 
        participants={participants} 
        hostName={hostName} 
        isHost={isHost}
        userName={userName}
      />

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
  const [userName, setUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false); // Track if the user is joining
  const userIdRef = useRef<string>(getOrCreateUserId());

  useEffect(() => {
    const id = params.id as string;
    setMeetingId(id);
    
    // Check if user is host
    const role = searchParams.get('role');
    setIsHost(role === 'host');

    console.log(`MeetingPage mounted with userId: ${userIdRef.current}, isHost: ${role === 'host'}`);

    // Clean up function to help with HMR/refresh issues
    return () => {
      console.log('MeetingPage unmounting, cleaning up connections');
    };
  }, [params.id, searchParams]);

  const handleJoin = () => {
    if (!userName.trim()) {
      toast.error("Please enter your name before joining.");
      return;
    }
    setIsJoining(true);
  };

  if (!isJoining) {
    return (
      <div className="h-screen flex items-center justify-center bg-muted/30">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold">Join Meeting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">
                  Enter your name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleJoin} className="w-full">
                Join Meeting
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (!meetingId) {
    return <div className="flex justify-center p-4">Loading...</div>;
  }

  // Only render the provider once we have the necessary data
  return (
    <MeetingProvider 
      meetingId={meetingId} 
      isHost={isHost}
      userName={userName} // Pass the entered userName
      userId={userIdRef.current}  // Pass the persistent userId
    >
      <MeetingContent userId={userIdRef.current} />
    </MeetingProvider>
  );
}
