'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, Bell, BellOff } from "lucide-react";
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
  onAdmit: (participantId: string) => void;
  onReject: (participantId: string) => void;
  onAdmitAll?: () => void;
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
  
  // Handle notification for new participants
  useEffect(() => {
    if (participants.length > previousCount && notificationsEnabled) {
      // Play notification sound
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(err => console.log('Could not play notification sound', err));
      
      // Show toast notification
      const newParticipants = participants.length - previousCount;
      toast.info(
        `${newParticipants} ${newParticipants === 1 ? 'person' : 'people'} joined the waiting room`, 
        { autoClose: 3000 }
      );
      
      // Try to send desktop notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Doorway Meeting', {
          body: `${newParticipants} ${newParticipants === 1 ? 'person' : 'people'} waiting to join`,
          icon: '/logo.png'
        });
      }
    }
    
    setPreviousCount(participants.length);
  }, [participants.length, previousCount, notificationsEnabled]);
  
  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
  };
  
  useEffect(() => {
    requestNotificationPermission();
  }, []);
  
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
            {participants.length}
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
              {participants.length}
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
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {participants.map((participant) => (
          <div 
            key={participant.id} 
            className="flex items-center justify-between p-2 rounded-md bg-accent/40 hover:bg-accent/60 transition-colors"
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
                <span className="text-xs text-muted-foreground">
                  Waiting {formatWaitingTime(participant.joinedAt)}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600"
                onClick={() => onAdmit(participant.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600"
                onClick={() => onReject(participant.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {participants.length > 1 && onAdmitAll && (
        <div className="mt-3 pt-2 border-t border-muted">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onAdmitAll}
          >
            Admit All ({participants.length})
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
