import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Building } from "lucide-react";
import { FacilityManagement } from "@/components/admin/FacilityManagement";

export const dynamic = 'force-dynamic';

export default async function AdminFacilitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: facilities } = await supabase
    .from("facilities")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Jadwal & Fasilitas Layanan</h1>
        <p className="text-sm text-slate-600">Kelola daftar puskesmas, klinik, posyandu, atau bidan yang muncul di halaman Jadwal Layanan pengguna.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <Building className="h-5 w-5 text-slate-700" />
          <h2 className="font-semibold text-slate-800">Manajemen Fasilitas</h2>
        </div>
        <div className="p-6">
          <FacilityManagement initialFacilities={facilities || []} />
        </div>
      </div>
    </div>
  );
}
