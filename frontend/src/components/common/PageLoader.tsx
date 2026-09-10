import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export const PageLoader: React.FC<{ message?: string }> = ({
  message = 'Loading AHRAO Workspace...',
}) => {
  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-2 border-teal-500/20 border-t-teal-400 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-teal-500/20 animate-pulse" />
        </div>
      </div>
      <p className="text-sm text-gray-400 font-medium tracking-wide animate-pulse">{message}</p>
    </div>
  );
};
