import Link from "next/link";

export default function InfoKBPage() {
  const articles = [
    {
      id: 1,
      title: "Apa Itu Keluarga Berencana?",
      description: "Mengenal tujuan KB untuk merencanakan jumlah dan jarak kelahiran anak.",
      image: "https://images.unsplash.com/photo-1542037104857-ffbb0b915525?q=80&w=600&auto=format&fit=crop",
      tags: ["Dasar KB", "Artikel"]
    },
    {
      id: 2,
      title: "Persiapan Kesehatan untuk Calon Pengantin",
      description: "Pemeriksaan dan kebiasaan sehat yang perlu disiapkan sebelum menikah.",
      image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600&auto=format&fit=crop",
      tags: ["Calon Pengantin", "Artikel"]
    },
    {
      id: 3,
      title: "Mengatur Jarak Kehamilan yang Ideal",
      description: "Mengapa jarak kehamilan 2-3 tahun baik untuk ibu dan anak.",
      image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600&auto=format&fit=crop",
      tags: ["Kesehatan Ibu", "Video"]
    },
    {
      id: 4,
      title: "Mitos dan Fakta Seputar Kontrasepsi",
      description: "Meluruskan anggapan keliru yang sering beredar di masyarakat.",
      image: "https://images.unsplash.com/photo-1581090122319-8fab9528eaaa?q=80&w=600&auto=format&fit=crop",
      tags: ["Dasar KB", "Artikel"]
    },
    {
      id: 5,
      title: "Peran Suami dalam Keluarga Berencana",
      description: "KB adalah keputusan bersama. Begini cara suami ikut berperan.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop",
      tags: ["Pasangan", "Video"]
    },
    {
      id: 6,
      title: "Kesehatan Reproduksi Remaja",
      description: "Informasi dasar yang perlu diketahui remaja tentang tubuhnya.",
      image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=600&auto=format&fit=crop",
      tags: ["Kesehatan Reproduksi", "Artikel"]
    }
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-20">
      <div className="max-w-2xl mb-12">
        <p className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-4">Info KB</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
          Belajar KB dengan cara yang ringan
        </h1>
        <p className="text-lg text-slate-600">
          Artikel dan video singkat yang disusun bersama tenaga kesehatan. Pilih topik yang ingin Anda pahami hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <Link href={`/info-kb/${article.id}`} key={article.id} className="group flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 overflow-hidden h-full">
            <div className="relative h-48 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag, i) => (
                  <span 
                    key={i} 
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      tag === "Video" ? "bg-teal-50 text-teal-700" : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed flex-1">
                {article.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
