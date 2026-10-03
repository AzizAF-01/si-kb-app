"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function ArticleForm() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Keluarga Berencana");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1584982751601-97d8cb0f6669?q=80&w=800&auto=format&fit=crop");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setLoading(true);

    const { error } = await supabase.from("articles").insert({
      title,
      category,
      content,
      image_url: imageUrl,
    });

    if (!error) {
      setTitle("");
      setContent("");
      alert("Artikel berhasil diterbitkan!");
      router.refresh();
    } else {
      alert("Gagal menyimpan artikel: " + error.message);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-6 space-y-4">
      <h3 className="font-bold text-slate-800 mb-4">Buat Artikel Baru</h3>
      
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Judul Artikel</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Mitos & Fakta seputar Pil KB" 
          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Kategori</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="Keluarga Berencana">Keluarga Berencana</option>
            <option value="Kesehatan Ibu">Kesehatan Ibu</option>
            <option value="Alat Kontrasepsi">Alat Kontrasepsi</option>
            <option value="Gaya Hidup">Gaya Hidup</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">URL Gambar</label>
          <input 
            type="text" 
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Konten Artikel</label>
        <textarea 
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          placeholder="Tulis isi artikel di sini..." 
          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
        ></textarea>
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 font-bold transition-colors"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Publikasikan Artikel"}
      </Button>
    </form>
  );
}
