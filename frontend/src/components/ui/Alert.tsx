import React from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}) => {
  const styles = {
    success: {
      container: 'bg-[#EEF6F1] border-[#C1DFCD] text-[#3F7655]',
      icon: <CheckCircle2 className="w-4 h-4 text-[#3F7655] shrink-0 mt-0.5" />,
    },
    error: {
      container: 'bg-[#FDF0F0] border-[#ECC6C6] text-[#B44747]',
      icon: <AlertCircle className="w-4 h-4 text-[#B44747] shrink-0 mt-0.5" />,
    },
    warning: {
      container: 'bg-[#FAF4E8] border-[#EED9B2] text-[#A87928]',
      icon: <AlertTriangle className="w-4 h-4 text-[#A87928] shrink-0 mt-0.5" />,
    },
    info: {
      container: 'bg-[#EFF4F8] border-[#C6D5E2] text-[#657C91]',
      icon: <Info className="w-4 h-4 text-[#657C91] shrink-0 mt-0.5" />,
    },
  };

  return (
    <div
      role="alert"
      className={cn(
        'p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed transition-all shadow-xs',
        styles[variant].container,
        className
      )}
    >
      {styles[variant].icon}

      <div className="flex-1">
        {title && <span className="font-serif font-bold block mb-0.5 text-sm">{title}</span>}
        <div>{children}</div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="p-1 -mr-1 -mt-1 rounded-lg hover:bg-black/5 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
