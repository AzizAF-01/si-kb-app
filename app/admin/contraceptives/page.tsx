import { createClient } from "@/lib/supabase/server";
import { Pill } from "lucide-react";
import { ContraceptiveManagement } from "@/components/admin/ContraceptiveManagement";
import { extractContraceptiveHeader } from "@/lib/contraceptive-header";

export const dynamic = 'force-dynamic';

export default async function AdminContraceptivesPage() {
  const supabase = await createClient();

  // Ambil semua data kontrasepsi (autentikasi & otorisasi role admin sudah divalidasi oleh layout)
  const { data: contraceptives, error } = await supabase
    .from("contraceptives")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Gagal mengambil data kontrasepsi:", error.message);
  }

  const { header, cleanedRows } = extractContraceptiveHeader(contraceptives);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Kelola Kontrasepsi</h1>
        <p className="text-sm text-slate-600">
          Buat, perbarui, dan hapus metode kontrasepsi, kelompok kategori, dan teks header edukasi untuk halaman publik.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <Pill className="h-5 w-5 text-slate-700" />
          <h2 className="font-semibold text-slate-800">Manajemen Kontrasepsi</h2>
        </div>
        <div className="p-6">
          <ContraceptiveManagement
            initialContraceptives={cleanedRows}
            initialHeader={header}
          />
        </div>
      </div>
    </div>
  );
}
