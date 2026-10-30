import React from 'react';

export const PageLoader: React.FC<{ message?: string }> = ({
  message = 'Loading AHRAO Workspace...',
}) => {
  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-2 border-[#B8A16A]/20 border-t-[#B8A16A] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-[#B8A16A]/15 animate-pulse" />
        </div>
      </div>
      <p className="text-sm text-[#77736A] font-medium tracking-wide animate-pulse">{message}</p>
    </div>
  );
};
