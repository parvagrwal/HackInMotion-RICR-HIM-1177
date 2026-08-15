'use client';

import { useState, useRef, useEffect } from 'react';
import type { NotificationItem } from '@/lib/analysis';

export function NotificationsPopover({
  initialNotifications = [],
}: {
  initialNotifications?: NotificationItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'alerts' | 'insights'>('all');
  const [notifications] = useState<NotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialNotifications.length);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setUnreadCount(0);
  };

  const filteredList = notifications.filter((n) => {
    if (filter === 'alerts') return n.severity === 'danger' || n.severity === 'warning';
    if (filter === 'insights') return n.severity === 'info' || n.severity === 'success';
    return true;
  });

  const getSeverityBadge = (severity: NotificationItem['severity']) => {
    switch (severity) {
      case 'danger':
        return <span className="w-2 h-2 rounded-full bg-red-500" />;
      case 'warning':
        return <span className="w-2 h-2 rounded-full bg-amber-500" />;
      case 'success':
        return <span className="w-2 h-2 rounded-full bg-teal-500" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shadow-2xs focus:outline-none"
        title="Notifications"
        aria-label="Notifications"
      >
        <span className="text-sm">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white border border-slate-100 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-[#10172d]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-[#0d9488] text-xs font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-slate-400 hover:text-[#10172d] transition-colors"
              >
                Mark read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-100 text-xs font-medium text-slate-500 px-4 pt-2 gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`pb-2 border-b-2 transition-colors ${
                filter === 'all' ? 'border-[#10172d] text-[#10172d] font-bold' : 'border-transparent hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('alerts')}
              className={`pb-2 border-b-2 transition-colors ${
                filter === 'alerts' ? 'border-[#10172d] text-[#10172d] font-bold' : 'border-transparent hover:text-slate-800'
              }`}
            >
              Alerts
            </button>
            <button
              onClick={() => setFilter('insights')}
              className={`pb-2 border-b-2 transition-colors ${
                filter === 'insights' ? 'border-[#10172d] text-[#10172d] font-bold' : 'border-transparent hover:text-slate-800'
              }`}
            >
              Insights
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No notifications to display.
              </div>
            ) : (
              filteredList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex items-start gap-3"
                >
                  <div className="mt-1 flex-shrink-0">{getSeverityBadge(item.severity)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <p className="text-xs font-semibold text-[#10172d] truncate">{item.title}</p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
