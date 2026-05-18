import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { PLANS } from "@/lib/plans";
import { useAuth } from "@/hooks/useAuth";

function pickPlan(amount: number) {
  if (!amount || amount <= 0) return PLANS[0];
  const exact = PLANS.find((p) => amount >= p.min && amount <= p.max);
  if (exact) return exact;
  if (amount < PLANS[0].min) return PLANS[0];
  return PLANS[PLANS.length - 1];
}

export function ROICalculator() {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>("1000");

  const { plan, payout, profit, valid, message } = useMemo(() => {
    const amt = Number(amount) || 0;
    const plan = pickPlan(amt);
    const valid = amt >= PLANS[0].min;
    const payout = amt * (1 + plan.roi / 100);
    const profit = payout - amt;
    const message = !valid
      ? `Minimum investment is $${PLANS[0].min}`
      : amt > PLANS[PLANS.length - 1].max
        ? `Maximum is $${PLANS[PLANS.length - 1].max.toLocaleString()}`
        : "";
    return { plan, payout, profit, valid, message };
  }, [amount]);

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Return Calculator</h2>
        <p className="text-sm text-muted-foreground">See your projected payout instantly.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="calc-amount">Investment amount (USD)</Label>
          <Input
            id="calc-amount"
            type="number"
            min={PLANS[0].min}
            max={PLANS[PLANS.length - 1].max}
            step="50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1000"
          />
          <input
            type="range"
            min={100}
            max={50000}
            step={100}
            value={Number(amount) || 0}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mt-3 accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>$100</span><span>$50,000</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/50 bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">Plan</p>
            <p className="text-lg font-bold">{plan.name}</p>
            <p className="text-xs text-muted-foreground">{plan.roi}% ROI</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">Timeline</p>
            <p className="text-lg font-bold">{plan.durationDays} days</p>
            <p className="text-xs text-muted-foreground">until payout</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">Profit</p>
            <p className="text-lg font-bold text-primary">
              ${profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground">Total payout</p>
            <p className="text-lg font-bold gradient-text">
              ${payout.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {message && <p className="text-sm text-destructive">{message}</p>}

        <Link to={user ? "/invest" : "/auth"} search={{ plan: plan.id } as any}>
          <Button variant="hero" className="w-full" disabled={!valid}>
            {user ? `Invest in ${plan.name}` : "Sign up to invest"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
