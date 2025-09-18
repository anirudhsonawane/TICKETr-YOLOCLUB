'use client';

interface ClerkTimeoutHandlerProps {
  children: React.ReactNode;
}

export default function ClerkTimeoutHandler({ children }: ClerkTimeoutHandlerProps) {
  // Just render the children directly - no loading screens, no timers, no error handling
  return <>{children}</>;
}
