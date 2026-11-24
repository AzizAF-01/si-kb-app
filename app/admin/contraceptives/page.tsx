import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Pill } from "lucide-react";
import { ContraceptiveManagement } from "@/components/admin/ContraceptiveManagement";

export const dynamic = 'force-dynamic';

export default async function AdminContraceptivesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Ambil semua data kontrasepsi dari tabel contraceptives
  const { data: contraceptives, error } = await supabase
    .from("contraceptives")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Gagal mengambil data kontrasepsi:", error.message);
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Kelola Kontrasepsi</h1>
        <p className="text-sm text-slate-600">
          Buat, perbarui, dan hapus metode kontrasepsi, cara kerja, manfaat, efektivitas, dan efek samping untuk edukasi publik.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <Pill className="h-5 w-5 text-slate-700" />
          <h2 className="font-semibold text-slate-800">Manajemen Kontrasepsi</h2>
        </div>
        <div className="p-6">
          <ContraceptiveManagement initialContraceptives={contraceptives || []} />
        </div>
      </div>
    </div>
  );
}
