import React from 'react';
import { AlertTriangle, Info, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ErrorMessageProps {
  type?: 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  className?: string;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  type = 'error',
  title,
  message,
  className,
  onDismiss,
}) => {
  const styles = {
    error: {
      container: 'bg-[#FDF0F0] border-[#ECC6C6] text-[#B44747]',
      icon: XCircle,
      iconColor: 'text-[#B44747]',
    },
    warning: {
      container: 'bg-[#FAF4E8] border-[#EED9B2] text-[#A87928]',
      icon: AlertTriangle,
      iconColor: 'text-[#A87928]',
    },
    info: {
      container: 'bg-[#EFF4F8] border-[#C6D5E2] text-[#657C91]',
      icon: Info,
      iconColor: 'text-[#657C91]',
    },
  }[type];

  const IconComponent = styles.icon;

  return (
    <div
      className={cn(
        'p-4 rounded-xl border flex items-start gap-3 text-sm shadow-xs',
        styles.container,
        className
      )}
    >
      <IconComponent className={cn('w-5 h-5 mt-0.5 shrink-0', styles.iconColor)} />
      <div className="flex-1">
        {title && <h4 className="font-serif font-bold mb-0.5">{title}</h4>}
        <p className="text-xs sm:text-sm opacity-95">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-[#77736A] hover:text-[#202020] text-xs p-1 transition-colors"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};
