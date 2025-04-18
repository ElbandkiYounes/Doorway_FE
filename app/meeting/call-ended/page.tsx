'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Video, Smile } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CallEndedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isHost, setIsHost] = useState(false);
  
  // Extract isHost parameter from URL
  useEffect(() => {
    const hostParam = searchParams.get('isHost');
    setIsHost(hostParam === 'true');
  }, [searchParams]);
  
  // Use this effect to prevent back navigation to the meeting
  useEffect(() => {
    // Clear any meeting-related data from session storage
    if (typeof window !== 'undefined') {
      // Keep the user ID but clear any other meeting data if needed
      // sessionStorage.removeItem('some-meeting-data');
    }
  }, []);
  
  return (
    <div className="flex-1 flex items-center justify-center  p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center ">
            <div className="p-4 rounded-full">
              <Smile className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Call Ended</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center text-muted-foreground">
          <p>Your meeting has ended. Thank you for using Doorway Meeting!</p>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          {/* Only show "Start Another Meeting" button if the user was a host */}
          {isHost && (
            <Button variant="outline" onClick={() => router.back()} className="w-full">
              <Video className="mr-2 h-4 w-4" />
              Start Another Meeting
            </Button>
          )}
          
          {/* Always show a way to return to dashboard */}
          <Button variant="default" onClick={() => router.push('/')} className="w-full">
            <Home className="mr-1 h-4 w-4" />
            Go Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
