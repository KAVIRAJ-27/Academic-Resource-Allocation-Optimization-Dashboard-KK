import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[] | boolean;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs = true,
  primaryAction,
  secondaryAction,
  badge,
  className = '',
}) => {
  return (
    <div className={`space-y-3 pb-6 border-b border-[#1E2330] ${className}`}>
      {/* Optional Breadcrumbs */}
      {breadcrumbs && (
        <Breadcrumbs
          items={typeof breadcrumbs === 'boolean' ? undefined : breadcrumbs}
        />
      )}

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-gray-400 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            {secondaryAction}
            {primaryAction}
          </div>
        )}
      </div>
    </div>
  );
};
