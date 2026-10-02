"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function RiwayatForm({ userId }: { userId: string }) {
  const [date, setDate] = useState("");
  const [keluhanType, setKeluhanType] = useState("Perubahan pola haid");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !notes) return;
    
    setLoading(true);

    const { error } = await supabase.from("health_records").insert({
      user_id: userId,
      visit_date: date,
      contraceptive: keluhanType, // Disimpan sebagai judul keluhan
      facility_name: "Keluhan", // Sebagai penanda tipe badge
      notes: notes,
    });

    if (!error) {
      setDate("");
      setKeluhanType("Perubahan pola haid");
      setNotes("");
      router.refresh(); 
    } else {
      alert("Gagal menyimpan keluhan: " + error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 sticky top-24">
      <div className="bg-teal-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
        <Edit3 className="h-6 w-6 text-teal-600" />
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 mb-2">Catat keluhan</h3>
      <p className="text-sm text-slate-600 mb-8">
        Tuliskan apa yang Anda rasakan. Catatan ini bisa Anda tunjukkan saat konsultasi.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1.5">Tanggal</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1.5">Jenis keluhan</label>
          <select 
            value={keluhanType}
            onChange={(e) => setKeluhanType(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_16px_center] bg-no-repeat pr-10"
          >
            <option value="Perubahan pola haid">Perubahan pola haid</option>
            <option value="Nyeri berlebih">Nyeri berlebih</option>
            <option value="Kenaikan berat badan">Kenaikan berat badan</option>
            <option value="Keluhan Lainnya">Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1.5">Ceritakan keluhan Anda</label>
          <textarea 
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
            placeholder="Contoh: sejak minggu lalu..." 
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          ></textarea>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 rounded-xl py-6 text-base font-semibold mt-2"
        >
          {loading ? "Menyimpan..." : "Simpan Catatan"}
        </Button>
      </form>
    </div>
  );
}
