CREATE TABLE public.rule_sections (
  id text PRIMARY KEY,
  title text NOT NULL,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id text NOT NULL REFERENCES public.rule_sections(id) ON DELETE CASCADE ON UPDATE CASCADE,
  number text NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  sort integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX rules_section_idx ON public.rules(section_id, sort);
GRANT SELECT ON public.rule_sections, public.rules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rule_sections, public.rules TO authenticated;
GRANT ALL ON public.rule_sections, public.rules TO service_role;
ALTER TABLE public.rule_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alle læser regelkategorier" ON public.rule_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Alle læser regler" ON public.rules FOR SELECT TO anon, authenticated USING (true);