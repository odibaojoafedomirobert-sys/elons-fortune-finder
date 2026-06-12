import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const investmentSchema = z.object({
  planId: z.enum(["starter", "pro", "vip"]),
  amount: z.number().finite().positive().max(100_000),
});

const withdrawalSchema = z.object({
  method: z.enum(["bitcoin", "usdt", "bank"]),
  amount: z.number().finite().min(10).max(100_000_000),
  destination: z.string().trim().min(5).max(200),
  notes: z.string().trim().max(500).optional(),
});

const depositReviewSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  note: z.string().trim().max(1000).optional(),
});

const withdrawalReviewSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected", "paid"]),
  note: z.string().trim().max(1000).optional(),
});

async function requireAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

export const createInvestment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => investmentSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: id, error } = await supabaseAdmin.rpc("create_investment", {
      p_user_id: context.userId,
      p_plan_id: data.planId,
      p_amount: data.amount,
    } as never);
    if (error) throw new Error(error.message);
    return { id };
  });

export const createWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => withdrawalSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: id, error } = await supabaseAdmin.rpc("create_withdrawal_request", {
      p_user_id: context.userId,
      p_method: data.method,
      p_amount: data.amount,
      p_destination: data.destination,
      p_notes: data.notes || null,
    } as never);
    if (error) throw new Error(error.message);
    return { id };
  });

export const reviewDeposit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => depositReviewSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("review_deposit", {
      p_admin_id: context.userId,
      p_deposit_id: data.id,
      p_status: data.status,
      p_admin_note: data.note || null,
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reviewWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => withdrawalReviewSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("review_withdrawal", {
      p_admin_id: context.userId,
      p_withdrawal_id: data.id,
      p_status: data.status,
      p_admin_note: data.note || null,
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });