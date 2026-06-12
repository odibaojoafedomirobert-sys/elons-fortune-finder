import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useServerFn } from "@tanstack/react-start";
import { reviewDeposit, reviewWithdrawal } from "@/lib/financial.functions";

interface SupportMsg { id: string; user_id: string; sender_id: string; is_from_admin: boolean; content: string; created_at: string; }
interface Thread { user_id: string; last: SupportMsg; profile?: { email: string | null; full_name: string | null; display_name: string | null } | null; }

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
  profile?: { email: string | null; display_name: string | null; full_name: string | null; phone: string | null; balance: number } | null;
}

interface UserRow {
  id: string;
  email: string | null;
  display_name: string | null;
  full_name: string | null;
  phone: string | null;
  balance: number;
  created_at: string;
}

interface WithdrawalRow {
  id: string; user_id: string; method: string; amount_usd: number;
  destination: string; notes: string | null;
  status: "pending" | "approved" | "rejected" | "paid";
  admin_note: string | null; created_at: string;
  profile?: { email: string | null; full_name: string | null; balance: number } | null;
}

const fmt = (n: number) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected" | "withdrawals" | "users" | "support">("pending");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [threadMsgs, setThreadMsgs] = useState<SupportMsg[]>([]);
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const submitDepositReview = useServerFn(reviewDeposit);
  const submitWithdrawalReview = useServerFn(reviewWithdrawal);

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
    const [depRes, usrRes, wdrRes, msgRes] = await Promise.all([
      supabase.from("deposits").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,email,display_name,full_name,phone,balance,created_at").order("created_at", { ascending: false }),
      supabase.from("withdrawals").select("*").order("created_at", { ascending: false }),
      supabase.from("support_messages").select("*").order("created_at", { ascending: false }),
    ]);
    if (depRes.error) toast.error(depRes.error.message);
    if (usrRes.error) toast.error(usrRes.error.message);
    if (wdrRes.error) toast.error(wdrRes.error.message);
    if (msgRes.error) toast.error(msgRes.error.message);
    const rows = (depRes.data ?? []) as DepositRow[];
    const profiles = (usrRes.data ?? []) as UserRow[];
    const wdrs = (wdrRes.data ?? []) as WithdrawalRow[];
    const msgs = (msgRes.data ?? []) as SupportMsg[];
    const map = new Map(profiles.map((p) => [p.id, p]));
    rows.forEach((r) => { r.profile = map.get(r.user_id) ?? null; });
    wdrs.forEach((w) => { w.profile = map.get(w.user_id) ?? null; });
    const tmap = new Map<string, Thread>();
    for (const m of msgs) {
      if (!tmap.has(m.user_id)) {
        tmap.set(m.user_id, { user_id: m.user_id, last: m, profile: map.get(m.user_id) ?? null });
      }
    }
    setDeposits(rows);
    setUsers(profiles);
    setWithdrawals(wdrs);
    setThreads(Array.from(tmap.values()));
    setLoading(false);
  }, []);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  // Load and subscribe to messages for the active thread
  useEffect(() => {
    if (!activeThread) { setThreadMsgs([]); return; }
    supabase.from("support_messages").select("*")
      .eq("user_id", activeThread).order("created_at", { ascending: true })
      .then(({ data }) => setThreadMsgs((data as SupportMsg[]) ?? []));
    const channel = supabase.channel(`admin-chat-${activeThread}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages", filter: `user_id=eq.${activeThread}` },
        (payload) => setThreadMsgs((prev) => [...prev, payload.new as SupportMsg]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeThread]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [threadMsgs]);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = reply.trim();
    if (!content || !activeThread || !user) return;
    setSendingReply(true);
    const { error } = await supabase.from("support_messages").insert({
      user_id: activeThread, sender_id: user.id, is_from_admin: true, content,
    });
    setSendingReply(false);
    if (error) toast.error(error.message);
    else { setReply(""); load(); }
  };

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
      await submitDepositReview({ data: { id: row.id, status, note: note || undefined } });
      toast.success(`Deposit ${status}`);
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const decideWithdrawal = async (row: WithdrawalRow, status: "approved" | "rejected" | "paid") => {
    setBusyId(row.id);
    try {
      const note = noteDraft[row.id] ?? row.admin_note ?? null;
      await submitWithdrawalReview({ data: { id: row.id, status, note: note || undefined } });
      toast.success(`Withdrawal ${status}`);
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const isDepositTab = tab === "pending" || tab === "approved" || tab === "rejected";
  const filtered = isDepositTab ? deposits.filter((d) => d.status === tab) : [];

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
            <TabsList className="grid w-full grid-cols-6 max-w-4xl">
              <TabsTrigger value="pending">
                Pending ({deposits.filter((d) => d.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="withdrawals">
                Withdrawals ({withdrawals.filter((w) => w.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
              <TabsTrigger value="support">Support ({threads.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="support" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[500px]">
                <div className="md:col-span-1 glass-card rounded-2xl p-3 space-y-1 max-h-[600px] overflow-y-auto">
                  {threads.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4 text-center">No conversations yet.</p>
                  ) : threads.map((t) => (
                    <button key={t.user_id} onClick={() => setActiveThread(t.user_id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        activeThread === t.user_id ? "bg-primary/20" : "hover:bg-muted"
                      }`}>
                      <p className="font-semibold text-sm truncate">
                        {t.profile?.full_name ?? t.profile?.display_name ?? t.profile?.email ?? t.user_id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{t.last.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(t.last.created_at).toLocaleString()}</p>
                    </button>
                  ))}
                </div>
                <div className="md:col-span-2 glass-card rounded-2xl flex flex-col max-h-[600px]">
                  {!activeThread ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                      Select a conversation to reply.
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {threadMsgs.map((m) => (
                          <div key={m.id} className={`flex ${m.is_from_admin ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                              m.is_from_admin ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                            }`}>
                              <p className="whitespace-pre-wrap break-words">{m.content}</p>
                              <p className={`text-[10px] mt-1 ${m.is_from_admin ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={bottomRef} />
                      </div>
                      <form onSubmit={sendReply} className="border-t p-3 flex gap-2">
                        <Input value={reply} onChange={(e) => setReply(e.target.value)}
                          placeholder="Type a reply…" maxLength={1000} disabled={sendingReply} />
                        <Button type="submit" variant="hero" disabled={sendingReply || !reply.trim()}>Send</Button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>


            <TabsContent value="withdrawals" className="mt-6 space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : withdrawals.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">No withdrawal requests.</div>
              ) : (
                withdrawals.map((w) => (
                  <div key={w.id} className="glass-card rounded-2xl p-5">
                    <div className="flex flex-wrap justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold">{w.profile?.full_name ?? "—"} <span className="text-xs text-muted-foreground font-normal">({w.profile?.email ?? "—"})</span></p>
                        <p className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString()}</p>
                      </div>
                      <span className={`text-xs uppercase font-semibold self-start px-2 py-1 rounded ${
                        w.status === "paid" || w.status === "approved" ? "bg-success/20 text-success"
                        : w.status === "rejected" ? "bg-destructive/20 text-destructive"
                        : "bg-muted text-muted-foreground"
                      }`}>{w.status}</span>
                    </div>
                    <p className="text-sm">
                      <span className="capitalize text-muted-foreground">{w.method}</span> ·{" "}
                      <span className="font-mono font-bold text-lg">{fmt(Number(w.amount_usd))}</span>
                    </p>
                    <p className="text-xs text-muted-foreground break-all mt-1">To: {w.destination}</p>
                    {w.notes && <p className="text-xs text-muted-foreground">User note: {w.notes}</p>}
                    <p className="text-xs text-muted-foreground">User balance: <span className="font-mono">{fmt(Number(w.profile?.balance ?? 0))}</span></p>
                    {w.admin_note && w.status !== "pending" && (
                      <p className="text-xs text-muted-foreground">Admin note: {w.admin_note}</p>
                    )}
                    {w.status === "pending" && (
                      <div className="mt-3 space-y-3">
                        <Textarea placeholder="Admin note (optional)" rows={2}
                          value={noteDraft[w.id] ?? ""}
                          onChange={(e) => setNoteDraft((s) => ({ ...s, [w.id]: e.target.value }))} />
                        <div className="flex gap-2 flex-wrap">
                          <Button variant="hero" size="sm" disabled={busyId === w.id}
                            onClick={() => decideWithdrawal(w, "paid")}>
                            Mark Paid & Deduct {fmt(Number(w.amount_usd))}
                          </Button>
                          <Button variant="outline" size="sm" disabled={busyId === w.id}
                            onClick={() => decideWithdrawal(w, "rejected")}>
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="users" className="mt-6 space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : users.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">No users yet.</div>
              ) : (
                users.map((u) => (
                  <div key={u.id} className="glass-card rounded-2xl p-5">
                    <p className="font-semibold">{u.full_name ?? u.display_name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">Email: <span className="text-foreground">{u.email ?? "—"}</span></p>
                    <p className="text-sm text-muted-foreground">Phone: <span className="text-foreground">{u.phone ?? "—"}</span></p>
                    <p className="text-sm text-muted-foreground">Balance: <span className="text-foreground font-mono">{fmt(Number(u.balance ?? 0))}</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Joined {new Date(u.created_at).toLocaleString()}</p>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value={isDepositTab ? tab : "__none__"} className="mt-6 space-y-4">
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
