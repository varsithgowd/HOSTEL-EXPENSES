import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'purple',
  badge,
  progress,
}) => {
  const colorMap = {
    purple: {
      border: 'hover:border-brand-purple/40',
      iconBg: 'bg-brand-purple/15 text-brand-purpleLight',
      glow: 'shadow-[0_0_20px_-5px_rgba(139,92,246,0.2)]',
    },
    green: {
      border: 'hover:border-status-success/40',
      iconBg: 'bg-status-success/15 text-status-success',
      glow: 'shadow-[0_0_20px_-5px_rgba(34,197,94,0.2)]',
    },
    yellow: {
      border: 'hover:border-status-warning/40',
      iconBg: 'bg-status-warning/15 text-status-warning',
      glow: 'shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]',
    },
    red: {
      border: 'hover:border-status-danger/40',
      iconBg: 'bg-status-danger/15 text-status-danger',
      glow: 'shadow-[0_0_20px_-5px_rgba(239,68,68,0.2)]',
    },
    blue: {
      border: 'hover:border-blue-500/40',
      iconBg: 'bg-blue-500/15 text-blue-400',
      glow: 'shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]',
    },
  };

  const scheme = colorMap[color] || colorMap.purple;

  return (
    <div
      className={`glass-card p-5 relative overflow-hidden transition-all duration-300 ${scheme.border} hover:-translate-y-0.5 hover:${scheme.glow}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
            {title}
          </p>
          <h3 className="text-2xl font-extrabold text-text-main mt-1 tracking-tight">
            {value}
          </h3>
        </div>

        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${scheme.iconBg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      {/* Optional Progress Bar */}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="w-full h-2 rounded-full bg-bg-main overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress >= 100
                  ? 'bg-status-danger'
                  : progress >= 70
                  ? 'bg-status-warning'
                  : 'bg-brand-purple'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtitle / Badge info */}
      <div className="mt-3 flex items-center justify-between text-xs">
        {subtitle && <span className="text-text-muted">{subtitle}</span>}
        {badge && (
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${badge.className || 'bg-bg-cardHover text-text-secondary'}`}
          >
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
