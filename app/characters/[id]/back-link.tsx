"use client";

import { useRouter } from "next/navigation";

interface BackLinkProps {
    fallbackHref: string;
    label?: string;
}

export default function BackLink({ fallbackHref, label = "Back" }: BackLinkProps) {
    const router = useRouter();

    const handleClick = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
            return;
        }
        router.push(fallbackHref);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.4em] text-white/60 hover:text-white transition-colors mb-8 cursor-pointer"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-x-1"
            >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
            </svg>
            {label}
        </button>
    );
}
