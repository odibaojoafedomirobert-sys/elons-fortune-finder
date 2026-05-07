import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ElonTesla" },
      { name: "description", content: "Learn about ElonTesla's mission to democratize investing through technology." },
      { property: "og:title", content: "About — ElonTesla" },
      { property: "og:description", content: "Learn about ElonTesla's mission to democratize investing." },
    ],
  }),
  component: AboutPage,
});

const values = [
  { title: "Innovation First", desc: "We push the boundaries of fintech with cutting-edge AI and machine learning." },
  { title: "Radical Transparency", desc: "No hidden fees. No surprises. Every cost is upfront and clear." },
  { title: "Security Always", desc: "Your assets are protected with institutional-grade security infrastructure." },
  { title: "Accessible to All", desc: "Professional tools shouldn't be reserved for Wall Street. We level the playing field." },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              About <span className="gradient-text">ElonTesla</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              We're on a mission to make professional-grade investing accessible to everyone. Founded by a team of engineers and traders, ElonTesla combines AI technology with deep market expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {values.map((v) => (
              <div key={v.title} className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>ElonTesla was born from a simple observation: the best investment tools were locked behind institutional paywalls. We set out to change that.</p>
              <p>Today, our AI-powered platform serves over 150,000 investors across 40+ countries, managing billions in assets with the same sophisticated tools used by the world's top hedge funds.</p>
              <p>Our team spans engineers from leading tech companies, former Wall Street quantitative analysts, and passionate builders who believe technology can make finance more fair, more transparent, and more accessible.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
