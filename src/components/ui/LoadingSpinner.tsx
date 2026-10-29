interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label = "Loading" }: LoadingSpinnerProps) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
