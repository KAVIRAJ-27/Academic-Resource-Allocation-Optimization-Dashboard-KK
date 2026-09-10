import React from 'react';
import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
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
      container: 'bg-rose-950/30 border-rose-900/50 text-rose-300',
      icon: XCircle,
      iconColor: 'text-rose-400',
    },
    warning: {
      container: 'bg-amber-950/30 border-amber-900/50 text-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
    },
    info: {
      container: 'bg-teal-950/30 border-teal-900/50 text-teal-300',
      icon: Info,
      iconColor: 'text-teal-400',
    },
  }[type];

  const IconComponent = styles.icon;

  return (
    <div
      className={cn(
        'p-4 rounded-xl border flex items-start gap-3 text-sm backdrop-blur-sm',
        styles.container,
        className
      )}
    >
      <IconComponent className={cn('w-5 h-5 mt-0.5 shrink-0', styles.iconColor)} />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <p className="text-xs sm:text-sm opacity-90">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-white text-xs p-1 transition-colors"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};
