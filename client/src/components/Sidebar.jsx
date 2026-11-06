import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  PieChart,
  Target,
  Bot,
  LogOut,
  X,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', path: '/expenses', icon: Receipt },
  { name: 'Budget', path: '/budget', icon: PiggyBank },
  { name: 'Analytics', path: '/analytics', icon: PieChart },
  { name: 'Savings Goals', path: '/savings', icon: Target },
  { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
];

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-bg-sidebar border-r border-border-subtle flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo / Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purpleDark to-brand-purple flex items-center justify-center shadow-soft-purple">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-text-main leading-tight">
                  Hostel<span className="text-brand-purple">Expense</span>
                </h1>
                <p className="text-[11px] text-text-muted font-medium">Student Finance</p>
              </div>
            </div>
            {/* Close Button on Mobile */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-text-secondary hover:text-text-main hover:bg-bg-card transition"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-purple text-white shadow-soft-purple font-semibold'
                        : 'text-text-secondary hover:text-text-main hover:bg-bg-card'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout Bottom */}
        <div className="p-4 border-t border-border-subtle">
          <div className="p-3 rounded-xl bg-bg-card/70 border border-border-subtle/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-xs font-bold text-brand-purpleLight shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text-main truncate">
                  {user?.name || 'Student'}
                </p>
                <p className="text-[11px] text-text-muted truncate">
                  {user?.email || 'student@hostel.edu'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 rounded-lg text-text-secondary hover:text-status-danger hover:bg-status-danger/10 transition shrink-0 ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

