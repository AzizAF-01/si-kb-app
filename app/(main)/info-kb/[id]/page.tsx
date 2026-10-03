import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (!article) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-4xl">
      <Link href="/info-kb">
        <Button variant="ghost" className="mb-8 pl-0 text-slate-500 hover:text-slate-900 hover:bg-transparent group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar Artikel
        </Button>
      </Link>

      <div className="space-y-6 mb-10">
        <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-slate-700 border border-slate-200">
            <Tag className="h-3.5 w-3.5" />
            {article.category}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {new Date(article.created_at).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
          {article.title}
        </h1>
      </div>

      <div className="aspect-video w-full rounded-2xl overflow-hidden mb-12 bg-slate-100 border border-slate-200">
        <img 
          src={article.image_url} 
          alt={article.title} 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="prose prose-slate prose-lg md:prose-xl max-w-none">
        {/* Menggunakan whitespace-pre-line agar baris baru dari textarea tampil benar */}
        <div className="whitespace-pre-line leading-relaxed text-slate-700">
          {article.content}
        </div>
      </div>
      
      <div className="mt-16 pt-8 border-t border-slate-200">
        <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
          <h3 className="font-bold text-slate-900 text-xl mb-3">Punya pertanyaan lebih lanjut?</h3>
          <p className="text-slate-600 mb-6">Bidan kami siap membantu Anda secara langsung via chat.</p>
          <Link href="/konsultasi">
            <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-8 py-3">
              Mulai Konsultasi Online
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
