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
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#0B0D14] shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="p-1.5 rounded-lg bg-[#171A23] text-gray-400 hover:text-white border border-[#1E2330]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Sidebar role={role} className="w-full border-r-0" onItemClick={onClose} />
      </div>
    </div>
  );
};
