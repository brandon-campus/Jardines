import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="w-full min-h-screen bg-naranja-50 md:bg-gray-50 flex flex-col relative overflow-x-hidden">
      {children}
    </div>
  );
}
