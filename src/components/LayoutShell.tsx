import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  ChevronDown,
  Compass,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Search,
  Settings,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { AppNotification, PageId, User } from '../types/unispace';

interface NavItem {
  id: PageId | 'usage-analytics';
  label: string;
  Icon: typeof LayoutDashboard;
}

interface LayoutShellProps {
  user: User;
  activePage: PageId;
  pageTitle: string;
  notifications: AppNotification[];
  onNavigate: (page: PageId, options?: { focusAnalytics?: boolean }) => void;
  onQuickSearch?: () => void;
  onOpenQrScanner?: () => void;
  onMarkAllNotificationsRead: () => void;
  onLogout: () => void;
  children: ReactNode;
}

export function LayoutShell({
  user,
  activePage,
  pageTitle,
  notifications,
  onNavigate,
  onQuickSearch,
  onOpenQrScanner,
  onMarkAllNotificationsRead,
  onLogout,
  children,
}: LayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [analyticsHighlight, setAnalyticsHighlight] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const userNotifications = notifications.filter(
    (n) => n.userId === user.id || n.userId === 'ALL'
  );
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const navItems: NavItem[] =
    user.role === 'Administrator'
      ? [
          { id: 'admin-dashboard', label: 'Overview', Icon: LayoutDashboard },
          { id: 'manage-spaces', label: 'Study Spaces', Icon: Building2 },
          {
            id: 'manage-reservations',
            label: 'Reservations',
            Icon: CalendarCheck,
          },
          { id: 'manage-users', label: 'People', Icon: Users },
          { id: 'usage-analytics', label: 'Analytics', Icon: BarChart3 },
          { id: 'profile', label: 'Profile', Icon: UserIcon },
          { id: 'settings', label: 'Settings', Icon: Settings },
        ]
      : [
          {
            id:
              user.role === 'Lecturer'
                ? 'lecturer-dashboard'
                : 'student-dashboard',
            label: 'Home',
            Icon: LayoutDashboard,
          },
          { id: 'discover-spaces', label: 'Discover Spaces', Icon: Compass },
          {
            id: 'my-reservations',
            label: 'My Reservations',
            Icon: CalendarCheck,
          },
          { id: 'profile', label: 'Profile', Icon: UserIcon },
          { id: 'settings', label: 'Settings', Icon: Settings },
        ];

  const handleNavClick = (item: NavItem) => {
    setSidebarOpen(false);
    if (item.id === 'usage-analytics') {
      setAnalyticsHighlight(true);
      onNavigate('admin-dashboard', { focusAnalytics: true });
    } else {
      setAnalyticsHighlight(false);
      onNavigate(item.id);
    }
  };

  const initials = user.fullName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full liquid-glass rounded-[28px] overflow-hidden">
      <div className="px-5 py-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            onNavigate(
              user.role === 'Administrator'
                ? 'admin-dashboard'
                : user.role === 'Lecturer'
                ? 'lecturer-dashboard'
                : 'student-dashboard'
            )
          }
          className="flex items-center gap-3 text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#007AFF] flex items-center justify-center shrink-0 shadow-[0_6px_16px_rgba(0,122,255,0.28)]">
            <Building2 className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <span className="font-display text-lg font-bold text-black tracking-tight block leading-none">
              UniSpace
            </span>
            <span className="text-[11px] text-black block mt-1">
              APU Campus
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation menu"
          className="lg:hidden p-1.5 rounded-full text-black hover:text-black hover:bg-slate-900/5 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav
        aria-label="Primary Sidebar Navigation"
        className="flex-1 px-3 py-2 space-y-1 overflow-y-auto"
      >
        {navItems.map((item) => {
          const isUsageAnalyticsActive =
            item.id === 'usage-analytics' &&
            activePage === 'admin-dashboard' &&
            analyticsHighlight;
          const isDirectActive =
            item.id !== 'usage-analytics' &&
            activePage === item.id &&
            !(item.id === 'admin-dashboard' && analyticsHighlight);
          const isActive = isDirectActive || isUsageAnalyticsActive;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#007AFF] text-white shadow-[0_6px_18px_rgba(0,122,255,0.28)]'
                  : 'text-black hover:text-black hover:bg-slate-900/[0.05]'
              }`}
            >
              <item.Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {onOpenQrScanner && user.role !== 'Administrator' && (
          <button
            type="button"
            onClick={() => {
              setSidebarOpen(false);
              onOpenQrScanner();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-[#007AFF] bg-[#007AFF]/[0.08] hover:bg-[#007AFF]/[0.14] transition-all cursor-pointer whitespace-nowrap mt-2"
          >
            <QrCode className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Scan Room QR</span>
          </button>
        )}
      </nav>

      <div className="p-3 border-t border-slate-900/[0.06]">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-black hover:text-[#E53935] hover:bg-[#E53935]/[0.07] transition-colors cursor-pointer whitespace-nowrap"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative flex bg-white text-black">
      {/* Floating Desktop Glass Rail */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen p-3.5 pr-1 z-20">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex p-3">
          <div
            className="fixed inset-0 bg-slate-950/35 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-64 max-w-[82vw] h-full z-10">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        {/* Floating Liquid Glass Top Capsule */}
        <header className="sticky top-3 z-30 mx-3.5 sm:mx-6 lg:mx-8 mt-3.5">
          <div className="liquid-glass rounded-[22px] px-4 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 rounded-full text-black hover:bg-slate-900/[0.06] cursor-pointer shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <h1 className="font-display text-base sm:text-lg font-bold text-black truncate">
                  {pageTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onQuickSearch && (
                <button
                  type="button"
                  onClick={onQuickSearch}
                  aria-label="Quick search study spaces"
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/[0.05] text-xs font-medium text-black hover:text-black hover:bg-slate-900/[0.08] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Search spaces</span>
                </button>
              )}

              {/* Notifications Popover */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen((prev) => !prev);
                    setProfileMenuOpen(false);
                  }}
                  aria-label={`Notifications (${unreadCount} unread)`}
                  aria-expanded={notifOpen}
                  className="relative p-2.5 rounded-full bg-slate-900/[0.06] border border-slate-900/[0.08] text-black hover:bg-slate-900/[0.10] transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#007AFF] ring-2 ring-white text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <>
                    <div
                      className="fixed inset-0 bg-black/25 -z-10 sm:hidden"
                      onClick={() => setNotifOpen(false)}
                      aria-hidden="true"
                    />
                    <div
                      role="region"
                      aria-label="Notifications"
                      className="fixed inset-x-3 top-20 sm:inset-x-auto sm:top-auto sm:absolute sm:right-0 sm:mt-2.5 sm:w-80 bg-white border border-slate-200 shadow-[0_24px_60px_rgba(15,23,42,0.22)] rounded-3xl z-40 overflow-hidden"
                    >
                      <div className="px-4 py-3.5 border-b border-slate-900/[0.08] flex items-center justify-between gap-2 bg-white">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-sm font-bold text-black">
                            Notifications
                          </span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-[#007AFF]/12 text-[#007AFF] text-[11px] font-semibold tabular-nums">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={onMarkAllNotificationsRead}
                              className="text-xs font-semibold text-[#007AFF] hover:underline cursor-pointer whitespace-nowrap"
                            >
                              Mark all read
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setNotifOpen(false)}
                            aria-label="Close notifications"
                            className="sm:hidden p-1 rounded-full text-black hover:bg-slate-900/[0.06] cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-[60vh] sm:max-h-72 overflow-y-auto divide-y divide-slate-900/[0.06]">
                        {userNotifications.length === 0 ? (
                          <p className="p-5 text-xs text-black text-center">
                            You are all caught up.
                          </p>
                        ) : (
                          userNotifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-4 text-left ${
                                n.read ? 'bg-white' : 'bg-[#007AFF]/[0.07]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-bold text-black">
                                  {n.title}
                                </p>
                                {!n.read && (
                                  <span
                                    className="w-2 h-2 rounded-full bg-[#007AFF] shrink-0 mt-1"
                                    aria-hidden="true"
                                  />
                                )}
                              </div>
                              <p className="mt-1 text-xs text-black leading-relaxed">
                                {n.message}
                              </p>
                              <p className="mt-1.5 text-[11px] text-black/70">
                                {n.timestamp}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen((prev) => !prev);
                    setNotifOpen(false);
                  }}
                  aria-expanded={profileMenuOpen}
                  aria-label="Open user profile menu"
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full hover:bg-slate-900/[0.05] transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#007AFF] text-white text-xs font-semibold flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-black leading-tight whitespace-nowrap">
                      {user.fullName}
                    </p>
                    <p className="text-[11px] text-black leading-tight whitespace-nowrap">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown
                    className="w-3.5 h-3.5 text-black shrink-0"
                    aria-hidden="true"
                  />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2.5 w-56 max-w-[calc(100vw-24px)] bg-white border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.18)] rounded-3xl z-40 py-2">
                    <div className="px-4 py-2 border-b border-slate-900/[0.06]">
                      <p className="text-xs font-semibold text-black truncate">
                        {user.fullName}
                      </p>
                      <p className="text-[11px] text-black truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onNavigate('profile');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-black hover:bg-slate-900/[0.05] flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-black" />
                      <span>Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onNavigate('settings');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-black hover:bg-slate-900/[0.05] flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-black" />
                      <span>Settings</span>
                    </button>
                    {user.role !== 'Administrator' && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onNavigate('my-reservations');
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-black hover:bg-slate-900/[0.05] flex items-center gap-2 cursor-pointer"
                      >
                        <CalendarCheck className="w-4 h-4 text-black" />
                        <span>My Reservations</span>
                      </button>
                    )}
                    <div className="my-1 border-t border-slate-900/[0.06]" />
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[#E53935] hover:bg-[#E53935]/[0.08] flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1340px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
