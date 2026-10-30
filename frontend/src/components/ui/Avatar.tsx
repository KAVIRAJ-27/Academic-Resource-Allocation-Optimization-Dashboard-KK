import React from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name = 'User',
  src,
  size = 'md',
  status,
  className,
}) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-xs sm:text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const statusColors = {
    online: 'bg-[#3F7655] ring-2 ring-white',
    offline: 'bg-[#77736A] ring-2 ring-white',
    busy: 'bg-[#B44747] ring-2 ring-white',
  };

  return (
    <div className={cn('relative inline-flex shrink-0 select-none', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-xl object-cover border border-[#D8C9A8]', sizes[size])}
        />
      ) : (
        <div
          className={cn(
            'rounded-xl bg-[#F4F0E6] border border-[#D8C9A8] text-[#202020] font-serif font-bold flex items-center justify-center',
            sizes[size]
          )}
        >
          {initials}
        </div>
      )}

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full',
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};
