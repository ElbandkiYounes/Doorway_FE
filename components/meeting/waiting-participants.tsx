'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, Bell, BellOff, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

export interface WaitingParticipant {
  id: string;
  name?: string;
  avatar?: string;
  joinedAt: Date;
}

interface WaitingParticipantsProps {
  participants: WaitingParticipant[];
  onAdmit: (participantId: string) => Promise<void>;
  onReject: (participantId: string) => Promise<void>;
  onAdmitAll?: () => Promise<void>;
}

export function WaitingParticipants({ 
  participants, 
  onAdmit, 
  onReject,
  onAdmitAll 
}: WaitingParticipantsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [previousCount, setPreviousCount] = useState(participants.length);
  
  // Track loading states for each participant
  const [pendingActions, setPendingActions] = useState<Record<string, 'admitting' | 'rejecting' | null>>({});
  const [isAdmittingAll, setIsAdmittingAll] = useState(false);

  // Track admitted and rejected participants
  const [admittedParticipants, setAdmittedParticipants] = useState<WaitingParticipant[]>([]);
  const [rejectedParticipants, setRejectedParticipants] = useState<Set<string>>(new Set());
  const [waitingParticipants, setWaitingParticipants] = useState<WaitingParticipant[]>([]);

  // Update waitingParticipants when participants prop changes
  useEffect(() => {
    const updatedWaitingParticipants = participants.filter(
      (p) => 
        !admittedParticipants.some((ap) => ap.id === p.id) && 
        !rejectedParticipants.has(p.id) &&
        !pendingActions[p.id]
    );
    setWaitingParticipants(updatedWaitingParticipants);
  }, [participants, admittedParticipants, rejectedParticipants, pendingActions]);

  // Handle notification for new participants
  useEffect(() => {
    if (waitingParticipants.length > previousCount && notificationsEnabled) {
      // Play notification sound
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(err => console.log('Could not play notification sound', err));
      
      // Show toast notification
      const newParticipants = waitingParticipants.length - previousCount;
      toast.info(
        `${newParticipants} ${newParticipants === 1 ? 'person' : 'people'} joined the waiting room`, 
        { autoClose: 3000 }
      );
    }
    
    setPreviousCount(waitingParticipants.length);
  }, [waitingParticipants.length, previousCount, notificationsEnabled]);
  
  // Handle admit action with loading state and better error handling
  const handleAdmit = async (participantId: string) => {
    try {
      // Set loading state
      setPendingActions(prev => ({...prev, [participantId]: 'admitting'}));
      
      // Call the provided onAdmit function
      await onAdmit(participantId);

      // Move participant to admitted list
      const admittedParticipant = waitingParticipants.find(p => p.id === participantId);
      if (admittedParticipant) {
        setAdmittedParticipants(prev => [...prev, admittedParticipant]);
      }

      // Remove participant from waiting list
      setWaitingParticipants(prev => prev.filter(p => p.id !== participantId));
    } catch (error) {
      console.error("Error admitting participant:", error);
      toast.error(`Failed to admit participant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Clear loading state
      setPendingActions(prev => ({...prev, [participantId]: null}));
    }
  };
  
  // Handle reject action with loading state and better error handling
  const handleReject = async (participantId: string) => {
    try {
      // Set loading state
      setPendingActions(prev => ({...prev, [participantId]: 'rejecting'}));
      
      // Call the provided onReject function
      await onReject(participantId);

      // Add participant to rejected list
      setRejectedParticipants(prev => new Set(prev).add(participantId));

      // Remove participant from waiting list
      setWaitingParticipants(prev => prev.filter(p => p.id !== participantId));
    } catch (error) {
      console.error("Error rejecting participant:", error);
      toast.error(`Failed to reject participant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Clear loading state
      setPendingActions(prev => ({...prev, [participantId]: null}));
    }
  };
  
  // Handle admit all with loading state
  const handleAdmitAll = async () => {
    if (!onAdmitAll) return;
    
    try {
      setIsAdmittingAll(true);
      await onAdmitAll();

      // Move all participants to admitted list
      setAdmittedParticipants(prev => [...prev, ...waitingParticipants]);
      setWaitingParticipants([]);
    } catch (error) {
      console.error("Error admitting all participants:", error);
    } finally {
      setIsAdmittingAll(false);
    }
  };
  
  if (waitingParticipants.length === 0 && admittedParticipants.length === 0) {
    return null;
  }
  
  // If collapsed, only show a notification badge
  if (isCollapsed) {
    return (
      <div 
        className="fixed top-4 right-4 z-10 cursor-pointer"
        onClick={() => setIsCollapsed(false)}
      >
        <div className="flex items-center justify-center bg-primary text-primary-foreground p-3 rounded-full shadow-lg animate-pulse">
          <Bell className="h-5 w-5" />
          <Badge 
            variant="destructive"
            className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center"
          >
            {waitingParticipants.length}
          </Badge>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed top-4 right-4 z-10 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-4 max-w-sm w-full animate-in slide-in-from-right">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium flex items-center">
          <span className="relative">
            Waiting Room
            <Badge 
              variant="secondary"
              className="ml-2 bg-primary/10 text-primary"
            >
              {waitingParticipants.length}
            </Badge>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          >
            {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => setIsCollapsed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
        {/* Waiting Participants Section */}
        {waitingParticipants.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Waiting Participants</h3>
            {waitingParticipants.map((participant) => {
              const isPending = pendingActions[participant.id] !== undefined && pendingActions[participant.id] !== null;
              const isAdmitting = pendingActions[participant.id] === 'admitting';
              const isRejecting = pendingActions[participant.id] === 'rejecting';
              
              return (
                <div 
                  key={participant.id} 
                  className={`flex items-center justify-between p-2 rounded-md ${isPending ? 'bg-muted' : 'bg-accent/40 hover:bg-accent/60'} transition-colors`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>
                        {participant.name ? participant.name.charAt(0).toUpperCase() : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-sm font-medium block">
                        {participant.name || `Guest ${participant.id.substring(0, 4)}`}
                        {isPending && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {isAdmitting ? "Admitting..." : "Rejecting..."}
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Waiting {formatWaitingTime(participant.joinedAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600 transition-colors"
                      onClick={() => handleAdmit(participant.id)}
                      disabled={isPending || isAdmittingAll}
                    >
                      {isAdmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 transition-colors"
                      onClick={() => handleReject(participant.id)}
                      disabled={isPending || isAdmittingAll}
                    >
                      {isRejecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Admitted Participants Section */}
        {admittedParticipants.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Participants</h3>
            {admittedParticipants.map((participant) => (
              <div 
                key={participant.id} 
                className="flex items-center p-2 rounded-md bg-accent/40 mb-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback>
                    {participant.name ? participant.name.charAt(0).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <span className="text-sm font-medium block">
                    {participant.name || `Guest ${participant.id.substring(0, 4)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {waitingParticipants.length > 1 && onAdmitAll && (
        <div className="mt-3 pt-2 border-t border-muted">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleAdmitAll}
            disabled={isAdmittingAll || Object.values(pendingActions).some(status => status !== null)}
          >
            {isAdmittingAll ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Admitting all...
              </>
            ) : (
              `Admit All (${waitingParticipants.length})`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper function to format waiting time
function formatWaitingTime(joinedAt: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - joinedAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) {
    return 'just now';
  } else if (diffMins === 1) {
    return '1 minute';
  } else if (diffMins < 60) {
    return `${diffMins} minutes`;
  } else {
    const hours = Math.floor(diffMins / 60);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
}
