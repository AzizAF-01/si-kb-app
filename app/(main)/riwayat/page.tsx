import { createClient } from "@/lib/supabase/server";
import { RiwayatForm } from "@/components/riwayat/RiwayatForm";
import { RiwayatList } from "@/components/riwayat/RiwayatList";
import { Circle, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function RiwayatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-6xl">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-bold text-teal-600 tracking-widest uppercase mb-4">Riwayat Saya</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            Catatan perjalanan KB Anda
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Semua layanan yang pernah Anda terima dan keluhan yang Anda catat, tersimpan rapi dan hanya bisa dilihat oleh Anda.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="bg-blue-100 p-4 rounded-full mb-6 text-blue-600">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Login Diperlukan</h2>
          <p className="text-slate-600 max-w-md mx-auto mb-8">
            Riwayat Anda bersifat sangat rahasia dan aman. Silakan masuk ke akun Anda terlebih dahulu untuk mengakses atau mencatat riwayat KB secara personal.
          </p>
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 font-bold rounded-lg transition-colors">
              Masuk Sekarang
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Mengambil daftar riwayat (Layanan/Konsultasi/Keluhan)
  const { data: records } = await supabase
    .from("health_records")
    .select("*")
    .eq("user_id", user.id)
    .order("visit_date", { ascending: false });

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-6xl">
      <div className="max-w-2xl mb-12">
        <p className="text-sm font-bold text-teal-600 tracking-widest uppercase mb-4">Riwayat Saya</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
          Catatan perjalanan KB Anda
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Semua layanan yang pernah Anda terima dan keluhan yang Anda catat, tersimpan rapi dan hanya bisa dilihat oleh Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">
        {/* Left Column: Timeline */}
        <div className="lg:col-span-3 relative">
          <div className="absolute left-3 top-2 bottom-6 w-0.5 bg-slate-200"></div>
          <RiwayatList initialRecords={records || []} />
        </div>

        {/* Right Column: Form (Client Component) */}
        <div className="lg:col-span-2">
          <RiwayatForm userId={user.id} />
        </div>
      </div>
    </div>
  );
}
