import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export function Skeleton({ className = '', width, height, borderRadius }: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{ opacity: 0.6 }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      }}
      className={`bg-white/[0.05] relative overflow-hidden ${className}`}
      style={{
        width,
        height,
        borderRadius: borderRadius ?? '0.5rem',
      }}
    >
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
      />
    </motion.div>
  );
}

export function CardSkeleton() {
  return (
    <div className="w-[160px] md:w-[190px] shrink-0 p-2 rounded-2xl border border-white/5 bg-white/[0.02]">
      <Skeleton className="aspect-[2/3] w-full mb-3" borderRadius="1rem" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full aspect-[21/9] md:aspect-[25/9] rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 md:p-16 flex flex-col justify-center">
      <Skeleton className="h-4 w-24 mb-4 rounded-full" />
      <Skeleton className="h-12 md:h-16 w-1/2 mb-6" />
      <Skeleton className="h-4 w-2/3 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-8" />
      <div className="flex gap-4">
        <Skeleton className="h-12 w-40 rounded-full" />
        <Skeleton className="h-12 w-40 rounded-full" />
      </div>
    </div>
  );
}

export function DiscoverSkeleton() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton width={48} height={48} borderRadius="1rem" />
          <div className="space-y-2">
            <Skeleton width={150} height={24} />
            <Skeleton width={200} height={12} />
          </div>
        </div>
        <HeroSkeleton />
        <div className="flex gap-2 mt-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width={80} height={32} borderRadius="9999px" />
          ))}
        </div>
      </header>
      
      {Array.from({ length: 2 }).map((_, i) => (
        <section key={i}>
          <div className="flex justify-between items-end mb-6">
            <div className="space-y-2">
              <Skeleton width={180} height={20} />
              <Skeleton width={120} height={10} />
            </div>
            <Skeleton width={80} height={28} borderRadius="9999px" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, j) => (
              <CardSkeleton key={j} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
