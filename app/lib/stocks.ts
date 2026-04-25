export interface Stock {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
}

const SYMBOLS = ["PLOR", "GSAQ", "DCK", "FRLTTI"] as const;

// Seed prices so each ticker has its own believable baseline. The random walk
// in getStocks() then drifts around these values.
const BASE_PRICES: Record<(typeof SYMBOLS)[number], number> = {
    PLOR: 142.5,
    GSAQ: 87.2,
    DCK: 215.75,
    FRLTTI: 9.42,
};

/**
 * getStocks returns the four fictional tickers with a random-walk price
 * update. Pass the previous result to make each tick a small drift relative
 * to the last value (so the up/down indicator means "since the last tick").
 * Without `previous`, prices anchor to BASE_PRICES.
 */
export function getStocks(previous?: Stock[]): Stock[] {
    return SYMBOLS.map((symbol) => {
        const prev = previous?.find((p) => p.symbol === symbol);
        const lastPrice = prev?.price ?? BASE_PRICES[symbol];
        // ±1% drift per tick — small enough to look organic, big enough to flip direction often.
        const delta = (Math.random() - 0.5) * 0.02 * lastPrice;
        const price = Math.max(0.01, lastPrice + delta);
        const change = price - lastPrice;
        const changePercent = (change / lastPrice) * 100;
        return { symbol, price, change, changePercent };
    });
}
