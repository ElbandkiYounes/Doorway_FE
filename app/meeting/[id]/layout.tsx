'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { MeetingHeader } from '@/components/meeting/header';

export default function MeetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {/* Make sure the main layout has a full height */}
      <div className="flex flex-col h-screen overflow-hidden">
        <MeetingHeader />
        {/* Make this div take the remaining height and handle overflow properly */}
        <div className="flex-1 pt-14 pb-20 h-[calc(100vh-34px-80px)] overflow-hidden">
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
