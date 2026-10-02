"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ReminderForm({ userId }: { userId: string }) {
  const [category, setCategory] = useState("Jadwal suntik KB");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    
    setLoading(true);

    // Menggabungkan tanggal dan waktu menjadi format ISO
    const remindAt = new Date(`${date}T${time}`).toISOString();

    const { error } = await supabase.from("reminders").insert({
      user_id: userId,
      title: category,
      category: category,
      remind_at: remindAt,
      note: note,
    });

    if (!error) {
      // Reset form setelah berhasil
      setCategory("Jadwal suntik KB");
      setDate("");
      setTime("");
      setNote("");
      router.refresh(); // Memuat ulang data di Server Component
    } else {
      alert("Gagal menyimpan pengingat: " + error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 sticky top-24">
      <div className="bg-teal-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
        <Bell className="h-6 w-6 text-teal-600" />
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 mb-2">Tambah pengingat</h3>
      <p className="text-sm text-slate-600 mb-8">
        Isi jenis dan waktu pengingat Anda.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1.5">Jenis pengingat</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_16px_center] bg-no-repeat pr-10"
          >
            <option value="Jadwal suntik KB">Jadwal suntik KB</option>
            <option value="Minum pil KB">Minum pil KB</option>
            <option value="Kunjungan ulang">Kunjungan ulang</option>
            <option value="Konseling">Konseling</option>
          </select>
        </div>

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
          <label className="block text-sm font-semibold text-slate-900 mb-1.5">Jam</label>
          <input 
            type="time" 
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1.5">Catatan</label>
          <input 
            type="text" 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Puskesmas Menteng, bawa kart..." 
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 rounded-xl py-6 text-base font-semibold mt-2"
        >
          {loading ? "Menyimpan..." : "Simpan Pengingat"}
        </Button>
      </form>
    </div>
  );
}
