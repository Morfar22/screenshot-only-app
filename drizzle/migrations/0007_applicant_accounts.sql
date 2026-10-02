ALTER TABLE public.ingame_applications ADD COLUMN user_id uuid;
CREATE INDEX ingame_applications_user_id_idx ON public.ingame_applications(user_id);
DROP POLICY IF EXISTS "Alle kan sende spilansøgning" ON public.ingame_applications;
CREATE POLICY "Ansøgere ser egne ansøgninger" ON public.ingame_applications FOR SELECT TO authenticated USING (user_id = auth.uid());