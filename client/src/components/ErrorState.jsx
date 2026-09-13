import { AlertTriangle } from "lucide-react";

const ErrorState = ({ message = "Something went wrong. Please try again.", onRetry }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4">
    <div className="p-4 rounded-full bg-red-50 text-red-500 mb-4">
      <AlertTriangle size={28} />
    </div>
    <h3 className="font-semibold text-ink-800 text-lg">Something went wrong</h3>
    <p className="text-ink-500 text-sm mt-1 max-w-sm">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-outline mt-4">
        Try again
      </button>
    )}
  </div>
);

export default ErrorState;
