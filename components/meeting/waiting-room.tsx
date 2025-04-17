'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface WaitingRoomProps {
  userName: string;
  userAvatar?: string;
  meetingTitle?: string;
  onLeave: () => void;
}

export function WaitingRoom({ 
  userName, 
  userAvatar, 
  meetingTitle = "Interview Meeting",
  onLeave 
}: WaitingRoomProps) {
  return (
    <div className="h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Waiting to join</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <Avatar className="h-20 w-20 mx-auto">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="text-xl">
              {userName ? userName.charAt(0).toUpperCase() : "G"}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <h3 className="font-medium text-lg">{meetingTitle}</h3>
            <p className="text-sm text-muted-foreground">
              The host will let you in soon
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Waiting for admission...</span>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onLeave}
          >
            Leave
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
