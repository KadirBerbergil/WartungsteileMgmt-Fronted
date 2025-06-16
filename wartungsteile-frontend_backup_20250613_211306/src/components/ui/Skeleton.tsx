import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  };
  
  return (
    <div
      className={cn(
        baseClasses,
        animationClasses[animation],
        variantClasses[variant],
        className
      )}
      style={{
        width: width || '100%',
        height: height || '1rem'
      }}
    />
  );
};

// Composite Skeleton Components
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className 
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        height="0.875rem"
        width={i === lines - 1 ? '80%' : '100%'}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
    <div className="flex items-start justify-between mb-4">
      <Skeleton variant="rectangular" width="40%" height="1.5rem" />
      <Skeleton variant="circular" width="2rem" height="2rem" />
    </div>
    <SkeletonText lines={3} />
    <div className="mt-4 flex gap-2">
      <Skeleton variant="rectangular" width="5rem" height="2rem" />
      <Skeleton variant="rectangular" width="5rem" height="2rem" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="overflow-hidden">
    <table className="min-w-full">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className="px-6 py-3">
              <Skeleton height="1rem" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex} className="border-t">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <td key={colIndex} className="px-6 py-4">
                <Skeleton height="0.875rem" width={colIndex === 0 ? '60%' : '80%'} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Add shimmer animation to tailwind.config.js:
// animation: {
//   shimmer: 'shimmer 2s linear infinite',
// },
// keyframes: {
//   shimmer: {
//     '0%': { backgroundPosition: '-1000px 0' },
//     '100%': { backgroundPosition: '1000px 0' },
//   }
// }

export default Skeleton;