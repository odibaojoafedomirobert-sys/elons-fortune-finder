import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ElonTesla — Smart Investing for the Future" },
      { name: "description", content: "ElonTesla empowers investors with AI-driven insights, real-time market data, and intelligent portfolio management." },
      { property: "og:title", content: "ElonTesla — Smart Investing for the Future" },
      { property: "og:description", content: "AI-driven investing platform with real-time market insights." },
    ],
  }),
  component: Index,
});

const stats = [
  { value: "$2.4B+", label: "Assets Managed" },
  { value: "150K+", label: "Active Investors" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Market Coverage" },
];

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: "Real-Time Analytics",
    desc: "Track market movements with millisecond precision and AI-powered pattern recognition.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Bank-Grade Security",
    desc: "256-bit encryption with multi-factor authentication and cold storage custody.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Smart Portfolio",
    desc: "AI-optimized portfolio allocation that adapts to market conditions automatically.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Global Markets",
    desc: "Access stocks, crypto, forex, and commodities across 50+ exchanges worldwide.",
  },
];

const tickers = [
  { symbol: "TSLA", price: "$248.42", change: "+3.24%", up: true },
  { symbol: "BTC", price: "$67,845", change: "+1.87%", up: true },
  { symbol: "AAPL", price: "$198.11", change: "-0.42%", up: false },
  { symbol: "ETH", price: "$3,421", change: "+2.15%", up: true },
  { symbol: "NVDA", price: "$875.32", change: "+4.56%", up: true },
  { symbol: "SPY", price: "$512.78", change: "+0.91%", up: true },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Ticker Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-card/80 backdrop-blur-md border-b border-border/30 overflow-hidden">
        <div className="flex items-center gap-8 py-2 px-4 animate-[scroll_20s_linear_infinite]">
          {[...tickers, ...tickers].map((t, i) => (
            <div key={i} className="flex items-center gap-2 whitespace-nowrap text-xs">
              <span className="font-semibold text-foreground">{t.symbol}</span>
              <span className="text-muted-foreground">{t.price}</span>
              <span className={t.up ? "text-success" : "text-destructive"}>{t.change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs text-primary mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Markets are open — Start investing now
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
              Invest Smarter with{" "}
              <span className="gradient-text">ElonTesla</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              AI-powered investment platform with real-time analytics, smart portfolio management, and access to global markets — all in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth"><Button variant="hero" size="lg" className="w-full sm:w-auto text-base px-8 py-6">
                Start Investing Free
              </Button></Link>
              <Link to="/markets"><Button variant="heroOutline" size="lg" className="w-full sm:w-auto text-base px-8 py-6">
                View Markets
              </Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center animate-count-up">
                <div className="text-3xl sm:text-4xl font-bold gradient-text">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Professional-grade tools designed for both beginners and seasoned investors.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-gold/5" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Ready to Build Your Future?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
                Join thousands of investors who trust ElonTesla for smarter, faster, and more profitable investing.
              </p>
              <div className="mt-8">
                <Link to="/auth"><Button variant="hero" size="lg" className="text-base px-10 py-6">
                  Create Free Account
                </Button></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
