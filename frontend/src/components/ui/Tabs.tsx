import React from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  if (variant === 'pills') {
    return (
      <div className={cn('flex items-center gap-1.5 p-1 bg-[#F8F6F0] border border-[#E8E0D0] rounded-xl', className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                isActive
                  ? 'bg-white text-[#202020] shadow-xs border border-[#D8C9A8] font-semibold'
                  : 'text-[#555555] hover:text-[#202020] hover:bg-[#F4F0E6]'
              )}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={cn('px-1.5 py-0.2 rounded-full text-[10px] font-mono', isActive ? 'bg-[#F4F0E6] text-[#202020] border border-[#D8C9A8]' : 'bg-[#F8F6F0] text-[#555555]')}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-4 border-b border-[#E8E0D0]', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 pb-2.5 text-xs font-semibold tracking-wide transition-all border-b-2 -mb-px',
              isActive
                ? 'border-[#B8A16A] text-[#202020]'
                : 'border-transparent text-[#77736A] hover:text-[#202020] hover:border-[#D8C9A8]'
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={cn('px-1.5 py-0.2 rounded-full text-[10px] font-mono', isActive ? 'bg-[#F4F0E6] text-[#202020] border border-[#D8C9A8]' : 'bg-[#F8F6F0] text-[#77736A]')}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
