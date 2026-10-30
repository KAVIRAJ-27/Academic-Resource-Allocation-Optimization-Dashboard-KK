import React, { useEffect } from 'react';
import { UserRole } from '../../constants/roles';
import { Sidebar } from './Sidebar';
import { X } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, role }) => {
  // Prevent body scrolling when drawer is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#202020]/30 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#FFFEFA]/95 backdrop-blur-2xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200 border-r border-[#D8C9A8]/70">
        <div className="absolute top-3.5 right-3.5 z-50">
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="p-1.5 rounded-lg bg-white/80 backdrop-blur-xs text-[#77736A] hover:text-[#202020] border border-[#D8C9A8]/80 transition-colors shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <Sidebar role={role} className="w-full border-r-0" onItemClick={onClose} />
      </div>
    </div>
  );
};
