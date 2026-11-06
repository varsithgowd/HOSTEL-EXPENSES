import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Receipt,
  PiggyBank,
  PieChart,
  Target,
  Bot,
  ShieldCheck,
  BellRing,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-bg-main text-text-main selection:bg-brand-purple selection:text-white flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-bg-main/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-purpleDark to-brand-purple flex items-center justify-center shadow-soft-purple">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Hostel<span className="text-brand-purple">Expense</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white text-xs font-bold shadow-soft-purple transition flex items-center gap-1.5"
              >
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-text-secondary hover:text-text-main transition px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white text-xs font-bold shadow-soft-purple transition flex items-center gap-1.5"
                >
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-6">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-purple/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purpleLight text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Built Specifically for Indian College & Hostel Students
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-main leading-tight sm:leading-none">
            Master your hostel pocket money.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-purpleLight">
              Never go broke
            </span>{' '}
            before month-end.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Track daily canteen bills, UPI splurges, and mess extras. Set daily & monthly spending limits, receive automated threshold alerts, and reach your savings goals.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white text-sm font-bold shadow-soft-purple transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{isAuthenticated ? 'Open Dashboard' : 'Start Tracking Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-bg-card hover:bg-bg-cardHover border border-border-accent text-text-main text-sm font-semibold transition"
            >
              Live Demo Login
            </Link>
          </div>

          {/* Quick Stats Badges */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-bg-card/70 border border-border-subtle">
              <p className="text-2xl font-bold text-brand-purpleLight">₹0 Fee</p>
              <p className="text-xs text-text-muted mt-0.5">100% Free for students</p>
            </div>
            <div className="p-4 rounded-xl bg-bg-card/70 border border-border-subtle">
              <p className="text-2xl font-bold text-status-success">70% & 90%</p>
              <p className="text-xs text-text-muted mt-0.5">Smart budget alerts</p>
            </div>
            <div className="p-4 rounded-xl bg-bg-card/70 border border-border-subtle">
              <p className="text-2xl font-bold text-blue-400">UPI & Cash</p>
              <p className="text-xs text-text-muted mt-0.5">All payment modes</p>
            </div>
            <div className="p-4 rounded-xl bg-bg-card/70 border border-border-subtle">
              <p className="text-2xl font-bold text-brand-purple">AI Mentor</p>
              <p className="text-xs text-text-muted mt-0.5">Hostel spending tips</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 px-6 bg-bg-sidebar/50 border-t border-b border-border-subtle">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-main">
              Everything a hostel student needs in one place
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Designed around how real university students spend, split, and save.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-purple/15 text-brand-purple flex items-center justify-center mb-4">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-text-main mb-2">
                  Daily Expense Tracking
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Log mess snacks, stationery, auto shares, and Swiggy deliveries in seconds. Categorize with UPI, cash, or card tags with instant search & filters.
                </p>
              </div>
              <ul className="mt-6 space-y-2 text-xs text-text-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>8 tailored hostel categories</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>Instant search, sort & pagination</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-status-warning/15 text-status-warning flex items-center justify-center mb-4">
                  <BellRing className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-text-main mb-2">
                  Smart Budget Guardrails
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Set daily caps (e.g. ₹300) and monthly pocket money budgets (e.g. ₹8,000). Receive real warnings at 70%, 90%, and 100% threshold limits.
                </p>
              </div>
              <ul className="mt-6 space-y-2 text-xs text-text-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>70% warning & 90% critical alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>Remaining budget countdown</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4">
                  <PieChart className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-text-main mb-2">
                  Deep Visual Analytics
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Interactive pie charts, daily spending bar graphs, and monthly trends powered by Recharts. Know exactly where your money leaked.
                </p>
              </div>
              <ul className="mt-6 space-y-2 text-xs text-text-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>Category percentage breakdown</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>Month-over-month comparison</span>
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-status-success/15 text-status-success flex items-center justify-center mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-text-main mb-2">
                  Student Savings Goals
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Saving up for a semester guitar, new headphones, or a trip home? Create goals, log contributions, and track progress visually.
                </p>
              </div>
              <ul className="mt-6 space-y-2 text-xs text-text-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>Visual progress bars</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>Goal achievement celebrations</span>
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-text-main mb-2">
                  AI Spending Assistant
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Ask questions like "Why am I spending so much this month?" and receive personalized advice grounded strictly in your real logged expenses.
                </p>
              </div>
              <ul className="mt-6 space-y-2 text-xs text-text-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>Context-aware Gemini AI</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>Empathetic student senior persona</span>
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-text-main mb-2">
                  100% Private & Secure
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Industry-grade bcrypt password encryption, JWT authentication, and user data isolation. Your financial logs are strictly your own.
                </p>
              </div>
              <ul className="mt-6 space-y-2 text-xs text-text-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>Strict JWT user isolation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  <span>Export data to CSV anytime</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-tr from-brand-purpleDark/80 via-bg-card to-bg-card border border-brand-purple/40 p-8 sm:p-12 text-center shadow-2xl relative">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main">
            Ready to take control of your hostel finances?
          </h2>
          <p className="mt-3 text-sm text-text-secondary max-w-xl mx-auto">
            Join students who track every rupee and save for things that matter.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white text-sm font-bold shadow-soft-purple transition active:scale-95 flex items-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border-subtle py-8 px-6 text-center text-xs text-text-muted">
        <p>© 2026 Hostel Expense Tracker — Designed with 💜 for University Students</p>
        <p className="mt-1">Currency: Indian Rupee (₹) • Timezone: Asia/Kolkata</p>
      </footer>
    </div>
  );
};

export default LandingPage;
