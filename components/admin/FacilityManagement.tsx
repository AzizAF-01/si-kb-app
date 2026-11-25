"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Edit, 
  Trash2, 
  X, 
  MapPin, 
  Clock, 
  Building, 
  LayoutTemplate, 
  Check, 
  ExternalLink 
} from "lucide-react";
import {
  FacilityHeaderConfig,
  DEFAULT_FACILITY_HEADER,
} from "@/lib/facility-header";
import { saveFacilityHeader } from "@/app/actions/admin";

export function FacilityManagement({
  initialFacilities,
  initialHeader,
}: {
  initialFacilities: any[];
  initialHeader?: FacilityHeaderConfig;
}) {
  // Tab Utama: "facilities" | "header"
  const [activeTab, setActiveTab] = useState<"facilities" | "header">("facilities");

  // =========================================================
  // STATE TAB HEADER HALAMAN JADWAL LAYANAN
  // =========================================================
  const [headerBadge, setHeaderBadge] = useState(
    initialHeader?.badge || DEFAULT_FACILITY_HEADER.badge
  );
  const [headerTitle, setHeaderTitle] = useState(
    initialHeader?.title || DEFAULT_FACILITY_HEADER.title
  );
  const [headerDescription, setHeaderDescription] = useState(
    initialHeader?.description || DEFAULT_FACILITY_HEADER.description
  );
  const [savingHeader, setSavingHeader] = useState(false);
  const [headerMessage, setHeaderMessage] = useState<{
    type: "success" | "error" | "";
    text: string;
  }>({ type: "", text: "" });

  // =========================================================
  // STATE FASILITAS / LAYANAN
  // =========================================================
  const [name, setName] = useState("");
  const [type, setType] = useState("puskesmas");
  const [address, setAddress] = useState("");
  const [scheduleText, setScheduleText] = useState("");
  const [servicesText, setServicesText] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const resetForm = () => {
    setName("");
    setType("puskesmas");
    setAddress("");
    setScheduleText("");
    setServicesText("");
    setEditingId(null);
  };

  const handleEditClick = (facility: any) => {
    setName(facility.name);
    setType(facility.type);
    setAddress(facility.address || "");
    setScheduleText(facility.schedule?.text || "");
    setServicesText(facility.services ? facility.services.join(", ") : "");
    setEditingId(facility.id);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Hapus fasilitas ini secara permanen?")) return;
    
    setDeletingId(id);
    const { error } = await supabase.from("facilities").delete().eq("id", id);
    
    if (!error) {
      router.refresh();
    } else {
      alert("Gagal menghapus: " + error.message);
    }
    setDeletingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;
    setLoading(true);

    const facilityData = { 
      name, 
      type, 
      address, 
      schedule: scheduleText ? { text: scheduleText } : null,
      services: servicesText ? servicesText.split(",").map(s => s.trim()).filter(Boolean) : []
    };

    let error;
    if (editingId) {
      // Edit mode
      const res = await supabase.from("facilities").update(facilityData).eq("id", editingId);
      error = res.error;
    } else {
      // Create mode
      const res = await supabase.from("facilities").insert(facilityData);
      error = res.error;
    }

    if (!error) {
      alert(editingId ? "Fasilitas berhasil diperbarui!" : "Fasilitas berhasil ditambahkan!");
      resetForm();
      router.refresh();
    } else {
      alert("Gagal menyimpan data: " + error.message);
    }
    
    setLoading(false);
  };

  // =========================================================
  // HANDLER SIMPAN / RESET HEADER JADWAL LAYANAN
  // =========================================================
  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headerTitle.trim()) {
      alert("Judul utama halaman tidak boleh kosong.");
      return;
    }

    setSavingHeader(true);
    setHeaderMessage({ type: "", text: "" });

    try {
      const res = await saveFacilityHeader({
        badge: headerBadge,
        title: headerTitle,
        description: headerDescription,
      });

      if (res?.error) {
        setHeaderMessage({ type: "error", text: res.error });
      } else {
        setHeaderMessage({
          type: "success",
          text: "Teks header halaman Jadwal Layanan berhasil diperbarui!",
        });
        router.refresh();
      }
    } catch (err: unknown) {
      setHeaderMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan perubahan header.",
      });
    } finally {
      setSavingHeader(false);
    }
  };

  const handleResetHeaderToDefault = () => {
    if (!confirm("Kembalikan teks header ke susunan teks bawaan (default)?")) return;
    setHeaderBadge(DEFAULT_FACILITY_HEADER.badge);
    setHeaderTitle(DEFAULT_FACILITY_HEADER.title);
    setHeaderDescription(DEFAULT_FACILITY_HEADER.description);
    setHeaderMessage({ type: "", text: "" });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab("facilities")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "facilities"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building className="h-4 w-4 text-teal-600" />
            <span>Daftar & Tambah Layanan</span>
            <span className="ml-1 bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {initialFacilities?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("header")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "header"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutTemplate className="h-4 w-4 text-teal-600" />
            <span>Header Halaman Jadwal Layanan</span>
          </button>
        </div>

        {activeTab === "header" && (
          <a
            href="/jadwal-layanan"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors"
          >
            Lihat Halaman Publik <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DAFTAR & FORM FASILITAS */}
      {/* ========================================================= */}
      {activeTab === "facilities" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Daftar Fasilitas (Sebelah Kiri) */}
          <div className="lg:col-span-6 space-y-3 max-h-[700px] overflow-y-auto pr-2">
            {initialFacilities?.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-slate-300 rounded-lg text-slate-500">
                <p className="font-medium text-slate-700 mb-1">Belum ada fasilitas</p>
                <p className="text-sm">Gunakan form di sebelah kanan untuk menambahkan.</p>
              </div>
            ) : (
              initialFacilities?.map((f: any) => (
                <div key={f.id} className={`p-4 border rounded-lg flex flex-col transition-colors ${
                  editingId === f.id ? 'border-red-400 bg-red-50/30' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800 text-sm">{f.name}</h3>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded capitalize shrink-0 ml-2">
                      {f.type}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mb-4">
                    <div className="flex items-start gap-1.5 text-xs text-slate-600">
                      <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
                      <span className="line-clamp-1">{f.address}</span>
                    </div>
                    {f.schedule?.text && (
                      <div className="flex items-start gap-1.5 text-xs text-slate-600">
                        <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
                        <span className="line-clamp-1">{f.schedule.text}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end mt-auto gap-1.5 shrink-0 pt-2 border-t border-slate-100">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditClick(f)}
                      className="h-7 px-3 text-xs text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
                    >
                      <Edit className="h-3 w-3 mr-1.5" /> Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={deletingId === f.id}
                      onClick={() => handleDeleteClick(f.id)}
                      className="h-7 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                    >
                      {deletingId === f.id ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Trash2 className="h-3 w-3 mr-1.5" />} Hapus
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form Tambah / Edit (Sebelah Kanan) */}
          <div className="lg:col-span-6">
            <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-5 relative sticky top-6">
              {editingId && (
                <div className="absolute top-5 right-5">
                  <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="text-slate-500 hover:text-slate-800 hover:bg-slate-200 h-8">
                    <X className="h-4 w-4 mr-1.5" /> Batal
                  </Button>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-slate-900 text-lg">
                  {editingId ? "Edit Layanan" : "Tambah Layanan Baru"}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Data ini akan ditampilkan di halaman Jadwal Layanan Publik.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Fasilitas/Perawat</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Puskesmas Maju Jaya" 
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Layanan</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  >
                    <option value="puskesmas">Puskesmas</option>
                    <option value="posyandu">Posyandu</option>
                    <option value="klinik">Klinik</option>
                    <option value="perawat">Perawat Mandiri</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Alamat Lengkap</label>
                <textarea 
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Jl. Kesehatan No. 123..." 
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Jadwal Operasional</label>
                <input 
                  type="text" 
                  value={scheduleText}
                  onChange={(e) => setScheduleText(e.target.value)}
                  placeholder="Senin - Jumat, 08:00 - 14:00" 
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Layanan yang Tersedia (Pisahkan dengan koma)</label>
                <input 
                  type="text" 
                  value={servicesText}
                  onChange={(e) => setServicesText(e.target.value)}
                  placeholder="Suntik KB, Pil KB, Konsultasi, IUD" 
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-8 py-2 font-semibold transition-colors"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {loading ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Tambahkan Data")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: EDIT HEADER HALAMAN JADWAL LAYANAN */}
      {/* ========================================================= */}
      {activeTab === "header" && (
        <div className="space-y-6">
          {headerMessage.text && (
            <div
              className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
                headerMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              <span>{headerMessage.text}</span>
              <button
                type="button"
                onClick={() => setHeaderMessage({ type: "", text: "" })}
                className="text-xs font-bold underline ml-3"
              >
                Tutup
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Editor Header (Kiri: 7 Kolom) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Pengaturan Header Halaman Jadwal Layanan
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sesuaikan teks badge, judul utama, dan paragraf pengantar yang ditampilkan di halaman publik Jadwal Layanan.
                </p>
              </div>

              <form onSubmit={handleSaveHeader} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Teks Badge / Kategori Kecil
                  </label>
                  <input
                    type="text"
                    value={headerBadge}
                    onChange={(e) => setHeaderBadge(e.target.value)}
                    placeholder="Contoh: Jadwal Layanan"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Label kecil di atas judul utama halaman.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Judul Utama Halaman <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={headerTitle}
                    onChange={(e) => setHeaderTitle(e.target.value)}
                    required
                    placeholder="Contoh: Temukan layanan KB di dekat Anda"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-semibold text-slate-900"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Headline berukuran besar yang langsung dilihat masyarakat saat membuka halaman Jadwal Layanan.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Deskripsi / Teks Pengantar <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={headerDescription}
                    onChange={(e) => setHeaderDescription(e.target.value)}
                    required
                    placeholder="Tuliskan teks pengantar jadwal layanan..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 leading-relaxed text-slate-700"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Paragraf pengantar yang menjelaskan kemudahan mencari faskes dan jadwal layanan KB.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetHeaderToDefault}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs px-4"
                  >
                    Batal / Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={savingHeader}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-6 shadow-sm"
                  >
                    {savingHeader ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    ) : (
                      <Check className="h-4 w-4 mr-1.5" />
                    )}
                    {savingHeader ? "Menyimpan..." : "Simpan Perubahan Header"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Pratinjau Tampilan Publik (Kanan: 5 Kolom) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Pratinjau Langsung
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">
                    Tampilan Publik (/jadwal-layanan)
                  </span>
                </div>

                {/* Simulasi Tampilan Persis Halaman Publik */}
                <div className="p-5 bg-gradient-to-b from-slate-50/80 to-white rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-teal-600 tracking-widest uppercase mb-3">
                    {headerBadge || "JADWAL LAYANAN"}
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-3 leading-tight">
                    {headerTitle || "Temukan layanan KB di dekat Anda"}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {headerDescription || "Daftar Puskesmas, Posyandu, klinik, dan praktik perawat beserta alamat dan jam layanannya. Datang sesuai jadwal agar Anda dilayani dengan nyaman."}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Hasil perubahan tersimpan permanen di database.</span>
                  <a
                    href="/jadwal-layanan"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700"
                  >
                    Buka Tab Baru <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
