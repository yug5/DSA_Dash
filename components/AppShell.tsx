'use client';

import React from 'react';
import Sidebar from './Sidebar';
import AIAssistantWidget from './AIAssistantWidget';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Sidebar />
      <main className="md:pl-[240px] transition-all duration-200">
        <div className="max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
      <AIAssistantWidget />
    </div>
  );
}
