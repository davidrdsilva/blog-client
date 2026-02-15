"use client";

interface ApiErrorProps {
    /**
     * Optional custom message to display
     */
    message?: string;
    /**
     * Optional callback for a retry action
     */
    onRetry?: () => void;
    /**
     * Whether to show the retry button
     */
    showRetry?: boolean;
    /**
     * Optional CSS class name for custom styling
     */
    className?: string;
}

export default function ApiError({
    message = "Hey, ugh, something went very wrong on our back-end. Maybe come back another time?",
    onRetry,
    showRetry = false,
    className = "",
}: ApiErrorProps) {
    return (
        <div
            className={`flex flex-col items-center justify-center min-h-[400px] w-full p-8 ${className}`}
        >
            <div className="text-center max-w-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-center text-red-500 mx-auto mb-6">
                    <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        role="img"
                        aria-labelledby="error-icon-title"
                    >
                        <title id="error-icon-title">Error Icon</title>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h2 className="text-4xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Oops!</h2>
                <p className="text-lg leading-7 text-zinc-600 dark:text-zinc-400 mb-8">{message}</p>
                {showRetry && onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="px-6 py-3 rounded-lg bg-blue-500 text-white font-medium transition-all duration-200 hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] active:translate-y-0"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}
