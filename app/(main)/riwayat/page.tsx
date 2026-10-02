import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RiwayatForm } from "@/components/riwayat/RiwayatForm";
import { Circle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function RiwayatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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

          <div className="space-y-8 relative">
            {!records || records.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center ml-8">
                <p className="text-slate-500">Belum ada catatan riwayat atau keluhan.</p>
              </div>
            ) : (
              records.map((record: any) => {
                const dateObj = new Date(record.visit_date);
                const dateStr = dateObj.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
                
                // Logika membedakan tampilan badge berdasarkan isi database
                const isKeluhan = record.facility_name === "Keluhan";
                const isKonsultasi = record.facility_name === "Konsultasi";
                
                let badgeType = "Layanan";
                let badgeStyle = "bg-blue-50 text-blue-600";
                let iconColor = "text-blue-500 fill-blue-500";
                let subtitle = record.facility_name;

                if (isKeluhan) {
                  badgeType = "Keluhan";
                  badgeStyle = "bg-teal-50 text-teal-600";
                  iconColor = "text-teal-500 fill-teal-500";
                  subtitle = "Catatan pribadi";
                } else if (isKonsultasi) {
                  badgeType = "Konsultasi";
                  badgeStyle = "bg-teal-50 text-teal-600";
                  iconColor = "text-teal-500 fill-teal-500";
                }

                return (
                  <div key={record.id} className="flex gap-4 md:gap-6 group">
                    <div className="relative mt-2 shrink-0">
                      <Circle className={`h-6 w-6 bg-slate-50 rounded-full transition-transform group-hover:scale-110 ${iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm font-bold text-slate-900">{dateStr}</span>
                        <span className={`${badgeStyle} px-2.5 py-0.5 rounded-full text-xs font-bold`}>
                          {badgeType}
                        </span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{record.contraceptive}</h3>
                        <p className="text-sm text-slate-500 mb-3">{subtitle}</p>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{record.notes}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Form (Client Component) */}
        <div className="lg:col-span-2">
          <RiwayatForm userId={user.id} />
        </div>
      </div>
    </div>
  );
}
