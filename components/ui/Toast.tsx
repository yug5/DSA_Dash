'use client';

import React, { useEffect } from 'react';
import { Snowflake, X } from 'lucide-react';

interface ToastProps {
  isVisible: boolean;
  title: string;
  description: string;
  onClose: () => void;
  durationMs?: number;
}

export function Toast({
  isVisible,
  title,
  description,
  onClose,
  durationMs = 5000,
}: ToastProps) {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [isVisible, durationMs, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-surface-container-high border border-cyan-500/40 rounded-lg p-4 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="p-2 bg-cyan-500/10 rounded-md text-cyan-400 shrink-0">
          <Snowflake className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-mono text-sm font-semibold text-on-surface flex items-center gap-1.5">
            ❄ {title}
          </h4>
          <p className="font-mono text-xs text-on-surface-variant mt-1 leading-relaxed">
            {description}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-sm"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
