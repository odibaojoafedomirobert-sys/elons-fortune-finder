import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — ElonTesla" }] }),
  component: AdminPage,
});

interface DepositRow {
  id: string;
  user_id: string;
  method: string;
  amount_usd: number;
  proof_url: string;
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  profile?: { email: string | null; display_name: string | null; balance: number } | null;
}

const fmt = (n: number) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  // Verify admin
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      const ok = !!data;
      setIsAdmin(ok);
      if (!ok) {
        toast.error("Admin access required");
        navigate({ to: "/dashboard" });
      }
    })();
  }, [user, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("deposits")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const rows = (data ?? []) as DepositRow[];
    const ids = Array.from(new Set(rows.map((r) => r.user_id)));
    if (ids.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id,email,display_name,balance")
        .in("id", ids);
      const map = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      rows.forEach((r) => { r.profile = map.get(r.user_id) ?? null; });
    }
    setDeposits(rows);
    setLoading(false);
  }, []);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  const viewProof = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("payment-proofs")
      .createSignedUrl(path, 60 * 10);
    if (error || !data) { toast.error("Could not load proof image"); return; }
    setProofUrl(data.signedUrl);
  };

  const decide = async (row: DepositRow, status: "approved" | "rejected") => {
    setBusyId(row.id);
    try {
      const note = noteDraft[row.id] ?? row.admin_note ?? null;
      const { error: upErr } = await supabase
        .from("deposits")
        .update({ status, admin_note: note, reviewed_at: new Date().toISOString() })
        .eq("id", row.id);
      if (upErr) throw upErr;

      if (status === "approved" && row.status !== "approved") {
        const currentBal = Number(row.profile?.balance ?? 0);
        const newBal = currentBal + Number(row.amount_usd);
        const { error: balErr } = await supabase
          .from("profiles")
          .update({ balance: newBal })
          .eq("id", row.user_id);
        if (balErr) throw balErr;
      }
      toast.success(`Deposit ${status}`);
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = deposits.filter((d) => d.status === tab);

  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Checking access…</div>;
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Admin — Deposits</h1>
              <p className="text-muted-foreground mt-1">Review payment proofs and approve or reject deposits.</p>
            </div>
            <Button variant="outline" onClick={load} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh"}
            </Button>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="pending">
                Pending ({deposits.filter((d) => d.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-6 space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : filtered.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">
                  No {tab} deposits.
                </div>
              ) : (
                filtered.map((d) => (
                  <div key={d.id} className="glass-card rounded-2xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {new Date(d.created_at).toLocaleString()}
                        </p>
                        <p className="font-semibold">
                          {d.profile?.display_name ?? "Unknown"}{" "}
                          <span className="text-xs text-muted-foreground font-normal">
                            ({d.profile?.email ?? d.user_id.slice(0, 8)})
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="capitalize text-muted-foreground">{d.method}</span> ·{" "}
                          <span className="font-mono font-bold text-lg">{fmt(Number(d.amount_usd))}</span>
                        </p>
                        {d.notes && (
                          <p className="text-xs text-muted-foreground">User note: {d.notes}</p>
                        )}
                        {d.admin_note && d.status !== "pending" && (
                          <p className="text-xs text-muted-foreground">Admin note: {d.admin_note}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => viewProof(d.proof_url)}>
                        View Proof
                      </Button>
                    </div>

                    {d.status === "pending" && (
                      <div className="mt-4 space-y-3">
                        <Textarea
                          placeholder="Admin note (optional)"
                          rows={2}
                          value={noteDraft[d.id] ?? ""}
                          onChange={(e) =>
                            setNoteDraft((s) => ({ ...s, [d.id]: e.target.value }))
                          }
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="hero"
                            size="sm"
                            disabled={busyId === d.id}
                            onClick={() => decide(d, "approved")}
                          >
                            Approve & Credit {fmt(Number(d.amount_usd))}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busyId === d.id}
                            onClick={() => decide(d, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      <Dialog open={!!proofUrl} onOpenChange={(o) => !o && setProofUrl(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          {proofUrl && (
            <img src={proofUrl} alt="Payment proof" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
