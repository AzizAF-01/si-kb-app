import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rklylajusdnqrrtghtnh.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_IYto91kdijDeSf6Ng_olmg_ltqUs9P0';

console.log(`[Keep-Alive] Menghubungi Supabase di: ${url}...`);

const supabase = createClient(url, key, { auth: { persistSession: false } });

const startTime = Date.now();
const { count, error } = await supabase
  .from('articles')
  .select('*', { count: 'exact', head: true });

if (error) {
  console.error(`[Keep-Alive] GAGAL:`, error.message);
  process.exit(1);
} else {
  const elapsed = Date.now() - startTime;
  console.log(`[Keep-Alive] BERHASIL! Supabase aktif dan merespon.`);
  console.log(`[Keep-Alive] Total artikel: ${count} | Latensi: ${elapsed}ms | Waktu: ${new Date().toISOString()}`);
}
