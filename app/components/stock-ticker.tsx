"use client";

import { useEffect, useState } from "react";
import { getStocks, type Stock } from "@/app/lib/stocks";

const TICK_MS = 3000;

/**
 * Editorial-style market strip rendered below the masthead. State is seeded
 * empty and populated inside useEffect so server-rendered HTML doesn't
 * disagree with the first client render — getStocks() uses Math.random().
 */
export default function StockTicker() {
    const [stocks, setStocks] = useState<Stock[]>([]);

    useEffect(() => {
        setStocks(getStocks());
        const handle = setInterval(() => {
            setStocks((prev) => getStocks(prev));
        }, TICK_MS);
        return () => clearInterval(handle);
    }, []);

    if (stocks.length === 0) {
        return <div aria-hidden="true" className="h-9" />;
    }

    return (
        <ul
            aria-label="Live stock ticker"
            className="flex flex-nowrap items-center justify-center gap-x-6 sm:flex-wrap sm:gap-x-8 lg:gap-x-12 sm:gap-y-2 px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-mono whitespace-nowrap"
        >
            {stocks.map((s, i) => {
                const up = s.change >= 0;
                return (
                    <li
                        key={s.symbol}
                        className={`${
                            i < 2 ? "flex" : "hidden sm:flex"
                        } items-center gap-1 sm:gap-1.5 shrink-0`}
                    >
                        <span className="font-bold tracking-wider text-zinc-700 dark:text-zinc-200">
                            {s.symbol}
                        </span>
                        <span className="tabular-nums text-zinc-900 dark:text-zinc-100">
                            ${s.price.toFixed(2)}
                        </span>
                        <span
                            className={
                                up
                                    ? "tabular-nums text-emerald-600 dark:text-emerald-400"
                                    : "tabular-nums text-red-600 dark:text-red-400"
                            }
                        >
                            <span className="sr-only">{up ? "increasing" : "decreasing"}</span>
                            <span aria-hidden="true">{up ? "▲" : "▼"}</span>{" "}
                            {Math.abs(s.changePercent).toFixed(2)}%
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}
