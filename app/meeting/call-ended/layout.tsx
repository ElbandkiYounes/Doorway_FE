'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { MeetingHeader } from '@/components/meeting/header';

export default function CallEndedLayout({
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
      <div className="min-h-screen flex flex-col">
        <MeetingHeader />
        <div className="flex-1 pt-14"> {/* Add top padding to account for fixed header */}
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
