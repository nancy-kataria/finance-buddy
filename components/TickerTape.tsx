const TICKERS = [
  { sym: "NVDA", chg: "+4.21%", up: true },
  { sym: "AAPL", chg: "+0.82%", up: true },
  { sym: "TSLA", chg: "-2.14%", up: false },
  { sym: "MSFT", chg: "+1.05%", up: true },
  { sym: "QQQ", chg: "+0.47%", up: true },
  { sym: "META", chg: "-0.93%", up: false },
  { sym: "AMZN", chg: "+2.18%", up: true },
  { sym: "GOOGL", chg: "+0.61%", up: true },
  { sym: "AMD", chg: "-1.42%", up: false },
  { sym: "SPY", chg: "+0.33%", up: true },
  { sym: "BTC", chg: "+3.71%", up: true },
  { sym: "ETH", chg: "-0.58%", up: false },
];

export function TickerTape() {
  const items = [...TICKERS, ...TICKERS];
  return (
    <div className="ticker-tape-mask overflow-hidden border-y border-border/60 bg-surface/40 py-2.5">
      <div className="animate-ticker flex w-max gap-8 whitespace-nowrap">
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-2 font-mono text-xs">
            <span className="font-semibold tracking-wider text-foreground/80">${t.sym}</span>
            <span className={t.up ? "text-bull" : "text-bear"}>{t.chg}</span>
            <span className="text-border">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}