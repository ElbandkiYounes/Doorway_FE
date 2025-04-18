'use client';

import React, { useState } from 'react';
import { Participant } from '@/lib/meeting-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ParticipantsNotificationProps {
  participants: Participant[];
  hostName: string;
  isHost: boolean;
  userName?: string;
}

export function ParticipantsNotification({ 
  participants, 
  hostName, 
  isHost,
  userName = "You"
}: ParticipantsNotificationProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const totalParticipants = participants.length + 1; // Include host in count
  
  // Find the host ID - when a participant joins, the host has ID "host"
  const hostId = "host";
  const hostParticipant = participants.find(p => p.id === hostId);
  
  // If we're not the host, and we found a host in participants, use that name
  const actualHostName = isHost ? userName : (hostParticipant?.name || hostName);

  // If collapsed, show a button with the participants count
  if (isCollapsed) {
    return (
      <div 
        className="fixed bottom-24 right-4 z-10 cursor-pointer" // Position at bottom-right, with offset to avoid overlapping with waiting room
        onClick={() => setIsCollapsed(false)}
      >
        <div className="flex items-center justify-center bg-primary text-primary-foreground p-3 rounded-full shadow-lg">
          <Users className="h-5 w-5" />
          <span className="ml-2 text-sm font-medium">{totalParticipants}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-10 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-4 max-w-sm w-full animate-in slide-in-from-right"> {/* Position at bottom-right with offset */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Participants ({totalParticipants})</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={() => setIsCollapsed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {/* Current user */}
        <div className="flex items-center p-2 rounded-md bg-accent/40 border border-primary/20">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/user-placeholder.svg" />
            <AvatarFallback>
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="ml-3 text-sm font-medium flex items-center">
            {userName} <span className="text-xs text-muted-foreground ml-2">(You)</span>
            {isHost && <Badge className="ml-2 bg-primary/20 text-primary text-xs" variant="secondary">Host</Badge>}
          </span>
        </div>

        {/* Remote participants */}
        {participants.map((participant) => (
          <div 
            key={participant.id} 
            className="flex items-center p-2 rounded-md bg-accent/40 hover:bg-accent/60 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={participant.avatar || "/user-placeholder.svg"} />
              <AvatarFallback>
                {participant.name ? participant.name.charAt(0).toUpperCase() : <Users className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <span className="ml-3 text-sm font-medium flex items-center">
              {participant.name}
              {participant.id === hostId && (
                <Badge className="ml-2 bg-primary/20 text-primary text-xs" variant="secondary">Host</Badge>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
