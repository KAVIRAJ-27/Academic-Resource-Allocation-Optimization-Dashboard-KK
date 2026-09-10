import React from 'react';

interface DashboardGridProps {
  children: React.ReactNode;
  variant?: 'stats' | 'charts' | 'split' | 'full' | 'actions' | 'custom';
  cols?: 1 | 2 | 3 | 4 | 6;
  className?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  variant = 'stats',
  cols,
  className = '',
}) => {
  const getGridClasses = () => {
    if (cols) {
      const colMap = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
      };
      return `grid ${colMap[cols]} gap-4 sm:gap-6`;
    }

    switch (variant) {
      case 'stats':
        // 4 cols on desktop, 2 on tablet, 1 on mobile
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6';
      case 'charts':
        // 2 cols on desktop/tablet, 1 on mobile
        return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
      case 'split':
        // 3 cols (2:1 split commonly used for table + right panel)
        return 'grid grid-cols-1 lg:grid-cols-3 gap-6';
      case 'actions':
        // Action cards
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
      case 'full':
        return 'grid grid-cols-1 gap-6';
      case 'custom':
      default:
        return 'grid gap-4 sm:gap-6';
    }
  };

  return <div className={`${getGridClasses()} ${className}`}>{children}</div>;
};

interface GridColProps {
  children: React.ReactNode;
  span?: 1 | 2 | 3;
  className?: string;
}

export const GridCol: React.FC<GridColProps> = ({
  children,
  span = 1,
  className = '',
}) => {
  const spanClass = {
    1: 'lg:col-span-1',
    2: 'lg:col-span-2',
    3: 'lg:col-span-3',
  }[span];

  return <div className={`${spanClass} ${className}`}>{children}</div>;
};
