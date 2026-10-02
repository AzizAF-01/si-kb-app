import { Building, MapPin, Clock, Stethoscope } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function JadwalLayananPage() {
  const supabase = await createClient();
  
  // Mengambil data fasilitas dari tabel 'facilities' di Supabase
  const { data: facilities, error } = await supabase
    .from("facilities")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-6xl">
      <div className="max-w-2xl mb-12">
        <p className="text-sm font-bold text-teal-600 tracking-widest uppercase mb-4">Jadwal Layanan</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
          Temukan layanan KB di dekat Anda
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Daftar Puskesmas, Posyandu, klinik, dan praktik bidan beserta alamat dan jam layanannya. Datang sesuai jadwal agar Anda dilayani dengan nyaman.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8">
          Gagal memuat data fasilitas: {error.message}
        </div>
      )}

      {!facilities || facilities.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
          <p className="text-slate-500">Belum ada data fasilitas layanan yang tersedia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {facilities.map((facility: any) => (
            <div key={facility.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md hover:border-teal-100 transition-all duration-300">
              <div className="bg-teal-50 text-teal-600 h-16 w-16 rounded-2xl flex items-center justify-center shrink-0">
                <Building className="h-8 w-8" />
              </div>
              
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full mb-3 capitalize">
                  {facility.type}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{facility.name}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-slate-600 text-sm">
                    <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
                    <span>{facility.address}</span>
                  </div>
                  <div className="flex items-start gap-3 text-slate-600 text-sm">
                    <Clock className="h-5 w-5 shrink-0 text-slate-400" />
                    {/* Schedule di-parse dari JSONB */}
                    <span>{facility.schedule?.text || "Hubungi fasilitas"}</span>
                  </div>
                  <div className="flex items-start gap-3 text-slate-600 text-sm">
                    <Stethoscope className="h-5 w-5 shrink-0 text-slate-400" />
                    {/* Services berupa Array disatukan dengan koma */}
                    <span>{facility.services ? facility.services.join(", ") : "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
