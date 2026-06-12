REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
GRANT UPDATE (display_name, full_name, phone) ON TABLE public.profiles TO authenticated;

DROP POLICY IF EXISTS "Users insert own investments" ON public.investments;
DROP POLICY IF EXISTS "Users insert own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Users send messages in own thread" ON public.support_messages;

CREATE POLICY "Users send validated messages in own thread"
ON public.support_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND length(btrim(content)) BETWEEN 1 AND 1000
  AND (
    (auth.uid() = user_id AND is_from_admin = false)
    OR (public.has_role(auth.uid(), 'admin'::public.app_role) AND is_from_admin = true)
  )
);

CREATE OR REPLACE FUNCTION public.create_investment(p_plan_id text, p_amount numeric)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_balance numeric;
  v_name text;
  v_roi numeric;
  v_min numeric;
  v_max numeric;
  v_id uuid;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  CASE p_plan_id
    WHEN 'starter' THEN v_name := 'Starter'; v_roi := 500; v_min := 100; v_max := 999;
    WHEN 'pro' THEN v_name := 'Pro'; v_roi := 400; v_min := 1000; v_max := 4999;
    WHEN 'vip' THEN v_name := 'VIP'; v_roi := 400; v_min := 5000; v_max := 100000;
    ELSE RAISE EXCEPTION 'Invalid investment plan';
  END CASE;
  IF p_amount IS NULL OR p_amount < v_min OR p_amount > v_max THEN
    RAISE EXCEPTION 'Amount is outside the selected plan limits';
  END IF;
  SELECT balance INTO v_balance FROM public.profiles WHERE id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF v_balance < p_amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
  UPDATE public.profiles SET balance = balance - p_amount, updated_at = now() WHERE id = v_user_id;
  INSERT INTO public.investments (user_id, plan_name, amount_invested, current_value, roi_percent, status)
  VALUES (v_user_id, v_name, p_amount, p_amount, v_roi, 'active') RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_investment(text, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_investment(text, numeric) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_withdrawal_request(p_method text, p_amount numeric, p_destination text, p_notes text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_balance numeric;
  v_id uuid;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_method NOT IN ('bitcoin', 'usdt', 'bank') THEN RAISE EXCEPTION 'Invalid withdrawal method'; END IF;
  IF p_amount IS NULL OR p_amount < 10 THEN RAISE EXCEPTION 'Minimum withdrawal is $10'; END IF;
  IF p_destination IS NULL OR length(btrim(p_destination)) < 5 OR length(p_destination) > 200 THEN RAISE EXCEPTION 'Invalid destination'; END IF;
  IF p_notes IS NOT NULL AND length(p_notes) > 500 THEN RAISE EXCEPTION 'Notes are too long'; END IF;
  SELECT balance INTO v_balance FROM public.profiles WHERE id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF v_balance < p_amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
  INSERT INTO public.withdrawals (user_id, method, amount_usd, destination, notes)
  VALUES (v_user_id, p_method, p_amount, btrim(p_destination), nullif(btrim(p_notes), '')) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_withdrawal_request(text, numeric, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_withdrawal_request(text, numeric, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.review_deposit(p_deposit_id uuid, p_status text, p_admin_note text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_deposit public.deposits%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF p_status NOT IN ('approved', 'rejected') THEN RAISE EXCEPTION 'Invalid decision'; END IF;
  IF p_admin_note IS NOT NULL AND length(p_admin_note) > 1000 THEN RAISE EXCEPTION 'Admin note is too long'; END IF;
  SELECT * INTO v_deposit FROM public.deposits WHERE id = p_deposit_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Deposit not found'; END IF;
  IF v_deposit.status::text <> 'pending' THEN RAISE EXCEPTION 'Deposit has already been reviewed'; END IF;
  IF p_status = 'approved' THEN
    UPDATE public.profiles SET balance = balance + v_deposit.amount_usd, updated_at = now() WHERE id = v_deposit.user_id;
  END IF;
  UPDATE public.deposits SET status = p_status::public.deposit_status, admin_note = nullif(btrim(p_admin_note), ''), reviewed_at = now() WHERE id = p_deposit_id;
END;
$$;
REVOKE ALL ON FUNCTION public.review_deposit(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_deposit(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.review_withdrawal(p_withdrawal_id uuid, p_status text, p_admin_note text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_withdrawal public.withdrawals%ROWTYPE;
  v_balance numeric;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF p_status NOT IN ('approved', 'rejected', 'paid') THEN RAISE EXCEPTION 'Invalid decision'; END IF;
  IF p_admin_note IS NOT NULL AND length(p_admin_note) > 1000 THEN RAISE EXCEPTION 'Admin note is too long'; END IF;
  SELECT * INTO v_withdrawal FROM public.withdrawals WHERE id = p_withdrawal_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Withdrawal not found'; END IF;
  IF v_withdrawal.status::text <> 'pending' THEN RAISE EXCEPTION 'Withdrawal has already been reviewed'; END IF;
  IF p_status IN ('approved', 'paid') THEN
    SELECT balance INTO v_balance FROM public.profiles WHERE id = v_withdrawal.user_id FOR UPDATE;
    IF v_balance < v_withdrawal.amount_usd THEN RAISE EXCEPTION 'Insufficient user balance'; END IF;
    UPDATE public.profiles SET balance = balance - v_withdrawal.amount_usd, updated_at = now() WHERE id = v_withdrawal.user_id;
  END IF;
  UPDATE public.withdrawals SET status = p_status::public.withdrawal_status, admin_note = nullif(btrim(p_admin_note), ''), reviewed_at = now() WHERE id = p_withdrawal_id;
END;
$$;
REVOKE ALL ON FUNCTION public.review_withdrawal(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_withdrawal(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, full_name, phone)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'support_messages') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.support_messages;
  END IF;
END $$;