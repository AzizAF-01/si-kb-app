"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2, X, MapPin, Clock } from "lucide-react";

export function FacilityManagement({ initialFacilities }: { initialFacilities: any[] }) {
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

  return (
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
  );
}
