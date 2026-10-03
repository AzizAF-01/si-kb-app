"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Circle, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function RiwayatList({ initialRecords }: { initialRecords: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit Form States
  const [editDate, setEditDate] = useState("");
  const [editType, setEditType] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleEditClick = (record: any) => {
    // Format tanggal ke YYYY-MM-DD untuk input date
    const dateObj = new Date(record.visit_date);
    const dateFormatted = dateObj.toISOString().split('T')[0];

    setEditDate(dateFormatted);
    setEditType(record.facility_name);
    setEditTitle(record.contraceptive);
    setEditNotes(record.notes || "");
    setEditingId(record.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id: string) => {
    if (!editDate || !editTitle) return;
    setLoading(true);

    const { error } = await supabase.from("health_records").update({
      visit_date: editDate,
      facility_name: editType,
      contraceptive: editTitle,
      notes: editNotes,
    }).eq("id", id);

    if (!error) {
      setEditingId(null);
      router.refresh();
    } else {
      alert("Gagal memperbarui catatan: " + error.message);
    }
    
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan riwayat ini?")) return;
    setDeletingId(id);
    
    const { error } = await supabase.from("health_records").delete().eq("id", id);
    
    if (!error) {
      router.refresh();
    } else {
      alert("Gagal menghapus: " + error.message);
    }
    setDeletingId(null);
  };

  if (!initialRecords || initialRecords.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center ml-8">
        <p className="text-slate-500">Belum ada catatan riwayat atau keluhan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {initialRecords.map((record: any) => {
        const isEditing = editingId === record.id;
        
        const dateObj = new Date(record.visit_date);
        const dateStr = dateObj.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
        
        // Logika membedakan tampilan badge berdasarkan isi database
        const isKeluhan = record.facility_name === "Keluhan";
        const isKonsultasi = record.facility_name === "Konsultasi";
        
        let badgeType = "Layanan";
        let badgeStyle = "bg-blue-50 text-blue-600 border-blue-100";
        let iconColor = "text-blue-500 fill-blue-500";
        let subtitle = record.facility_name;

        if (isKeluhan) {
          badgeType = "Keluhan";
          badgeStyle = "bg-teal-50 text-teal-600 border-teal-100";
          iconColor = "text-teal-500 fill-teal-500";
          subtitle = "Catatan pribadi";
        } else if (isKonsultasi) {
          badgeType = "Konsultasi";
          badgeStyle = "bg-teal-50 text-teal-600 border-teal-100";
          iconColor = "text-teal-500 fill-teal-500";
        }

        return (
          <div key={record.id} className="flex gap-4 md:gap-6 group">
            <div className="relative mt-2 shrink-0">
              <Circle className={`h-6 w-6 bg-slate-50 rounded-full transition-transform group-hover:scale-110 ${iconColor}`} />
            </div>
            
            <div className="flex-1">
              {!isEditing ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">{dateStr}</span>
                      <span className={`${badgeStyle} px-2.5 py-0.5 rounded-full text-xs font-bold border`}>
                        {badgeType}
                      </span>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(record)} className="h-7 px-2 text-slate-400 hover:text-slate-700">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" disabled={deletingId === record.id} onClick={() => handleDelete(record.id)} className="h-7 px-2 text-slate-400 hover:text-red-600">
                        {deletingId === record.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{record.contraceptive}</h3>
                    <p className="text-sm text-slate-500 mb-3">{subtitle}</p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{record.notes}</p>
                  </div>
                </>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900">Edit Catatan</h3>
                    <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-7 px-2 text-slate-500">
                      <X className="h-4 w-4 mr-1" /> Batal
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal</label>
                        <input 
                          type="date" 
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                        <select 
                          value={editType}
                          onChange={(e) => setEditType(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Keluhan">Keluhan</option>
                          <option value="Layanan KB">Layanan KB</option>
                          <option value="Konsultasi">Konsultasi</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Judul</label>
                      <input 
                        type="text" 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Catatan</label>
                      <textarea 
                        rows={3}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      ></textarea>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button onClick={() => handleUpdate(record.id)} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2 font-bold">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Simpan Perubahan
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
