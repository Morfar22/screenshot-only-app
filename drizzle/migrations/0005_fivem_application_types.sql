CREATE TABLE public.application_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_types TO authenticated;
GRANT ALL ON public.application_types TO service_role;
ALTER TABLE public.application_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff ser ansøgningstyper" ON public.application_types FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff opretter ansøgningstyper" ON public.application_types FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff ændrer ansøgningstyper" ON public.application_types FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff sletter ansøgningstyper" ON public.application_types FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.ingame_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id uuid NOT NULL REFERENCES public.application_types(id) ON DELETE CASCADE,
  fivem_identifier text NOT NULL,
  player_name text NOT NULL DEFAULT '',
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'afventer' CHECK (status IN ('afventer','godkendt','afvist')),
  staff_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ingame_applications_identifier_idx ON public.ingame_applications(fivem_identifier);
GRANT SELECT, UPDATE, DELETE ON public.ingame_applications TO authenticated;
GRANT ALL ON public.ingame_applications TO service_role;
ALTER TABLE public.ingame_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff ser spilansøgninger" ON public.ingame_applications FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff behandler spilansøgninger" ON public.ingame_applications FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff sletter spilansøgninger" ON public.ingame_applications FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.fivem_app_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fivem_app_keys TO authenticated;
GRANT ALL ON public.fivem_app_keys TO service_role;
ALTER TABLE public.fivem_app_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin ser FiveM-nøgle" ON public.fivem_app_keys FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.fivem_app_keys DEFAULT VALUES;