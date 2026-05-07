import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Markets — ElonTesla" },
      { name: "description", content: "Live market data across stocks, crypto, forex, and commodities." },
      { property: "og:title", content: "Markets — ElonTesla" },
      { property: "og:description", content: "Live market data across stocks, crypto, forex, and commodities." },
    ],
  }),
  component: MarketsPage,
});

const marketData = [
  { name: "Tesla Inc.", symbol: "TSLA", price: "$248.42", change: "+3.24%", up: true, cap: "$789B" },
  { name: "Bitcoin", symbol: "BTC", price: "$67,845", change: "+1.87%", up: true, cap: "$1.33T" },
  { name: "Apple Inc.", symbol: "AAPL", price: "$198.11", change: "-0.42%", up: false, cap: "$3.05T" },
  { name: "Ethereum", symbol: "ETH", price: "$3,421", change: "+2.15%", up: true, cap: "$411B" },
  { name: "NVIDIA Corp.", symbol: "NVDA", price: "$875.32", change: "+4.56%", up: true, cap: "$2.16T" },
  { name: "Amazon", symbol: "AMZN", price: "$186.51", change: "+1.02%", up: true, cap: "$1.93T" },
  { name: "Microsoft", symbol: "MSFT", price: "$425.89", change: "-0.18%", up: false, cap: "$3.16T" },
  { name: "Solana", symbol: "SOL", price: "$145.67", change: "+5.43%", up: true, cap: "$65B" },
];

function MarketsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Live <span className="gradient-text">Markets</span>
          </h1>
          <p className="text-muted-foreground mb-8">Real-time prices across major asset classes.</p>

          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-muted-foreground font-medium">Asset</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Symbol</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">Price</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">24h Change</th>
                    <th className="text-right p-4 text-muted-foreground font-medium hidden sm:table-cell">Market Cap</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData.map((m) => (
                    <tr key={m.symbol} className="border-b border-border/30 hover:bg-accent/30 transition-colors cursor-pointer">
                      <td className="p-4 font-medium text-foreground">{m.name}</td>
                      <td className="p-4 text-muted-foreground">{m.symbol}</td>
                      <td className="p-4 text-right text-foreground font-mono">{m.price}</td>
                      <td className={`p-4 text-right font-mono ${m.up ? "text-success" : "text-destructive"}`}>{m.change}</td>
                      <td className="p-4 text-right text-muted-foreground hidden sm:table-cell">{m.cap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
