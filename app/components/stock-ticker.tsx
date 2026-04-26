"use client";

import { useEffect, useState } from "react";
import { getStocks, type Stock } from "@/app/lib/stocks";

const TICK_MS = 3000;

/**
 * StockTicker shows the four fictional tickers (PLOR, GSAQ, DCK, FRLTTI)
 * with a price and a directional indicator. We seed state empty and populate
 * inside useEffect so server-rendered HTML doesn't disagree with the first
 * client render — Math.random() would otherwise cause a hydration mismatch.
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
        // Reserve space so the navbar doesn't reflow on first tick.
        return <div aria-hidden="true" className="hidden lg:flex h-5 w-[420px]" />;
    }

    return (
        <ul
            aria-label="Live stock ticker"
            className="hidden lg:flex items-center gap-2 xl:gap-4 text-xs font-mono"
        >
            {stocks.map((s) => {
                const up = s.change >= 0;
                return (
                    <li key={s.symbol} className="flex items-center gap-1 xl:gap-1.5">
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
