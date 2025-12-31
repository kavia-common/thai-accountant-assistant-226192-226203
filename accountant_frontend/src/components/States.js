import React from "react";

/**
 * PUBLIC_INTERFACE
 * Loading skeleton block.
 */
export function LoadingBlock({ lines = 3 }) {
  return (
    <div style={{ padding: 16 }}>
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className="skeleton"
          style={{ height: 14, marginBottom: 10, width: `${90 - idx * 8}%` }}
        />
      ))}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Inline error notice.
 */
export function ErrorNotice({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="notice noticeError" role="alert">
      <div style={{ fontWeight: 850, marginBottom: 4 }}>{title}</div>
      <div style={{ opacity: 0.95 }}>{message || "Please try again."}</div>
      {onRetry ? (
        <div style={{ marginTop: 10 }}>
          <button className="btn btnSm" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Empty state.
 */
export function EmptyState({ title = "No results", message = "Try adjusting your filters." }) {
  return (
    <div className="emptyState">
      <div style={{ fontWeight: 900, color: "#374151" }}>{title}</div>
      <div style={{ marginTop: 6 }}>{message}</div>
    </div>
  );
}
