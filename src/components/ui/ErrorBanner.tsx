import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  /** Optional retry callback — renders a Retry button when provided. */
  onRetry?: () => void;
}

/**
 * Displays an error message with an optional retry button.
 * Use inside any page or component that performs a fetch.
 */
export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="error-banner" role="alert">
      <AlertCircle size={16} aria-hidden="true" />
      <span className="error-banner__message">{message}</span>
      {onRetry && (
        <button
          type="button"
          className="error-banner__retry"
          onClick={onRetry}
          aria-label="Retry loading data"
        >
          <RefreshCw size={13} />
          Retry
        </button>
      )}
    </div>
  );
}
