import React from 'react';
import { AlertCircle, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AlertBanner = ({ alert, onDismiss }) => {
  if (!alert) return null;

  const isExceeded = alert.type === 'exceeded';
  const isDanger = alert.type === 'danger';
  const isWarning = alert.type === 'warning';

  let bgStyles = 'bg-status-warning/10 border-status-warning/30 text-status-warning';
  let Icon = AlertTriangle;

  if (isExceeded || isDanger) {
    bgStyles = 'bg-status-danger/10 border-status-danger/30 text-status-danger';
    Icon = AlertCircle;
  }

  return (
    <div
      className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-lg transition-all ${bgStyles}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold tracking-tight text-text-main">
            {alert.title}
          </h4>
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
            {alert.message}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <Link
              to="/budget"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-text-main hover:underline"
            >
              Adjust Budget Limits <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-text-muted hover:text-text-main transition"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
