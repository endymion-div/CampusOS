import React, { useState } from 'react';
import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckSquare,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import type { NavSection } from '../types/campus';
import { NotificationDrawer } from './NotificationDrawer';
import { SafeImage } from './ui/CommonUI';

interface NavItem {
  id: NavSection;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'timetable', label: 'Timetable', icon: <CalendarDays className="w-4 h-4" /> },
  { id: 'attendance', label: 'Attendance', icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'assignments', label: 'Assignments', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'exams', label: 'Exams', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'cgpa', label: 'CGPA', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'planner', label: 'Study Planner', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'assistant', label: 'AI Assistant', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
  { id: 'clubs', label: 'Clubs', icon: <Users className="w-4 h-4" /> },
  { id: 'lost-found', label: 'Lost & Found', icon: <MapPin className="w-4 h-4" /> },
  { id: 'resources', label: 'Resources', icon: <FolderOpen className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

const MOBILE_BOTTOM_NAV: NavSection[] = ['dashboard', 'timetable', 'attendance', 'assignments', 'assistant'];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    state,
    theme,
    toggleTheme,
    activeSection,
    setActiveSection,
    unreadNotificationCount,
  } = useCampus();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const activeItem = NAV_ITEMS.find((i) => i.id === activeSection) ?? NAV_ITEMS[0];

  const filteredNavItems = navSearch.trim()
    ? NAV_ITEMS.filter((i) => i.label.toLowerCase().includes(navSearch.toLowerCase()))
    : NAV_ITEMS;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSection('dashboard')}
            className="text-lg font-display font-bold tracking-tight text-slate-950 dark:text-white whitespace-nowrap"
          >
            CampusOS
          </button>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Sem {state.profile.semester}
          </span>
        </div>

        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Jump to module..."
              aria-label="Filter navigation modules"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Primary Sidebar">
          {filteredNavItems.map((item) => {
            const isActive = item.id === activeSection;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSection('settings')}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <SafeImage
              src={state.profile.avatarUrl}
              alt={state.profile.name}
              className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {state.profile.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {state.profile.course}
              </p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                CampusOS · {state.profile.university}
              </p>
              <h1 className="text-sm sm:text-base font-display font-semibold text-slate-950 dark:text-white truncate">
                {activeItem.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setNotifOpen(true)}
              aria-label={`Open notifications (${unreadNotificationCount} unread)`}
              className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-mono font-semibold flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('settings')}
              className="hidden sm:flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <SafeImage
                src={state.profile.avatarUrl}
                alt={state.profile.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                {state.profile.name}
              </span>
            </button>
          </div>
        </header>

        {/* Active View Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Collapsible Navigation Drawer */}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <div className="fixed inset-0 bg-slate-950/50" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
          <div className="relative z-10 w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full border-r border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <span className="font-display font-bold text-slate-950 dark:text-white">CampusOS</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = item.id === activeSection;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}

      {/* Mobile Bottom Navigation Bar (5 compact actions, <= 56px height) */}
      <nav
        aria-label="Mobile Quick Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5"
      >
        {MOBILE_BOTTOM_NAV.map((id) => {
          const item = NAV_ITEMS.find((n) => n.id === id)!;
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {item.icon}
              <span className="truncate max-w-[64px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
};
