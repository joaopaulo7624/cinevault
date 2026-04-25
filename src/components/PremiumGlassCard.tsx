import React from 'react';
import { cn } from '../lib/utils';

interface PremiumGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** @deprecated kept for API compatibility, no longer used */
  tiltAmount?: number;
  /** @deprecated kept for API compatibility, no longer used */
  innerParallaxAmount?: number;
  containerClassName?: string;
}

/**
 * PremiumGlassCard — v3
 * Replaced GSAP 3D-tilt with the same hover pattern used by the
 * "Tendências da Semana" cards: smooth image scale-up + gradient
 * overlay reveal.  Pure CSS — zero JS at runtime.
 */
export function PremiumGlassCard({
  children,
  className,
  containerClassName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tiltAmount: _t,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  innerParallaxAmount: _ip,
  ...props
}: PremiumGlassCardProps) {
  return (
    <div className={cn('relative', containerClassName)}>
      <div
        className={cn(
          // Base layout
          'group w-full h-full relative overflow-hidden',
          'rounded-[var(--radius-xl)]',
          // Glass border
          'border border-white/[0.05] hover:border-white/[0.18]',
          'transition-[border-color,box-shadow] duration-300',
          // Subtle lift shadow on hover
          'hover:shadow-[0_8px_40px_rgba(0,0,0,0.55)]',
          // Glass background
          'liquid-glass-interactive bg-white/[0.01] backdrop-blur-[2px]',
          className
        )}
        {...props}
      >
        {/* Children — images inside get scale-110 via group-hover on their own class */}
        {children}

        {/* Static top-edge specular glare */}
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none z-20"
          aria-hidden
        />
      </div>
    </div>
  );
}
