CREATE TABLE public.recurring_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant TEXT NOT NULL,
  normalized_merchant TEXT NOT NULL,
  cadence TEXT NOT NULL CHECK (cadence IN ('weekly', 'monthly', 'yearly')),
  typical_amount NUMERIC NOT NULL,
  monthly_cost NUMERIC NOT NULL,
  last_charge_date DATE NOT NULL,
  next_expected_date DATE,
  detection_status TEXT NOT NULL DEFAULT 'detected'
    CHECK (detection_status IN ('detected', 'confirmed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, normalized_merchant)
);

CREATE INDEX idx_recurring_payments_user_id ON public.recurring_payments(user_id);

ALTER TABLE public.recurring_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recurring payments"
  ON public.recurring_payments FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own recurring payments"
  ON public.recurring_payments FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own recurring payments"
  ON public.recurring_payments FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own recurring payments"
  ON public.recurring_payments FOR DELETE USING (user_id = auth.uid());
