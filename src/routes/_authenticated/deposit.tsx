import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BTC_ADDRESS } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/deposit")({
  head: () => ({ meta: [{ title: "Deposit — ElonTesla" }] }),
  component: DepositPage,
});

const schema = z.object({
  amount: z.number().positive().max(1_000_000),
  notes: z.string().max(500).optional(),
});

function DepositPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Deposit Funds</h1>
          <p className="text-muted-foreground mb-8">Choose how you'd like to fund your account.</p>

          <Tabs defaultValue="bitcoin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bitcoin">Bitcoin</TabsTrigger>
              <TabsTrigger value="giftcard">Gift Card</TabsTrigger>
            </TabsList>

            <TabsContent value="bitcoin" className="mt-6">
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Send Bitcoin</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Send BTC to the address below, then upload your payment screenshot for verification.
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Bitcoin Address</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs sm:text-sm font-mono break-all flex-1">{BTC_ADDRESS}</code>
                    <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(BTC_ADDRESS); toast.success("Address copied"); }}>
                      Copy
                    </Button>
                  </div>
                </div>
                <DepositForm method="bitcoin" userId={user!.id} placeholder="Screenshot of BTC transaction" />
              </div>
            </TabsContent>

            <TabsContent value="giftcard" className="mt-6">
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Gift Card Deposit</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a clear picture of your gift card showing the code. We'll verify and credit your account.
                  </p>
                </div>
                <DepositForm method="giftcard" userId={user!.id} placeholder="Picture of gift card with code visible" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function DepositForm({ method, userId, placeholder }: { method: "bitcoin" | "giftcard"; userId: string; placeholder: string }) {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error("Please upload a screenshot"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("File too large (max 5MB)"); return; }
    const parsed = schema.safeParse({ amount: Number(amount), notes });
    if (!parsed.success) { toast.error("Enter a valid amount"); return; }

    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${method}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, file);
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("deposits").insert({
        user_id: userId,
        method,
        amount_usd: Number(amount),
        proof_url: path,
        notes: notes || null,
      });
      if (insErr) throw insErr;

      toast.success("Deposit submitted! We'll review and credit your account.");
      setAmount(""); setNotes(""); setFile(null);
      (document.getElementById(`file-${method}`) as HTMLInputElement).value = "";
    } catch (err: any) {
      toast.error(err.message ?? "Submission failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor={`amt-${method}`}>Amount (USD)</Label>
        <Input id={`amt-${method}`} type="number" step="0.01" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor={`file-${method}`}>Payment proof image</Label>
        <Input id={`file-${method}`} type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
        <p className="text-xs text-muted-foreground mt-1">{placeholder} • Max 5MB</p>
      </div>
      <div>
        <Label htmlFor={`notes-${method}`}>Notes (optional)</Label>
        <Textarea id={`notes-${method}`} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} rows={3} />
      </div>
      <Button type="submit" variant="hero" className="w-full" disabled={busy}>
        {busy ? "Submitting…" : "Submit Deposit"}
      </Button>
    </form>
  );
}
