CREATE TABLE public.server_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'online' CHECK (status IN ('online','offline','vedligeholdelse')),
  message text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.server_status TO anon;
GRANT SELECT ON public.server_status TO authenticated;
GRANT ALL ON public.server_status TO service_role;

ALTER TABLE public.server_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alle kan læse serverstatus"
ON public.server_status FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Staff kan opdatere serverstatus"
ON public.server_status FOR UPDATE TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

INSERT INTO public.server_status (status, message) VALUES
('online', 'Serveren kører normalt. God fornøjelse i byen.');

CREATE TABLE public.maintenance_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.maintenance_windows TO anon;
GRANT SELECT ON public.maintenance_windows TO authenticated;
GRANT ALL ON public.maintenance_windows TO service_role;

ALTER TABLE public.maintenance_windows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alle kan læse vedligeholdelse"
ON public.maintenance_windows FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Staff kan oprette vedligeholdelse"
ON public.maintenance_windows FOR INSERT TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff kan opdatere vedligeholdelse"
ON public.maintenance_windows FOR UPDATE TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff kan slette vedligeholdelse"
ON public.maintenance_windows FOR DELETE TO authenticated
USING (public.is_staff(auth.uid()));