"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2, X } from "lucide-react";

export function ArticleManagement({ initialArticles }: { initialArticles: any[] }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Keluarga Berencana");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1584982751601-97d8cb0f6669?q=80&w=800&auto=format&fit=crop");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const resetForm = () => {
    setTitle("");
    setContent("");
    setImageUrl("https://images.unsplash.com/photo-1584982751601-97d8cb0f6669?q=80&w=800&auto=format&fit=crop");
    setCategory("Keluarga Berencana");
    setEditingId(null);
  };

  const handleEditClick = (article: any) => {
    setTitle(article.title);
    setCategory(article.category);
    setContent(article.content || "");
    setImageUrl(article.image_url || "");
    setEditingId(article.id);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Hapus artikel ini secara permanen?")) return;
    
    setDeletingId(id);
    const { error } = await supabase.from("articles").delete().eq("id", id);
    
    if (!error) {
      router.refresh();
    } else {
      alert("Gagal menghapus: " + error.message);
    }
    setDeletingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setLoading(true);

    const articleData = { title, category, content, image_url: imageUrl };

    let error;
    if (editingId) {
      // Edit mode
      const res = await supabase.from("articles").update(articleData).eq("id", editingId);
      error = res.error;
    } else {
      // Create mode
      const res = await supabase.from("articles").insert(articleData);
      error = res.error;
    }

    if (!error) {
      alert(editingId ? "Artikel berhasil diperbarui!" : "Artikel berhasil diterbitkan!");
      resetForm();
      router.refresh();
    } else {
      alert("Gagal menyimpan artikel: " + error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Daftar Artikel (Sebelah Kiri) */}
      <div className="lg:col-span-5 space-y-3 max-h-[700px] overflow-y-auto pr-2">
        {initialArticles?.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-slate-300 rounded-lg text-slate-500">
            <p className="font-medium text-slate-700 mb-1">Belum ada artikel</p>
            <p className="text-sm">Gunakan form di sebelah kanan untuk menulis.</p>
          </div>
        ) : (
          initialArticles?.map((a: any) => (
            <div key={a.id} className={`p-4 border rounded-lg flex flex-col transition-colors ${
              editingId === a.id ? 'border-red-400 bg-red-50/30' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}>
              <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-2">{a.title}</h3>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-medium bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600 w-fit">
                    {a.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditClick(a)}
                    className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
                  >
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={deletingId === a.id}
                    onClick={() => handleDeleteClick(a.id)}
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                  >
                    {deletingId === a.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Tambah / Edit (Sebelah Kanan) */}
      <div className="lg:col-span-7">
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-5 relative sticky top-6">
          {editingId && (
            <div className="absolute top-5 right-5">
              <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="text-slate-500 hover:text-slate-800 hover:bg-slate-200 h-8">
                <X className="h-4 w-4 mr-1.5" /> Batal Edit
              </Button>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-slate-900 text-lg">
              {editingId ? "Edit Artikel" : "Tulis Artikel Baru"}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {editingId ? "Perbarui informasi di bawah dan simpan." : "Isi form ini untuk menerbitkan materi edukasi baru."}
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Judul Artikel</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Contoh: Mitos & Fakta seputar Pil KB" 
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              >
                <option value="Keluarga Berencana">Keluarga Berencana</option>
                <option value="Kesehatan Ibu">Kesehatan Ibu</option>
                <option value="Alat Kontrasepsi">Alat Kontrasepsi</option>
                <option value="Gaya Hidup">Gaya Hidup</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">URL Gambar Cover</label>
              <input 
                type="text" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Konten Utama</label>
            <textarea 
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Tuliskan isi artikel Anda di sini..." 
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-y"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-8 py-2 font-semibold transition-colors"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Publikasikan Artikel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
