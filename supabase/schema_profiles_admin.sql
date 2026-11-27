-- ==========================================================
-- SKRIP PERBAIKAN IZIN & RLS TABEL PROFILES UNTUK ADMIN
-- Jalankan di SQL Editor dashboard Supabase Anda.
-- ==========================================================

-- 1. Berikan hak akses skema & tabel ke service_role, authenticated, dan anon
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO authenticated, service_role;
GRANT SELECT ON TABLE public.profiles TO anon;

-- Berikan juga akses service_role ke seluruh tabel di schema public agar Admin API tidak terkendala
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- 2. Pastikan constraint role pada tabel profiles mendukung 'perawat'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'perawat', 'bidan', 'nakes', 'admin'));

-- 3. Fungsi helper SECURITY DEFINER untuk mengecek status Admin tanpa memicu rekursi RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 4. Pastikan RLS aktif pada tabel profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Kebijakan RLS: Semua orang bisa membaca profil (diperlukan untuk daftar perawat & konsultasi)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 6. Kebijakan RLS: Pengguna dapat mengedit profilnya sendiri
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7. Kebijakan RLS: Admin dapat menambah, mengubah, dan menghapus profil pengguna mana pun
DROP POLICY IF EXISTS "Allow admin full access on profiles" ON public.profiles;
CREATE POLICY "Allow admin full access on profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
