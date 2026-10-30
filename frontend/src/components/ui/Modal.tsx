import React, { useEffect, useRef } from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202020]/35 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card
        ref={modalRef}
        className={cn(
          'w-full bg-white/95 backdrop-blur-2xl border border-[#D8C9A8]/80 p-6 shadow-modal rounded-2xl space-y-4 animate-in zoom-in-95 duration-200 text-[#202020]',
          maxWidths[maxWidth],
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#E8E0D0]/80 pb-3">
          <div>
            {title && <h3 className="text-base font-serif font-bold text-[#202020] tracking-tight">{title}</h3>}
            {description && <p className="text-xs text-[#555555] mt-0.5 leading-relaxed">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-[#77736A] hover:text-[#202020] hover:bg-[#F4F0E6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-1 text-xs text-[#555555]">{children}</div>

        {footer && <div className="pt-3 border-t border-[#E8E0D0]/80 flex items-center justify-end gap-2">{footer}</div>}
      </Card>
    </div>
  );
};
