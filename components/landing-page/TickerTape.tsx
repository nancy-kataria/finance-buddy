import { useEffect, useState } from "react";
import { TickerItem, ActiveTradedItem } from "@/types";

export function TickerTape() {
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickers() {
      try {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}`,
        );
        const data = await response.json();

        const activeTraded = data.most_actively_traded || [];

        const formattedTickers: TickerItem[] = activeTraded.map(
          (item: ActiveTradedItem) => {
            const changePercent = parseFloat(item.change_percentage);
            const isUp = changePercent >= 0;

            const formattedChg = `${isUp ? "+" : ""}${changePercent.toFixed(2)}%`;

            return {
              sym: item.ticker,
              chg: formattedChg,
              up: isUp,
            };
          },
        );

        setTickers(formattedTickers);
      } catch (error) {
        console.error("Error fetching ticker data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTickers();
  }, []);

  if (loading || tickers.length === 0) {
    return (
      <div className="border-y border-border/60 bg-surface/40 py-2.5 text-center font-mono text-xs text-foreground/40">
        Loading market data...
      </div>
    );
  }

  // Duplicating items to ensure seamless infinite looping animation
  const items = [...tickers, ...tickers];

  return (
    <div className="ticker-tape-mask overflow-hidden border-y border-border/60 bg-surface/40 py-2.5">
      <div className="animate-ticker flex w-max gap-8 whitespace-nowrap">
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-2 font-mono text-xs">
            <span className="font-semibold tracking-wider text-foreground/80">
              ${t.sym}
            </span>
            <span className={t.up ? "text-bull" : "text-bear"}>{t.chg}</span>
            <span className="text-border">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
