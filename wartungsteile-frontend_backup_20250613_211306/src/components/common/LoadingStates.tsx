import React from 'react';
import { SkeletonCard, SkeletonTable } from '../ui/Skeleton';

// Machine List Loading State
export const MachineListSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// Dashboard Metrics Loading State
export const DashboardMetricsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
    ))}
  </div>
);

// Table Loading State
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 5 
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <SkeletonTable rows={rows} columns={columns} />
  </div>
);

// Form Loading State
export const FormSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
    {[...Array(4)].map((_, i) => (
      <div key={i}>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse" />
      </div>
    ))}
    <div className="flex gap-3 pt-4">
      <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse" />
      <div className="h-10 w-24 bg-blue-200 rounded-md animate-pulse" />
    </div>
  </div>
);

// Detail Page Loading State
export const DetailPageSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <div className="h-3 w-16 bg-gray-100 rounded animate-pulse mb-1" />
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
    
    {/* Content sections */}
    {[...Array(2)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, j) => (
            <div key={j} className="flex justify-between">
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Generic Loading Spinner
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({ 
  size = 'md', 
  text 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`} />
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
};

// Empty State Component
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    {icon && (
      <div className="text-gray-400 mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-gray-500 text-center max-w-sm mb-4">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// Error State Component
export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Ein Fehler ist aufgetreten', message, onRetry }) => (
  <div className="bg-red-50 rounded-lg p-6 text-center">
    <div className="mx-auto h-12 w-12 text-red-400 mb-4">
      <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-red-800 mb-2">{title}</h3>
    <p className="text-sm text-red-600 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Erneut versuchen
      </button>
    )}
  </div>
);

export default {
  MachineListSkeleton,
  DashboardMetricsSkeleton,
  TableSkeleton,
  FormSkeleton,
  DetailPageSkeleton,
  LoadingSpinner,
  EmptyState,
  ErrorState
};