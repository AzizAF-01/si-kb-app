import { createClient } from "@/lib/supabase/server";
import { FileText } from "lucide-react";
import { ArticleManagement } from "@/components/admin/ArticleManagement";
import { extractArticleHeader } from "@/lib/article-header";

export const dynamic = 'force-dynamic';

export default async function AdminArticlesPage() {
  const supabase = await createClient();

  // Ambil semua artikel (autentikasi & otorisasi role admin sudah divalidasi oleh layout)
  const { data: articlesData } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  // Ekstrak header config dan saring data sistem
  const { header, cleanedRows } = extractArticleHeader(articlesData || []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Kelola Artikel</h1>
        <p className="text-sm text-slate-600">Buat, perbarui, dan hapus artikel edukasi serta sesuaikan teks header halaman Info KB publik.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <FileText className="h-5 w-5 text-slate-700" />
          <h2 className="font-semibold text-slate-800">Manajemen Konten Edukasi</h2>
        </div>
        <div className="p-6">
          <ArticleManagement initialArticles={cleanedRows} initialHeader={header} />
        </div>
      </div>
    </div>
  );
}
