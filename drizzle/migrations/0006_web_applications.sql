-- Mark where an application came from (fivem app or website)
ALTER TABLE public.ingame_applications
  ADD COLUMN source text NOT NULL DEFAULT 'fivem';

-- Website visitors may read open application types
CREATE POLICY "Alle ser åbne ansøgningstyper"
ON public.application_types
FOR SELECT
TO anon, authenticated
USING (is_open = true);

-- Website visitors may submit an application (always starts as afventer)
CREATE POLICY "Alle kan sende spilansøgning"
ON public.ingame_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'afventer');