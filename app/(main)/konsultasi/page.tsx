import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PatientChatDashboard } from "@/components/konsultasi/PatientChatDashboard";

export const dynamic = 'force-dynamic';

export default async function KonsultasiPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-6xl">
      <div className="max-w-2xl mb-12">
        <p className="text-sm font-bold text-teal-600 tracking-widest uppercase mb-4">Konsultasi</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
          Pilih Bidan Kepercayaan Anda
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Punya keluhan atau ragu memilih alat kontrasepsi? Pilih bidan dari daftar di bawah dan konsultasikan secara online tanpa harus pergi ke klinik.
        </p>
      </div>

      <PatientChatDashboard userId={user?.id || null} />
      
    </div>
  );
}
