import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLANS } from "@/lib/plans";
import { useServerFn } from "@tanstack/react-start";
import { createInvestment } from "@/lib/financial.functions";

export const Route = createFileRoute("/_authenticated/invest")({
  head: () => ({ meta: [{ title: "Invest — ElonTesla" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ plan: typeof s.plan === "string" ? s.plan : "starter" }),
  component: InvestPage,
});

function InvestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { plan: planId } = Route.useSearch();
  const [selected, setSelected] = useState(planId);
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [busy, setBusy] = useState(false);
  const submitInvestment = useServerFn(createInvestment);

  const plan = PLANS.find((p) => p.id === selected) ?? PLANS[0];

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("balance").eq("id", user.id).single()
      .then(({ data }) => setBalance(Number(data?.balance ?? 0)));
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const schema = z.object({
      amount: z.coerce.number().min(plan.min, `Minimum is $${plan.min}`).max(plan.max, `Maximum is $${plan.max}`),
    });
    const parsed = schema.safeParse({ amount });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    const amt = parsed.data.amount;
    if (amt > balance) { toast.error("Insufficient balance. Please deposit first."); return; }

    setBusy(true);
    try {
      const projected = amt * (1 + plan.roi / 100);
      await submitInvestment({ data: { planId: plan.id as "starter" | "pro" | "vip", amount: amt } });
      toast.success(`Invested ${amt} in ${plan.name}. Projected: $${projected.toFixed(2)}`);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to invest");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Start Investment</h1>
          <p className="text-muted-foreground mb-6">Available balance: <span className="font-mono text-foreground">${balance.toFixed(2)}</span></p>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p.id)}
                className={`glass-card rounded-xl p-4 text-left transition ${selected === p.id ? "border-primary border-2" : ""}`}
              >
                <p className="font-bold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.roi}% / {p.durationDays}d</p>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="glass-card rounded-2xl p-6 space-y-4">
            <div>
              <Label>Amount (USD)</Label>
              <Input type="number" min={plan.min} max={plan.max} step="0.01"
                value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min $${plan.min} – Max $${plan.max}`} required />
            </div>
            <div className="text-sm text-muted-foreground">
              Projected return: <span className="font-mono text-foreground">
                ${amount ? (Number(amount) * (1 + plan.roi / 100)).toFixed(2) : "0.00"}
              </span> after {plan.durationDays} days
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={busy}>
              {busy ? "Processing…" : `Invest in ${plan.name}`}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
