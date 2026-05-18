import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/plans";
import { useAuth } from "@/hooks/useAuth";
import { ROICalculator } from "@/components/ROICalculator";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "Investment Plans — ElonTesla" },
      { name: "description", content: "Choose from Starter, Pro, and VIP plans with guaranteed ROI." },
    ],
  }),
  component: PlansPage,
});

function PlansPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Investment Plans</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pick a plan that matches your goals. Higher tiers unlock greater returns and dedicated support.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-12">
            <ROICalculator />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((p, idx) => (
              <div
                key={p.id}
                className={`glass-card rounded-2xl p-8 flex flex-col ${
                  idx === 1 ? "border-primary border-2 shadow-[var(--shadow-elegant)]" : ""
                }`}
              >
                {idx === 1 && (
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Most Popular</div>
                )}
                <h2 className="text-2xl font-bold">{p.name}</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  ${p.min.toLocaleString()} – ${p.max.toLocaleString()}
                </p>
                <div className="my-6">
                  <span className="text-5xl font-bold gradient-text">{p.roi}%</span>
                  <span className="text-muted-foreground ml-2">ROI</span>
                  <p className="text-sm text-muted-foreground mt-1">in {p.durationDays} days</p>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="text-sm flex gap-2">
                      <span className="text-primary">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={user ? "/invest" : "/auth"} search={{ plan: p.id } as any}>
                  <Button variant={idx === 1 ? "hero" : "outline"} className="w-full">
                    {user ? `Invest in ${p.name}` : "Sign Up to Invest"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
