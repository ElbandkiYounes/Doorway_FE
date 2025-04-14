'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import WebRTCVideo from '@/components/interviews/webrtc-video';
import { useSearchParams } from 'next/navigation';

export default function PublicMeetingPage() {
  const searchParams = useSearchParams();
  const meetingId = searchParams.get('meetingId');
  const userName = searchParams.get('name') || 'Guest';

  if (!meetingId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-6">
          <h1 className="text-xl font-semibold mb-4">Invalid Meeting Link</h1>
          <p>This meeting link is invalid or has expired.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <WebRTCVideo 
        roomId={meetingId}
        userName={userName}
        onEndCall={() => window.close()}
      />
    </div>
  );
}