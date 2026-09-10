import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Info, Shield, Layers, X } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'info' | 'security' | 'system';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Phase 1 Foundation Active',
    message: 'AHRAO architecture and 6-role routing foundation successfully loaded.',
    time: '2m ago',
    unread: true,
    type: 'system',
  },
  {
    id: '2',
    title: 'MySQL Connection Target Set',
    message: 'Datasource pointed to academic_hostel_resource_allocation via environment.',
    time: '15m ago',
    unread: true,
    type: 'security',
  },
  {
    id: '3',
    title: 'SDG 4 Compliance Initialized',
    message: 'Equitable academic & hostel allocation telemetry contracts established.',
    time: '1h ago',
    unread: false,
    type: 'info',
  },
];

export const NotificationArea: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications"
        className="relative p-2 rounded-xl bg-[#171A23] border border-[#1E2330] text-gray-300 hover:text-white hover:border-gray-600 transition-colors focus:outline-none focus:ring-1 focus:ring-teal-500"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-500 text-[10px] font-bold text-[#080A0F] flex items-center justify-center ring-2 ring-[#080A0F]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#11141C] border border-[#1E2330] shadow-dropdown z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-4 border-b border-[#1E2330] flex items-center justify-between bg-[#141822]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-400" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {unreadCount} New
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Mark read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-[#1E2330] max-h-80 overflow-y-auto">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 hover:bg-[#171A23]/60 transition-colors flex items-start gap-3 ${
                  item.unread ? 'bg-teal-500/[0.03]' : ''
                }`}
              >
                <div className="p-2 rounded-lg bg-[#171A23] border border-[#1E2330] text-teal-400 shrink-0 mt-0.5">
                  {item.type === 'security' ? (
                    <Shield className="w-3.5 h-3.5" />
                  ) : item.type === 'system' ? (
                    <Layers className="w-3.5 h-3.5" />
                  ) : (
                    <Info className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="text-xs font-semibold text-gray-200 truncate">{item.title}</h5>
                    <span className="text-[10px] text-gray-500 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
                    {item.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-[#141822] border-t border-[#1E2330] text-center">
            <span className="text-[11px] text-gray-400 font-mono">
              Real-time telemetry stream active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
