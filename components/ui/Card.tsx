import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'interactive';
}

export function Card({ children, variant = 'default', className = '', ...props }: CardProps) {
  const baseStyle = 'rounded-md border p-6 transition-all duration-150';
  const variants = {
    default: 'bg-surface-container-low border-outline-variant text-on-surface',
    subtle: 'bg-surface-container-lowest border-outline-variant/60 text-on-surface',
    interactive:
      'bg-surface-container-low border-outline-variant text-on-surface hover:border-outline hover:bg-surface-container-high cursor-pointer',
  };

  return (
    <div className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-center justify-between pb-4 border-b border-outline-variant mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`font-headline-md text-headline-md font-semibold text-on-surface ${className}`}>{children}</h3>;
}
