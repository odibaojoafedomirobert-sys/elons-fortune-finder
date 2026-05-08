import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ElonTesla" }] }),
  component: Dashboard,
});

interface Profile { display_name: string | null; balance: number; email: string | null; }
interface Investment { id: string; plan_name: string; amount_invested: number; current_value: number; roi_percent: number; status: string; created_at: string; }
interface Deposit { id: string; method: string; amount_usd: number; status: string; created_at: string; }

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: inv }, { data: dep }] = await Promise.all([
        supabase.from("profiles").select("display_name,balance,email").eq("id", user.id).single(),
        supabase.from("investments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("deposits").select("id,method,amount_usd,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      ]);
      setProfile(p as any);
      setInvestments((inv as any) ?? []);
      setDeposits((dep as any) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const totalInvested = investments.reduce((s, i) => s + Number(i.amount_invested), 0);
  const totalValue = investments.reduce((s, i) => s + Number(i.current_value), 0);
  const totalReturn = totalValue - totalInvested;
  const returnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back</p>
              <h1 className="text-3xl sm:text-4xl font-bold">{profile?.display_name ?? "Investor"}</h1>
            </div>
            <div className="flex gap-3">
              <Link to="/deposit"><Button variant="hero">Deposit Funds</Button></Link>
              <Link to="/chat"><Button variant="outline">Contact Support</Button></Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Available Balance" value={fmt(Number(profile?.balance ?? 0))} />
            <StatCard label="Total Invested" value={fmt(totalInvested)} />
            <StatCard label="Current Value" value={fmt(totalValue)} />
            <StatCard
              label="Total Returns"
              value={fmt(totalReturn)}
              accent={totalReturn >= 0 ? "success" : "destructive"}
              sub={`${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(2)}%`}
            />
          </div>

          {/* Investments */}
          <section className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">My Investments</h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : investments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No investments yet. Deposit funds to get started.</p>
                <Link to="/deposit"><Button variant="hero">Make Your First Deposit</Button></Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr className="border-b">
                      <th className="py-2">Plan</th>
                      <th className="py-2">Invested</th>
                      <th className="py-2">Current Value</th>
                      <th className="py-2">ROI</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((i) => {
                      const gain = Number(i.current_value) - Number(i.amount_invested);
                      return (
                        <tr key={i.id} className="border-b last:border-0">
                          <td className="py-3 font-medium">{i.plan_name}</td>
                          <td className="py-3 font-mono">{fmt(Number(i.amount_invested))}</td>
                          <td className="py-3 font-mono">{fmt(Number(i.current_value))}</td>
                          <td className={`py-3 font-mono ${gain >= 0 ? "text-success" : "text-destructive"}`}>
                            {gain >= 0 ? "+" : ""}{Number(i.roi_percent).toFixed(2)}%
                          </td>
                          <td className="py-3 capitalize text-muted-foreground">{i.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Recent deposits */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Deposits</h2>
            {deposits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deposits yet.</p>
            ) : (
              <ul className="divide-y">
                {deposits.map((d) => (
                  <li key={d.id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium capitalize">{d.method}</p>
                      <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-medium">{fmt(Number(d.amount_usd))}</p>
                      <span className={`text-xs capitalize ${d.status === "approved" ? "text-success" : d.status === "rejected" ? "text-destructive" : "text-muted-foreground"}`}>
                        {d.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: "success" | "destructive" }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-2xl font-bold font-mono">{value}</p>
      {sub && <p className={`mt-1 text-xs font-mono ${accent === "success" ? "text-success" : accent === "destructive" ? "text-destructive" : "text-muted-foreground"}`}>{sub}</p>}
    </div>
  );
}
