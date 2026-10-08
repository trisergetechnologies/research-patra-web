import React from 'react';

export function Skeleton({ className = '' }) {
  return <span className={`block animate-pulse rounded bg-soft ${className}`} />;
}

export function EmptyState({ icon: Icon, title, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-14 text-center ${className}`}>
      {Icon && (
        <span className="w-11 h-11 rounded-full bg-soft flex items-center justify-center text-muted">
          <Icon className="w-5 h-5" />
        </span>
      )}
      <p className="text-sm text-muted">{title}</p>
      {action}
    </div>
  );
}

export function PageHeader({ title, info, actions, children }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          {title}
          {info}
        </h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
      <span>{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">
          Retry
        </button>
      )}
    </div>
  );
}
