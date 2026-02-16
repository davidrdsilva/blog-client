"use client";

import Image from "next/image";
import { useTheme } from "@/app/providers/theme-provider";
import NavBar from "./navbar";

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
    const { theme } = useTheme();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <NavBar />
            <div
                className={`flex flex-col items-center justify-center min-h-[400px] w-full p-8 ${className}`}
            >
                <div className="text-center max-w-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-center text-red-500 mx-auto mb-6">
                        <Image
                            src="/icons/broken.svg"
                            alt="Broken"
                            style={{
                                filter: theme === "dark" ? "invert(1)" : "invert(0)",
                            }}
                            width={64}
                            height={64}
                        />
                    </div>
                    <h2 className="text-4xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
                        Oops!
                    </h2>
                    <p className="text-lg leading-7 text-zinc-600 dark:text-zinc-400 mb-8">
                        {message}
                    </p>
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
        </div>
    );
}
