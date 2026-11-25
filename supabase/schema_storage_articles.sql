-- ==========================================================
-- SKRIP SETUP SUPABASE STORAGE: Bucket Gambar Artikel (CMS SI-KB)
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda.
-- ==========================================================

-- 1. Buat bucket publik bernama 'articles' di Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('articles', 'articles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Policy: Izinkan semua pengunjung (publik) melihat/memuat gambar artikel
DROP POLICY IF EXISTS "Public Access Articles Images" ON storage.objects;
CREATE POLICY "Public Access Articles Images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'articles');

-- 3. Policy: Izinkan pengguna terautentikasi (Admin) mengupload gambar ke bucket 'articles'
DROP POLICY IF EXISTS "Admin Upload Articles Images" ON storage.objects;
CREATE POLICY "Admin Upload Articles Images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'articles');

-- 4. Policy: Izinkan Admin memperbarui atau menghapus gambar di bucket 'articles'
DROP POLICY IF EXISTS "Admin Update Delete Articles Images" ON storage.objects;
CREATE POLICY "Admin Update Delete Articles Images"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'articles');
