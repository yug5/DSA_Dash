import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'easy' | 'medium' | 'hard' | 'primary' | 'outline';
}

export function Badge({ children, variant = 'default', className = '', ...props }: BadgeProps) {
  const baseStyle = 'inline-flex items-center font-mono text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-sm';
  const variants = {
    default: 'bg-surface-container-high text-on-surface-variant border border-outline-variant/40',
    easy: 'bg-[#153627] text-primary border border-primary/30',
    medium: 'bg-[#4a3b1a] text-[#f2c94c] border border-[#f2c94c]/30',
    hard: 'bg-error-container text-error border border-error/30',
    primary: 'bg-primary text-on-primary font-semibold',
    outline: 'bg-transparent text-on-surface-variant border border-outline-variant',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
