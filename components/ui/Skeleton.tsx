import React from 'react';

export function Skeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-surface-container-high/60 animate-pulse rounded ${className}`}
      {...props}
    />
  );
}
