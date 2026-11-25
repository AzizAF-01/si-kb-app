-- ==========================================================
-- SKRIP SETUP / SEED UNTUK TABEL CONTRACEPTIVES YANG SUDAH ADA
-- Jalankan di SQL Editor dashboard Supabase Anda.
-- ==========================================================

-- 1. Pastikan Row Level Security (RLS) diaktifkan
ALTER TABLE public.contraceptives ENABLE ROW LEVEL SECURITY;

-- 2. Kebijakan Keamanan (RLS Policy): Pengunjung publik dapat membaca data
DROP POLICY IF EXISTS "Allow public read access on contraceptives" ON public.contraceptives;
CREATE POLICY "Allow public read access on contraceptives"
  ON public.contraceptives
  FOR SELECT
  USING (true);

-- 3. Kebijakan Keamanan (RLS Policy): Hanya Super Admin yang dapat menambah, mengubah, dan menghapus
DROP POLICY IF EXISTS "Allow admin full access on contraceptives" ON public.contraceptives;
CREATE POLICY "Allow admin full access on contraceptives"
  ON public.contraceptives
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 4. Masukkan Data Awal (Hanya jika belum ada dengan nama yang sama)
INSERT INTO public.contraceptives (
  name, category, how_it_works, benefits, side_effects, effectiveness, duration, suitable_for
)
SELECT 
  'Pil KB', 
  'Hormonal', 
  'Diminum setiap hari pada jam yang sama untuk mencegah pelepasan sel telur.', 
  ARRAY['Mudah digunakan', 'Siklus haid lebih teratur', 'Kesuburan cepat kembali setelah berhenti'], 
  ARRAY['Mual ringan', 'Perubahan pola haid', 'Nyeri payudara'], 
  99.0, 
  'Harian', 
  'Wanita yang disiplin minum obat rutin setiap hari'
WHERE NOT EXISTS (SELECT 1 FROM public.contraceptives WHERE name = 'Pil KB');

INSERT INTO public.contraceptives (
  name, category, how_it_works, benefits, side_effects, effectiveness, duration, suitable_for
)
SELECT 
  'Suntik KB', 
  'Hormonal', 
  'Suntikan progestin atau kombinasi secara berkala di faskes untuk mencegah ovulasi.', 
  ARRAY['Praktis tidak perlu minum tiap hari', 'Efektif mencegah kehamilan', 'Ada opsi 1 bulan & 3 bulan'], 
  ARRAY['Haid tidak teratur / flek', 'Kenaikan berat badan ringan'], 
  99.0, 
  '1 atau 3 bulan', 
  'Ibu menyusui (khusus suntik 3 bulan progestin) atau wanita yang ingin praktis'
WHERE NOT EXISTS (SELECT 1 FROM public.contraceptives WHERE name = 'Suntik KB');

INSERT INTO public.contraceptives (
  name, category, how_it_works, benefits, side_effects, effectiveness, duration, suitable_for
)
SELECT 
  'Kondom', 
  'Non-Hormonal', 
  'Pelindung lateks sekali pakai yang menghalangi sperma masuk ke rahim.', 
  ARRAY['Mencegah Infeksi Menular Seksual (IMS)', 'Tanpa pengaruh hormon', 'Mudah didapat'], 
  ARRAY['Jarang; potensi alergi lateks'], 
  98.0, 
  'Sekali pakai', 
  'Pria / pasangan yang membutuhkan proteksi ganda termasuk terhadap IMS'
WHERE NOT EXISTS (SELECT 1 FROM public.contraceptives WHERE name = 'Kondom');

INSERT INTO public.contraceptives (
  name, category, how_it_works, benefits, side_effects, effectiveness, duration, suitable_for
)
SELECT 
  'Metode Kalender', 
  'Non-Hormonal', 
  'Menghindari hubungan seksual tanpa pengaman pada masa subur (ovulasi).', 
  ARRAY['Alami tanpa biaya & obat', 'Bebas dari efek samping medis'], 
  ARRAY['Tidak ada efek samping fisik'], 
  88.0, 
  'Setiap siklus', 
  'Pasangan dengan siklus haid yang sangat teratur dan komitmen tinggi'
WHERE NOT EXISTS (SELECT 1 FROM public.contraceptives WHERE name = 'Metode Kalender');

INSERT INTO public.contraceptives (
  name, category, how_it_works, benefits, side_effects, effectiveness, duration, suitable_for
)
SELECT 
  'IUD (Spiral)', 
  'MKJP', 
  'Alat kecil fleksibel dimasukkan ke dalam rahim untuk mencegah pembuahan sel telur.', 
  ARRAY['Sangat efektif jangka panjang', 'Tidak mengganggu laktasi', 'Bebas hormon (khusus Tembaga)'], 
  ARRAY['Kram atau perdarahan haid lebih banyak di awal pemasangan'], 
  99.4, 
  '5–10 tahun', 
  'Pasangan yang ingin menunda atau menyudahi kehamilan bertahun-tahun'
WHERE NOT EXISTS (SELECT 1 FROM public.contraceptives WHERE name = 'IUD (Spiral)');

INSERT INTO public.contraceptives (
  name, category, how_it_works, benefits, side_effects, effectiveness, duration, suitable_for
)
SELECT 
  'Implan (Susuk)', 
  'MKJP', 
  'Batang kecil lentur dipasang di bawah kulit lengan atas yang melepas hormon secara bertahap.', 
  ARRAY['Perlindungan hingga 3 tahun', 'Aman bagi ibu menyusui', 'Praktis tanpa repot'], 
  ARRAY['Bercak darah (spotting)', 'Perubahan pola menstruasi'], 
  99.5, 
  '3 tahun', 
  'Wanita yang menginginkan perlindungan jangka menengah tanpa harus ingat minum obat'
WHERE NOT EXISTS (SELECT 1 FROM public.contraceptives WHERE name = 'Implan (Susuk)');
