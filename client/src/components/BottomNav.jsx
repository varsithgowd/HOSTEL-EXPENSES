import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  PieChart,
  MoreHorizontal,
  Target,
  Bot,
  Bell,
  LogOut,
  User,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const BottomNav = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef(null);

  // Close more menu on route change
  useEffect(() => {
    setShowMoreMenu(false);
  }, [location.pathname]);

  // Close more menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  const handleLogout = () => {
    setShowMoreMenu(false);
    logout();
    navigate('/login');
  };

  const isMoreActive =
    location.pathname === '/savings' || location.pathname === '/ai-assistant';

  return (
    <>
      {/* More Menu Backdrop on Mobile */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={() => setShowMoreMenu(false)}
        />
      )}

      {/* More Menu Drawer / Sheet */}
      {showMoreMenu && (
        <div
          ref={menuRef}
          className="fixed bottom-16 left-0 right-0 z-50 bg-bg-card border-t border-border-accent rounded-t-3xl shadow-2xl p-5 md:hidden animate-slideUp space-y-4 max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-xs font-bold text-brand-purpleLight">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-text-main truncate">
                  {user?.name || 'Student'}
                </p>
                <p className="text-[11px] text-text-muted truncate">
                  {user?.email || 'student@hostel.edu'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowMoreMenu(false)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-main transition"
              aria-label="Close more menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Menu Items */}
          <div className="space-y-1 text-xs">
            <NavLink
              to="/savings"
              onClick={() => setShowMoreMenu(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                  isActive
                    ? 'bg-brand-purple text-white font-bold shadow-soft-purple'
                    : 'text-text-secondary hover:text-text-main hover:bg-bg-cardHover'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-status-success" />
                <span>Savings Goals</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </NavLink>

            <NavLink
              to="/ai-assistant"
              onClick={() => setShowMoreMenu(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                  isActive
                    ? 'bg-brand-purple text-white font-bold shadow-soft-purple'
                    : 'text-text-secondary hover:text-text-main hover:bg-bg-cardHover'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Bot className="w-4 h-4 text-brand-purpleLight" />
                <div className="flex items-center gap-1.5">
                  <span>AI Assistant</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-brand-purple/20 text-brand-purpleLight text-[9px] font-bold">
                    AI
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </NavLink>
          </div>

          {/* Logout Action */}
          <div className="pt-2 border-t border-border-subtle">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-status-danger/10 hover:bg-status-danger/20 text-status-danger text-xs font-bold transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-bg-sidebar/95 backdrop-blur-lg border-t border-border-subtle md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.5)] safe-area-bottom"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-1">
          {/* Home / Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? 'text-brand-purpleLight font-bold'
                  : 'text-text-muted hover:text-text-secondary'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Home</span>
          </NavLink>

          {/* Expenses */}
          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? 'text-brand-purpleLight font-bold'
                  : 'text-text-muted hover:text-text-secondary'
              }`
            }
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Expenses</span>
          </NavLink>

          {/* Budget */}
          <NavLink
            to="/budget"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? 'text-brand-purpleLight font-bold'
                  : 'text-text-muted hover:text-text-secondary'
              }`
            }
          >
            <PiggyBank className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Budget</span>
          </NavLink>

          {/* Analytics */}
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? 'text-brand-purpleLight font-bold'
                  : 'text-text-muted hover:text-text-secondary'
              }`
            }
          >
            <PieChart className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Analytics</span>
          </NavLink>

          {/* More Menu Toggle */}
          <button
            onClick={() => setShowMoreMenu((prev) => !prev)}
            className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
              showMoreMenu || isMoreActive
                ? 'text-brand-purpleLight font-bold'
                : 'text-text-muted hover:text-text-secondary'
            }`}
            aria-label="Open more menu"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">More</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-status-danger animate-pulse" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;

