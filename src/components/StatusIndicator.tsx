
import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'error' | 'success' | 'warning' | 'idle';

interface StatusIndicatorProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  blinking?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  className,
  size = 'md',
  label,
  blinking = false,
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const statusClasses = {
    error: 'bg-status-error',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    idle: 'bg-gray-400'
  };

  return (
    <div className="flex items-center gap-1.5">
      <div 
        className={cn(
          'rounded-full shadow-glow',
          statusClasses[status],
          sizeClasses[size],
          blinking && 'animate-pulse duration-500',
          className
        )}
      />
      {label && <span className="text-xs font-medium">{label}</span>}
    </div>
  );
};

export default StatusIndicator;
