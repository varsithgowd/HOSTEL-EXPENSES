import React, { useState, useRef, useEffect } from 'react';
import { Menu, Plus, Bell, CheckCheck, X, Sparkles, AlertTriangle, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatRelativeDate } from '../utils/formatters';

export const Navbar = ({ onOpenAddExpense, setMobileOpen }) => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    browserPermission,
    requestBrowserPermission,
  } = useNotifications();
  const [showBellMenu, setShowBellMenu] = useState(false);
  const bellRef = useRef(null);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowBellMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'exceeded':
      case 'danger':
        return <AlertCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />;
      case 'goal_reached':
        return <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-bg-main/90 backdrop-blur-md border-b border-border-subtle px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger + greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-xl text-text-secondary hover:text-text-main hover:bg-bg-card transition"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-text-main hidden sm:block">
            Welcome back, <span className="text-brand-purpleLight">{user?.name?.split(' ')[0] || 'Student'}</span> 👋
          </h2>
          <p className="text-[11px] text-text-muted hidden sm:block">
            Monitor and control your daily hostel spending
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Expense Button */}
        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white text-xs font-semibold shadow-soft-purple transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setShowBellMenu((prev) => !prev)}
            className="relative p-2.5 rounded-xl bg-bg-card border border-border-subtle hover:border-border-accent text-text-secondary hover:text-text-main transition"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-status-danger text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showBellMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-bg-card border border-border-accent shadow-2xl z-50 overflow-hidden">
              <div className="p-3.5 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-main">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-purpleLight text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-brand-purpleLight hover:text-brand-purple flex items-center gap-1 transition"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Browser Permission Banner */}
              {browserPermission !== 'granted' && (
                <div className="p-3 bg-brand-purple/10 border-b border-border-subtle flex items-center justify-between text-xs">
                  <span className="text-[11px] text-text-secondary">Get real-time desktop budget alerts</span>
                  <button
                    onClick={requestBrowserPermission}
                    className="px-2.5 py-1 rounded-lg bg-brand-purple text-white text-[10px] font-bold hover:bg-brand-purpleDark transition shadow-sm"
                  >
                    Enable
                  </button>
                </div>
              )}

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-text-muted text-xs">
                    <Sparkles className="w-6 h-6 mx-auto mb-2 text-brand-purple/50" />
                    No notifications yet. You're doing great!
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => !item.isRead && markAsRead(item._id)}
                      className={`p-3.5 flex items-start justify-between gap-3 transition cursor-pointer ${
                        item.isRead ? 'opacity-70 bg-transparent' : 'bg-brand-purple/5'
                      } hover:bg-bg-cardHover`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        {getAlertIcon(item.type)}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-text-main leading-snug">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                            {item.message}
                          </p>
                          <span className="text-[10px] text-text-muted mt-1 block">
                            {formatRelativeDate(item.createdAt)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(item._id);
                        }}
                        className="p-1 rounded text-text-muted hover:text-status-danger transition"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

