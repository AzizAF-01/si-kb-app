import { createClient } from "@/lib/supabase/server";
import { BookOpen, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function InfoKBPage() {
  const supabase = await createClient();
  
  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  // Filter kategori
  const kbArticles = articles?.filter(a => a.category === "Keluarga Berencana" || a.category === "Alat Kontrasepsi") || [];
  const kesehatanArticles = articles?.filter(a => a.category === "Kesehatan Ibu" || a.category === "Gaya Hidup") || [];

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-6xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-red-500 tracking-widest uppercase mb-4">Info KB & Reproduksi</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            Pusat Edukasi Keluarga Berencana
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Dapatkan informasi terpercaya seputar kesehatan reproduksi, metode kontrasepsi, dan perencanaan keluarga dari pakarnya.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="w-full md:w-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Cari artikel..." 
            className="w-full md:w-72 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
          />
        </div>
      </div>

      {articles?.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Belum ada artikel edukasi.</p>
          <p className="text-sm text-slate-400 mt-2">Admin dapat menambahkannya melalui Dashboard Admin.</p>
        </div>
      )}

      {/* Keluarga Berencana Section */}
      {kbArticles.length > 0 && (
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-100 p-2 rounded-xl">
              <BookOpen className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Keluarga Berencana</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {kbArticles.map((article: any) => (
              <div key={article.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  <img 
                    src={article.image_url} 
                    alt={article.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700">
                    {article.category}
                  </div>
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <span className="text-xs font-bold text-slate-400 mb-3">{new Date(article.created_at).toLocaleDateString('id-ID')}</span>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-red-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 mb-6 line-clamp-3 text-sm leading-relaxed whitespace-pre-line">
                    {article.content}
                  </p>
                  
                  <div className="mt-auto">
                    <Link href={`/info-kb/${article.id}`}>
                      <Button variant="ghost" className="p-0 text-red-600 hover:text-red-700 hover:bg-transparent font-bold group/btn">
                        Baca selengkapnya
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kesehatan Ibu Section */}
      {kesehatanArticles.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-teal-100 p-2 rounded-xl">
              <BookOpen className="h-6 w-6 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Kesehatan Ibu & Anak</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {kesehatanArticles.map((article: any) => (
              <div key={article.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  <img 
                    src={article.image_url} 
                    alt={article.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700">
                    {article.category}
                  </div>
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <span className="text-xs font-bold text-slate-400 mb-3">{new Date(article.created_at).toLocaleDateString('id-ID')}</span>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-teal-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 mb-6 line-clamp-3 text-sm leading-relaxed whitespace-pre-line">
                    {article.content}
                  </p>
                  
                  <div className="mt-auto">
                    <Link href={`/info-kb/${article.id}`}>
                      <Button variant="ghost" className="p-0 text-teal-600 hover:text-teal-700 hover:bg-transparent font-bold group/btn">
                        Baca selengkapnya
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
