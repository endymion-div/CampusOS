import React from 'react';
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Calendar,
  CheckCheck,
  Clock,
  GraduationCap,
  X,
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import type { CampusNotification } from '../types/campus';

function categoryIcon(cat: CampusNotification['category']) {
  switch (cat) {
    case 'attendance':
      return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    case 'assignment':
      return <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    case 'exam':
      return <GraduationCap className="w-4 h-4 text-red-600 dark:text-red-400" />;
    case 'class':
      return <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    case 'event':
      return <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />;
    default:
      return <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />;
  }
}

export const NotificationDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveSection,
  } = useCampus();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-[1px]" role="dialog" aria-modal="true" aria-label="Notification Center">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <aside className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-xl">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Notification Center</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
              {unreadNotificationCount} unread alerts across academics & events
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadNotificationCount > 0 ? (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1 whitespace-nowrap"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              All clear. No pending alerts based on your notification preferences.
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  markNotificationRead(n.id);
                  setActiveSection(n.targetSection);
                  onClose();
                }}
                className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-start gap-3 ${
                  !n.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  {categoryIcon(n.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {n.title}
                    </p>
                    {!n.read ? (
                      <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 shrink-0">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                    {n.timestamp} · Open {n.targetSection}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>
    </div>
  );
};
