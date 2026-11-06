import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Eye, EyeOff, Loader2, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(formData.email.trim(), formData.password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message && (err.message.includes('Network Error') || err.code === 'ERR_NETWORK')) {
        setError('Unable to reach server. Please check your internet connection or backend status.');
      } else {
        setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Demo auto-fill helper
  const handleQuickDemo = () => {
    setFormData({
      email: 'demo.student@hostel.edu',
      password: 'password123',
    });
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4 selection:bg-brand-purple selection:text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-purple/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-purpleDark to-brand-purple flex items-center justify-center shadow-soft-purple">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-text-main">
              Hostel<span className="text-brand-purple">Expense</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-text-main mt-4">Welcome Back</h2>
          <p className="text-xs text-text-secondary mt-1">
            Log in to manage your daily hostel budget & expenses
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-xs text-status-danger flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="student@hostel.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-main placeholder-text-muted focus:outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl pl-10 pr-11 py-2.5 text-sm text-text-main placeholder-text-muted focus:outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-main transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-brand-purple hover:bg-brand-purpleDark disabled:opacity-50 text-white text-xs font-bold shadow-soft-purple flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="mt-5 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2 px-3 rounded-xl bg-bg-cardHover border border-border-subtle hover:border-brand-purple/40 text-[11px] font-semibold text-brand-purpleLight flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Fill Demo Credentials
            </button>
          </div>
        </div>

        {/* Register Footer Link */}
        <p className="text-center text-xs text-text-secondary mt-6">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-brand-purpleLight hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

