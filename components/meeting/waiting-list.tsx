'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "react-toastify";
import { useMeeting } from '@/lib/meeting-context';
import { Badge } from "@/components/ui/badge";

interface WaitingListProps {
  onClose: () => void;
}

export default function WaitingList({ onClose }: WaitingListProps) {
  const { waitingParticipants, admitParticipant, rejectParticipant, admitAllParticipants, isHost } = useMeeting();
  const [pendingActions, setPendingActions] = useState<Record<string, 'admitting' | 'rejecting' | null>>({});
  const [isAdmittingAll, setIsAdmittingAll] = useState(false);
  const [processedParticipants, setProcessedParticipants] = useState<Set<string>>(new Set());
  
  if (!isHost) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        Only the meeting host can view waiting participants.
      </div>
    );
  }
  
  if (waitingParticipants.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        No participants are waiting to join.
      </div>
    );
  }

  const handleAdmit = async (participantId: string) => {
    try {
      setPendingActions(prev => ({...prev, [participantId]: 'admitting'}));
      await admitParticipant(participantId);
      setProcessedParticipants(prev => new Set(prev).add(participantId));
      if (waitingParticipants.length === 1) {
        // Close dialog if this was the last participant
        setTimeout(onClose, 500);
      }
    } catch (error) {
      toast.error(`Failed to admit participant`);
    } finally {
      setPendingActions(prev => ({...prev, [participantId]: null}));
    }
  };
  
  const handleReject = async (participantId: string) => {
    try {
      setPendingActions(prev => ({...prev, [participantId]: 'rejecting'}));
      await rejectParticipant(participantId);
      setProcessedParticipants(prev => new Set(prev).add(participantId));
      if (waitingParticipants.length === 1) {
        // Close dialog if this was the last participant
        setTimeout(onClose, 500);
      }
    } catch (error) {
      toast.error(`Failed to reject participant`);
    } finally {
      setPendingActions(prev => ({...prev, [participantId]: null}));
    }
  };
  
  const handleAdmitAll = async () => {
    if (!admitAllParticipants) return;
    
    try {
      setIsAdmittingAll(true);
      await admitAllParticipants();
      // Mark all as processed
      setProcessedParticipants(new Set(waitingParticipants.map(p => p.id)));
      // Close dialog after admitting all
      setTimeout(onClose, 500);
    } catch (error) {
      toast.error(`Failed to admit all participants`);
    } finally {
      setIsAdmittingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      {waitingParticipants.map((participant) => {
        const isProcessed = processedParticipants.has(participant.id);
        const isPending = pendingActions[participant.id] !== undefined && pendingActions[participant.id] !== null;
        const isAdmitting = pendingActions[participant.id] === 'admitting';
        const isRejecting = pendingActions[participant.id] === 'rejecting';
        
        return (
          <div 
            key={participant.id} 
            className={`flex items-center justify-between p-3 rounded-md ${
              isProcessed ? 'bg-muted/50' : isPending ? 'bg-muted' : 'bg-accent/40'
            } transition-colors`}
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
                className="h-7 w-7 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20"
                onClick={() => handleAdmit(participant.id)}
                disabled={isPending || isAdmittingAll || isProcessed}
              >
                {isAdmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20"
                onClick={() => handleReject(participant.id)}
                disabled={isPending || isAdmittingAll || isProcessed}
              >
                {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        );
      })}
      
      {waitingParticipants.filter(p => !processedParticipants.has(p.id)).length > 1 && (
        <div className="pt-2 border-t border-muted">
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
              `Admit All (${waitingParticipants.filter(p => !processedParticipants.has(p.id)).length})`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
