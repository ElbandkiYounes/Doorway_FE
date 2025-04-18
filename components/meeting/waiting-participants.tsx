'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, Bell, BellOff, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { useMeeting } from '@/lib/meeting-context';

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
  const { signalingService } = useMeeting(); // Access signaling service from the meeting context
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pendingActions, setPendingActions] = useState<Record<string, 'admitting' | 'rejecting' | null>>({});
  const [isAdmittingAll, setIsAdmittingAll] = useState(false);
  const [processedParticipants, setProcessedParticipants] = useState<Set<string>>(new Set()); // Track admitted/rejected participants

  // Handle admit action with loading state and better error handling
  const handleAdmit = async (participantId: string) => {
    try {
      // Set loading state
      setPendingActions(prev => ({...prev, [participantId]: 'admitting'}));
      
      // Call the provided onAdmit function
      await onAdmit(participantId);

      // Mark participant as processed
      setProcessedParticipants(prev => new Set(prev).add(participantId));
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

      // Mark participant as processed
      setProcessedParticipants(prev => new Set(prev).add(participantId));
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

      // Mark all participants as processed
      setProcessedParticipants(new Set(participants.map(p => p.id)));
    } catch (error) {
      console.error("Error admitting all participants:", error);
    } finally {
      setIsAdmittingAll(false);
    }
  };

  if (participants.length === 0) {
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
            {participants.filter(p => !processedParticipants.has(p.id)).length}
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
              {participants.filter(p => !processedParticipants.has(p.id)).length}
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
        {participants.map((participant) => {
          const isProcessed = processedParticipants.has(participant.id); // Check if participant is processed
          const isPending = pendingActions[participant.id] !== undefined && pendingActions[participant.id] !== null;
          const isAdmitting = pendingActions[participant.id] === 'admitting';
          const isRejecting = pendingActions[participant.id] === 'rejecting';
          
          return (
            <div 
              key={participant.id} 
              className={`flex items-center justify-between p-2 rounded-md ${isProcessed ? 'bg-muted/50' : isPending ? 'bg-muted' : 'bg-accent/40 hover:bg-accent/60'} transition-colors`}
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
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600 transition-colors"
                  onClick={() => handleAdmit(participant.id)}
                  disabled={isPending || isAdmittingAll || isProcessed} // Disable if processed
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
                  disabled={isPending || isAdmittingAll || isProcessed} // Disable if processed
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
      
      {participants.filter(p => !processedParticipants.has(p.id)).length > 1 && onAdmitAll && (
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
              `Admit All (${participants.filter(p => !processedParticipants.has(p.id)).length})`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
