CREATE TABLE public.whitelist_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_name text NOT NULL CHECK (char_length(discord_name) BETWEEN 2 AND 64),
  age int NOT NULL CHECK (age BETWEEN 13 AND 99),
  character_name text NOT NULL CHECK (char_length(character_name) BETWEEN 2 AND 80),
  backstory text NOT NULL CHECK (char_length(backstory) BETWEEN 50 AND 4000),
  rp_experience text CHECK (char_length(rp_experience) <= 2000),
  read_rules boolean NOT NULL CHECK (read_rules),
  status text NOT NULL DEFAULT 'afventer',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.whitelist_applications TO anon, authenticated;
GRANT ALL ON public.whitelist_applications TO service_role;
ALTER TABLE public.whitelist_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alle kan sende ansøgning" ON public.whitelist_applications
  FOR INSERT TO anon, authenticated WITH CHECK (status = 'afventer');