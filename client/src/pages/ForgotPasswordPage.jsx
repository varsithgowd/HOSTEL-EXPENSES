import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Mail, ArrowLeft, Loader2, CheckCircle2, Sparkles, Send } from 'lucide-react';
import api from '../services/api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      if (res.data.success) {
        setSuccessMessage(
          res.data.message ||
            'If an account exists with that email, a password reset link has been sent.'
        );
      } else {
        setError(res.data.message || 'Unable to process request.');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message && (err.message.includes('Network Error') || err.code === 'ERR_NETWORK')) {
        setError('Unable to reach server. Please check your internet connection.');
      } else {
        setError('Failed to send reset link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4 selection:bg-brand-purple selection:text-white relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-purple/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-purpleDark to-brand-purple flex items-center justify-center shadow-soft-purple">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="text-xl font-extrabold tracking-tight text-text-main block">
                Hostel<span className="text-brand-purple">Expense</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">
                Student Finance
              </span>
            </div>
          </Link>
        </div>

        {/* Form Container */}
        <div className="glass-card p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-text-main tracking-tight">
              Reset your password
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Enter your registered email address and we'll send you a secure link to reset your password.
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-status-success/10 border border-status-success/30 text-xs text-status-success flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-status-success" />
              <div>
                <p className="font-bold text-status-success">Check your inbox</p>
                <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                  {successMessage} The reset link will expire in <strong>15 minutes</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-xs text-status-danger flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {!successMessage ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="student@hostel.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-main placeholder-text-muted focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-brand-purple hover:bg-brand-purpleDark disabled:opacity-50 text-white text-xs font-bold shadow-soft-purple flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSuccessMessage('');
                  setEmail('');
                }}
                className="w-full py-2.5 rounded-xl border border-border-subtle hover:bg-bg-cardHover text-xs font-semibold text-text-secondary hover:text-text-main transition"
              >
                Send to a different email
              </button>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 pt-5 border-t border-border-subtle text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-brand-purpleLight hover:underline font-semibold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
