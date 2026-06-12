import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useServerFn } from "@tanstack/react-start";
import { createWithdrawal } from "@/lib/financial.functions";

export const Route = createFileRoute("/_authenticated/withdraw")({
  head: () => ({ meta: [{ title: "Withdraw — ElonTesla" }] }),
  component: WithdrawPage,
});

interface WithdrawalRow {
  id: string; method: string; amount_usd: number; destination: string;
  status: string; admin_note: string | null; created_at: string;
}

function WithdrawPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [method, setMethod] = useState("bitcoin");
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<WithdrawalRow[]>([]);
  const submitWithdrawal = useServerFn(createWithdrawal);

  const load = useCallback(async () => {
    if (!user) return;
    const [{ data: p }, { data: w }] = await Promise.all([
      supabase.from("profiles").select("balance").eq("id", user.id).single(),
      supabase.from("withdrawals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setBalance(Number(p?.balance ?? 0));
    setHistory((w as any) ?? []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const schema = z.object({
      amount: z.coerce.number().min(10, "Minimum withdrawal is $10"),
      destination: z.string().trim().min(5, "Destination required").max(200),
      notes: z.string().max(500).optional(),
    });
    const parsed = schema.safeParse({ amount, destination, notes });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (parsed.data.amount > balance) { toast.error("Insufficient balance"); return; }

    setBusy(true);
    try {
      await submitWithdrawal({ data: {
        method,
        amount: parsed.data.amount,
        destination: parsed.data.destination,
        notes: parsed.data.notes || undefined,
      } as any });
      toast.success("Withdrawal request submitted. We'll review within 24–72 hours.");
      setAmount(""); setDestination(""); setNotes("");
      load();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to submit");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Withdraw Funds</h1>
          <p className="text-muted-foreground mb-6">Available balance: <span className="font-mono text-foreground">${balance.toFixed(2)}</span></p>

          <form onSubmit={submit} className="glass-card rounded-2xl p-6 space-y-4 mb-8">
            <div>
              <Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="usdt">USDT (TRC20)</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (USD)</Label>
              <Input type="number" min={10} step="0.01" value={amount}
                onChange={(e) => setAmount(e.target.value)} placeholder="Minimum $10" required />
            </div>
            <div>
              <Label>{method === "bank" ? "Bank Account Details" : "Wallet Address"}</Label>
              <Input value={destination} onChange={(e) => setDestination(e.target.value)}
                placeholder={method === "bank" ? "Bank name, IBAN/account number, holder name" : "Your wallet address"} required />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Any extra info" />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={busy}>
              {busy ? "Submitting…" : "Request Withdrawal"}
            </Button>
          </form>

          <h2 className="text-xl font-semibold mb-4">Withdrawal History</h2>
          {history.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">No withdrawals yet.</div>
          ) : (
            <div className="space-y-3">
              {history.map((w) => (
                <div key={w.id} className="glass-card rounded-xl p-4 flex justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-medium capitalize">{w.method} · <span className="font-mono">${Number(w.amount_usd).toFixed(2)}</span></p>
                    <p className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground break-all">To: {w.destination}</p>
                    {w.admin_note && <p className="text-xs text-muted-foreground mt-1">Admin: {w.admin_note}</p>}
                  </div>
                  <span className={`text-xs uppercase font-semibold self-start px-2 py-1 rounded ${
                    w.status === "paid" || w.status === "approved" ? "bg-success/20 text-success"
                    : w.status === "rejected" ? "bg-destructive/20 text-destructive"
                    : "bg-muted text-muted-foreground"
                  }`}>{w.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
