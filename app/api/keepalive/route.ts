import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Supabase URL atau ANON KEY belum disetel di environment variables.',
      },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  try {
    const startTime = Date.now();
    // Request ringan ke database Supabase untuk mencatatkan aktivitas
    const { count, error } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });

    const latency = `${Date.now() - startTime}ms`;

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Koneksi ke Supabase bermasalah.',
          error: error.message,
          latency,
          timestamp: new Date().toISOString(),
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Supabase aktif dan terhubung (Keep-Alive berhasil).',
      articlesCount: count,
      latency,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Terjadi kesalahan saat memanggil Supabase.',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
