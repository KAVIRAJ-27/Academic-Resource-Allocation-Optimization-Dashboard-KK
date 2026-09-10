import React, { ReactNode } from 'react';
import {
  FolderOpen,
  Users,
  Hotel,
  CalendarClock,
  Layers,
  Search,
  LucideIcon,
} from 'lucide-react';
import { Button } from '../ui/Button';

export type EmptyPreset =
  | 'no-students'
  | 'no-hostel-rooms'
  | 'no-allocation-requests'
  | 'no-resources'
  | 'no-search-results'
  | 'generic';

export interface EmptyStateProps {
  preset?: EmptyPreset;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
  children?: ReactNode;
}

const PRESET_CONFIG: Record<
  EmptyPreset,
  { title: string; description: string; icon: LucideIcon }
> = {
  'no-students': {
    title: 'No students found.',
    description: 'There are currently no student records in this department or category.',
    icon: Users,
  },
  'no-hostel-rooms': {
    title: 'No hostel rooms available.',
    description: 'All residential rooms in this block are currently allocated or under maintenance.',
    icon: Hotel,
  },
  'no-allocation-requests': {
    title: 'No allocation requests.',
    description: 'All pending resource and room requests have been processed.',
    icon: CalendarClock,
  },
  'no-resources': {
    title: 'No resources found.',
    description: 'No academic or physical equipment matches the current filter criteria.',
    icon: Layers,
  },
  'no-search-results': {
    title: 'No matching records.',
    description: 'Try adjusting your search criteria or filter parameters.',
    icon: Search,
  },
  generic: {
    title: 'No data available.',
    description: 'No information is currently registered for this view.',
    icon: FolderOpen,
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  preset = 'generic',
  title,
  description,
  icon,
  actionLabel,
  onAction,
  compact = false,
  className = '',
  children,
}) => {
  const config = PRESET_CONFIG[preset];
  const DisplayIcon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  if (compact) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 text-center rounded-xl bg-[#11141C]/40 border border-[#1E2330] w-full ${className}`}>
        <div className="w-9 h-9 rounded-xl bg-[#171A23] border border-[#1E2330] flex items-center justify-center text-teal-400 mb-2 shadow-sm">
          <DisplayIcon className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-semibold text-gray-200 mb-1">{displayTitle}</h4>
        <p className="text-[11px] text-gray-400 max-w-xs mb-2 leading-relaxed">{displayDescription}</p>
        {actionLabel && onAction && (
          <Button variant="outline" size="xs" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {children}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-[#11141C]/60 border border-[#1E2330] my-4 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-[#171A23] border border-[#1E2330] flex items-center justify-center text-teal-400 mb-4 shadow-card">
        <DisplayIcon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-gray-100 mb-1.5">{displayTitle}</h3>
      <p className="text-xs sm:text-sm text-gray-400 max-w-md mb-6">{displayDescription}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  );
};
