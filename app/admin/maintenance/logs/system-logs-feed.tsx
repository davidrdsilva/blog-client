"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { SystemLogEntry, SystemLogLevel } from "@/app/types/system-log";

interface SystemLogsFeedProps {
    initialEntries: SystemLogEntry[];
    capacity: number;
}

const LEVEL_ORDER: SystemLogLevel[] = ["ERROR", "WARN", "INFO", "DEBUG"];

const LEVEL_TONE: Record<SystemLogLevel, string> = {
    ERROR: "text-red-700 dark:text-red-400 border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/30",
    WARN: "text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30",
    INFO: "text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/30",
    DEBUG: "text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900/60",
};

const LEVEL_RAIL: Record<SystemLogLevel, string> = {
    ERROR: "bg-red-500 dark:bg-red-500",
    WARN: "bg-amber-500 dark:bg-amber-500",
    INFO: "bg-sky-500 dark:bg-sky-500",
    DEBUG: "bg-zinc-400 dark:bg-zinc-700",
};

function formatTimestamp(date: Date): { date: string; time: string } {
    if (Number.isNaN(date.getTime())) return { date: "—", time: "—" };
    const d = String(date.getUTCDate()).padStart(2, "0");
    const months = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
    ];
    const m = months[date.getUTCMonth()];
    const y = date.getUTCFullYear();
    const hh = String(date.getUTCHours()).padStart(2, "0");
    const mm = String(date.getUTCMinutes()).padStart(2, "0");
    const ss = String(date.getUTCSeconds()).padStart(2, "0");
    return { date: `${d} ${m} ${y}`, time: `${hh}:${mm}:${ss}` };
}

export default function SystemLogsFeed({ initialEntries, capacity }: SystemLogsFeedProps) {
    const router = useRouter();
    const [isRefreshing, startTransition] = useTransition();
    const [activeLevels, setActiveLevels] = useState<Set<SystemLogLevel>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");

    const counts = useMemo(() => {
        const c: Record<SystemLogLevel, number> = { ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0 };
        for (const e of initialEntries) c[e.level] += 1;
        return c;
    }, [initialEntries]);

    const filtered = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return initialEntries
            .filter((e) => activeLevels.size === 0 || activeLevels.has(e.level))
            .filter((e) => {
                if (!query) return true;
                if (e.message.toLowerCase().includes(query)) return true;
                if (e.fields) {
                    return JSON.stringify(e.fields).toLowerCase().includes(query);
                }
                return false;
            })
            .slice()
            .reverse();
    }, [initialEntries, activeLevels, searchQuery]);

    const toggleLevel = (level: SystemLogLevel) => {
        setActiveLevels((prev) => {
            const next = new Set(prev);
            if (next.has(level)) next.delete(level);
            else next.add(level);
            return next;
        });
    };

    const handleRefresh = () => {
        startTransition(() => router.refresh());
    };

    const isFiltered = activeLevels.size > 0 || searchQuery.trim().length > 0;
    const total = initialEntries.length;

    return (
        <div className="space-y-10 lg:space-y-14">
            <header className="space-y-6 sm:space-y-8 animate-[fade-up_0.6s_ease-out_both]">
                <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] sm:tracking-[0.5em] text-zinc-500 dark:text-zinc-500">
                        Admin · Maintenance · System Logs
                    </p>
                    <h1 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl text-zinc-900 dark:text-zinc-100 leading-[1.05] tracking-tight">
                        The Wire
                    </h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-zinc-500 dark:text-zinc-500">
                        <span className="sm:hidden">
                            {total.toLocaleString()} of {capacity.toLocaleString()} entries
                        </span>
                        <span className="hidden sm:inline">
                            {total.toLocaleString()} of {capacity.toLocaleString()} entries on the
                            wire · in-memory ring · per-instance · timestamps in UTC
                        </span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {LEVEL_ORDER.map((level) => {
                        const active = activeLevels.has(level);
                        return (
                            <button
                                key={level}
                                type="button"
                                onClick={() => toggleLevel(level)}
                                aria-pressed={active}
                                className={`inline-flex items-center gap-2 px-3 py-2 border text-[10px] font-bold uppercase tracking-[0.3em] transition-colors cursor-pointer ${
                                    active
                                        ? LEVEL_TONE[level]
                                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-600"
                                }`}
                            >
                                <span
                                    aria-hidden
                                    className={`inline-block h-1.5 w-1.5 rounded-full ${LEVEL_RAIL[level]}`}
                                />
                                <span>{level}</span>
                                <span className="tabular-nums opacity-70">
                                    {counts[level].toLocaleString()}
                                </span>
                            </button>
                        );
                    })}
                    <div className="grow" />
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-3 py-2 border border-zinc-300 dark:border-zinc-700 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                            aria-hidden="true"
                        >
                            <path d="M21 12a9 9 0 1 1-3-6.7" />
                            <path d="M21 4v5h-5" />
                        </svg>
                        <span>{isRefreshing ? "Pulling…" : "Pull"}</span>
                    </button>
                </div>

                <div className="group flex items-center gap-3 w-full pb-3 border-b border-zinc-300 dark:border-zinc-700 focus-within:border-zinc-900 dark:focus-within:border-zinc-100 transition-colors">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="shrink-0 w-[18px] h-[18px] text-zinc-400 dark:text-zinc-600 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors"
                    >
                        <circle cx="11" cy="11" r="7" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter the wire…"
                        className="flex-1 min-w-0 bg-transparent text-base sm:text-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            aria-label="Clear filter"
                            className="shrink-0 text-[10px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </header>

            {filtered.length === 0 ? (
                <p className="py-16 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500">
                    {isFiltered ? "No entries match the current filter" : "The wire is silent"}
                </p>
            ) : (
                <ol
                    className="border-t border-zinc-200 dark:border-zinc-800"
                    aria-label="System log"
                >
                    {filtered.map((entry, index) => (
                        <LogRow
                            key={`${entry.timestamp.toISOString()}-${index}-${entry.message}`}
                            entry={entry}
                        />
                    ))}
                </ol>
            )}

            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">
                — End of wire —
            </p>
        </div>
    );
}

function LogRow({ entry }: { entry: SystemLogEntry }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { date, time } = formatTimestamp(entry.timestamp);
    const hasFields = entry.fields && Object.keys(entry.fields).length > 0;

    return (
        <li className="group relative border-b border-zinc-200 dark:border-zinc-800">
            <span
                aria-hidden
                className={`absolute left-0 top-0 bottom-0 w-[3px] ${LEVEL_RAIL[entry.level]}`}
            />
            <div className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-[8.5rem_5.5rem_minmax(0,1fr)_auto] items-start gap-3 sm:gap-6 py-4 sm:py-5 pl-4 sm:pl-6 pr-2 sm:pr-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                <div className="hidden sm:flex flex-col leading-none gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] tabular-nums text-zinc-500 dark:text-zinc-500">
                        {date}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-zinc-700 dark:text-zinc-300">
                        {time}
                    </span>
                </div>

                <div className="hidden sm:block">
                    <span
                        className={`inline-block px-2 py-0.5 border text-[9px] font-bold uppercase tracking-[0.3em] ${LEVEL_TONE[entry.level]}`}
                    >
                        {entry.level}
                    </span>
                </div>

                <div className="min-w-0 sm:col-span-1 col-span-1">
                    <div className="sm:hidden flex items-center gap-2 mb-2">
                        <span
                            className={`inline-block px-2 py-0.5 border text-[9px] font-bold uppercase tracking-[0.3em] ${LEVEL_TONE[entry.level]}`}
                        >
                            {entry.level}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] tabular-nums text-zinc-500 dark:text-zinc-500">
                            {date} · {time}
                        </span>
                    </div>
                    <p className="font-mono text-sm leading-relaxed text-zinc-900 dark:text-zinc-100 wrap-break-word">
                        {entry.message}
                    </p>
                    {isExpanded && hasFields && (
                        <pre className="mt-3 p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 font-mono text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300 overflow-x-auto whitespace-pre-wrap wrap-break-word">
                            {JSON.stringify(entry.fields, null, 2)}
                        </pre>
                    )}
                </div>

                <div className="flex items-center justify-end">
                    {hasFields ? (
                        <button
                            type="button"
                            onClick={() => setIsExpanded((v) => !v)}
                            aria-expanded={isExpanded}
                            className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                        >
                            {isExpanded
                                ? "Fold"
                                : `${Object.keys(entry.fields ?? {}).length} fields`}
                        </button>
                    ) : (
                        <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-300 dark:text-zinc-700">
                            —
                        </span>
                    )}
                </div>
            </div>
        </li>
    );
}
