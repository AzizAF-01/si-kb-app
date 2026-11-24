"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Edit,
  Trash2,
  X,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

const DEFAULT_COVER_URL =
  "https://images.unsplash.com/photo-1584982751601-97d8cb0f6669?q=80&w=800&auto=format&fit=crop";

/**
 * Mengekstrak path file di dalam bucket 'articles' dari URL publik Supabase Storage.
 */
function extractStoragePathFromUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const marker = "/storage/v1/object/public/articles/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

/**
 * Mengompresi file gambar di sisi client menjadi Data URL (JPEG)
 * sebagai fallback otomatis apabila bucket Supabase Storage belum tersedia.
 */
function compressImageToDataUrl(file: File, maxWidth = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error("Gagal memuat file gambar."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsDataURL(file);
  });
}

export function ArticleManagement({ initialArticles }: { initialArticles: any[] }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Keluarga Berencana");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState(DEFAULT_COVER_URL);

  // Mode input gambar: "upload" atau "url"
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const resetForm = () => {
    setTitle("");
    setContent("");
    setImageUrl(DEFAULT_COVER_URL);
    setCategory("Keluarga Berencana");
    setEditingId(null);
    setUploadedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditClick = (article: any) => {
    setTitle(article.title || "");
    setCategory(article.category || "Keluarga Berencana");
    setContent(article.content || "");
    const currentImg = article.image_url || "";
    setImageUrl(currentImg);
    setUploadedFileName(
      currentImg.startsWith("data:image/") ? "Gambar terupload" : null
    );
    setImageInputMode(currentImg.startsWith("http") ? "url" : "upload");
    setEditingId(article.id);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Harap pilih file gambar (JPG, PNG, WEBP, atau GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5MB.");
      return;
    }

    setUploadingImage(true);

    try {
      // 1. Coba upload ke Supabase Storage bucket "articles" jika sudah tersedia
      const fileExt = file.name.split(".").pop() || "jpg";
      const filePath = `covers/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("articles")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("articles")
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          setImageUrl(publicUrlData.publicUrl);
          setUploadedFileName(file.name);
          setUploadingImage(false);
          return;
        }
      }

      // 2. Fallback otomatis: Kompresi gambar ke Data URL agar langsung tersimpan tanpa perlu setup bucket
      const compressedDataUrl = await compressImageToDataUrl(file);
      setImageUrl(compressedDataUrl);
      setUploadedFileName(file.name);
    } catch (err: any) {
      alert("Gagal memproses gambar: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Hapus artikel ini secara permanen?")) return;

    setDeletingId(id);
    const targetArticle = initialArticles?.find((a: any) => a.id === id);
    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (!error) {
      // Hapus juga file gambar dari Supabase Storage jika berasal dari bucket 'articles'
      const oldStoragePath = extractStoragePathFromUrl(targetArticle?.image_url);
      if (oldStoragePath) {
        await supabase.storage.from("articles").remove([oldStoragePath]);
      }
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

    const finalImageUrl = imageUrl || DEFAULT_COVER_URL;
    const articleData = {
      title,
      category,
      content,
      image_url: finalImageUrl,
    };

    const previousArticle = editingId
      ? initialArticles?.find((a: any) => a.id === editingId)
      : null;
    const previousImageUrl = previousArticle?.image_url;

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
      // Jika mode edit dan gambar diganti dengan yang baru, hapus file gambar lama dari Supabase Storage
      if (editingId && previousImageUrl && previousImageUrl !== finalImageUrl) {
        const oldStoragePath = extractStoragePathFromUrl(previousImageUrl);
        if (oldStoragePath) {
          await supabase.storage.from("articles").remove([oldStoragePath]);
        }
      }

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
      <div className="lg:col-span-5 space-y-3 max-h-[750px] overflow-y-auto pr-2">
        {initialArticles?.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-slate-300 rounded-lg text-slate-500">
            <p className="font-medium text-slate-700 mb-1">Belum ada artikel</p>
            <p className="text-sm">Gunakan form di sebelah kanan untuk menulis.</p>
          </div>
        ) : (
          initialArticles?.map((a: any) => (
            <div
              key={a.id}
              className={`p-3.5 border rounded-xl flex gap-3.5 transition-colors ${
                editingId === a.id
                  ? "border-red-400 bg-red-50/30 ring-1 ring-red-400"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              {/* Thumbnail Cover Artikel */}
              <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                {a.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.image_url}
                    alt={a.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-2">
                  {a.title}
                </h3>

                <div className="flex items-center justify-between mt-auto gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600 w-fit">
                      {a.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(a.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
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
                      {deletingId === a.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Tambah / Edit (Sebelah Kanan) */}
      <div className="lg:col-span-7">
        <form
          onSubmit={handleSubmit}
          className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-5 relative sticky top-6"
        >
          {editingId && (
            <div className="absolute top-5 right-5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
                className="text-slate-500 hover:text-slate-800 hover:bg-slate-200 h-8"
              >
                <X className="h-4 w-4 mr-1.5" /> Batal Edit
              </Button>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-slate-900 text-lg">
              {editingId ? "Edit Artikel" : "Tulis Artikel Baru"}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {editingId
                ? "Perbarui informasi di bawah dan simpan."
                : "Isi form ini untuk menerbitkan materi edukasi baru."}
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

          {/* Bagian Gambar Cover: Bisa Upload File atau Input Link URL */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-600">
                Gambar Cover Artikel
              </label>

              {/* Toggle Mode Upload vs Link URL */}
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setImageInputMode("upload")}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    imageInputMode === "upload"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Upload className="h-3 w-3" /> Upload Gambar
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode("url")}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    imageInputMode === "url"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LinkIcon className="h-3 w-3" /> Link URL
                </button>
              </div>
            </div>

            {imageInputMode === "upload" ? (
              <div key="upload-mode-container" className="space-y-2">
                <input
                  key="file-upload-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="article-cover-upload"
                />
                <label
                  htmlFor="article-cover-upload"
                  className={`flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    uploadingImage
                      ? "border-slate-300 bg-slate-100 cursor-wait"
                      : "border-slate-300 bg-white hover:border-red-400 hover:bg-red-50/20"
                  }`}
                >
                  {uploadingImage ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                      <span>Memproses gambar...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center py-1">
                      <div className="p-2 rounded-full bg-red-50 text-red-600 mb-1.5">
                        <Upload className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">
                        Klik untuk pilih gambar dari perangkat Anda
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Format: JPG, PNG, WEBP (Maks. 5MB)
                      </p>
                    </div>
                  )}
                </label>

                {uploadedFileName && (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium truncate">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      File terpilih: {uploadedFileName}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFileName(null);
                        setImageUrl(DEFAULT_COVER_URL);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-emerald-700 hover:text-emerald-900 font-semibold ml-2 shrink-0"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div key="url-mode-container">
                <input
                  key="url-text-input"
                  type="text"
                  value={
                    typeof imageUrl === "string" && !imageUrl.startsWith("data:image/")
                      ? imageUrl
                      : ""
                  }
                  onChange={(e) => {
                    setImageUrl(e.target.value ?? "");
                    setUploadedFileName(null);
                  }}
                  placeholder="https://example.com/gambar-artikel.jpg"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Masukkan tautan langsung (direct link) ke file gambar.
                </p>
              </div>
            )}

            {/* Preview Gambar Cover */}
            {imageUrl && (
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-20 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Preview cover"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700">Preview Gambar Cover</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {imageUrl.startsWith("data:image/")
                      ? "Gambar hasil upload perangkat"
                      : imageUrl}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Konten Utama</label>
            <textarea
              rows={10}
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
              disabled={loading || uploadingImage}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-8 py-2 font-semibold transition-colors"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading
                ? "Menyimpan..."
                : editingId
                ? "Simpan Perubahan"
                : "Publikasikan Artikel"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
