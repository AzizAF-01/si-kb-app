import { CheckCircle2, Pill, Leaf, ShieldCheck } from "lucide-react";

export default function KontrasepsiPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-5xl">
      <div className="max-w-2xl mb-16">
        <p className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-4">Info Kontrasepsi</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
          Kenali pilihan kontrasepsi Anda
        </h1>
        <p className="text-lg text-slate-600">
          Setiap metode punya cara kerja dan kelebihan masing-masing. Pelajari perbedaannya, lalu diskusikan dengan tenaga kesehatan untuk memilih yang paling cocok.
        </p>
      </div>

      <div className="flex flex-col gap-12 mb-20">
        {/* Hormonal Section */}
        <section>
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl shrink-0">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Hormonal</h2>
              <p className="text-slate-600">Menggunakan hormon untuk mencegah pelepasan sel telur.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-0 md:ml-16">
            <ContraceptiveCard 
              title="Pil KB" 
              description="Diminum setiap hari pada jam yang sama." 
              effectiveness="Efektivitas 91–99%" 
            />
            <ContraceptiveCard 
              title="Suntik KB" 
              description="Suntikan setiap 1 atau 3 bulan di fasilitas kesehatan." 
              effectiveness="Efektivitas 94–99%" 
            />
          </div>
        </section>

        {/* Non-Hormonal Section */}
        <section>
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl shrink-0">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Non-Hormonal</h2>
              <p className="text-slate-600">Tanpa hormon, bekerja sebagai penghalang atau secara alami.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-0 md:ml-16">
            <ContraceptiveCard 
              title="Kondom" 
              description="Pelindung sekali pakai, juga mencegah infeksi menular seksual." 
              effectiveness="Efektivitas 82–98%" 
            />
            <ContraceptiveCard 
              title="Metode Kalender" 
              description="Menghindari hubungan pada masa subur." 
              effectiveness="Efektivitas 76–88%" 
            />
          </div>
        </section>

        {/* MKJP Section */}
        <section>
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">MKJP</h2>
              <p className="text-slate-600">Metode Kontrasepsi Jangka Panjang, perlindungan bertahun-tahun.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-0 md:ml-16">
            <ContraceptiveCard 
              title="IUD (Spiral)" 
              description="Alat kecil di rahim, bisa bertahan hingga 8–10 tahun." 
              effectiveness="Efektivitas Lebih dari 99%" 
            />
            <ContraceptiveCard 
              title="Implan (Susuk)" 
              description="Batang kecil di lengan atas, efektif hingga 3 tahun." 
              effectiveness="Efektivitas Lebih dari 99%" 
            />
          </div>
        </section>
      </div>

      {/* Comparison Table Section */}
      <section>
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Tabel perbandingan metode</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
          <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
            <thead className="bg-blue-50 text-blue-800 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">Metode</th>
                <th className="px-6 py-4">Kelompok</th>
                <th className="px-6 py-4">Efektivitas</th>
                <th className="px-6 py-4">Durasi</th>
                <th className="px-6 py-4 rounded-tr-2xl">Efek samping umum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">Pil KB</td>
                <td className="px-6 py-4">Hormonal</td>
                <td className="px-6 py-4 font-semibold text-emerald-600">91–99%</td>
                <td className="px-6 py-4">Harian</td>
                <td className="px-6 py-4">Mual ringan, perubahan pola haid, nyeri payudara.</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">Suntik KB</td>
                <td className="px-6 py-4">Hormonal</td>
                <td className="px-6 py-4 font-semibold text-emerald-600">94–99%</td>
                <td className="px-6 py-4">1 atau 3 bulan</td>
                <td className="px-6 py-4">Haid tidak teratur, kenaikan berat badan ringan.</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">Kondom</td>
                <td className="px-6 py-4">Non-Hormonal</td>
                <td className="px-6 py-4 font-semibold text-emerald-600">82–98%</td>
                <td className="px-6 py-4">Sekali pakai</td>
                <td className="px-6 py-4">Jarang; bisa terjadi alergi lateks.</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">Metode Kalender</td>
                <td className="px-6 py-4">Non-Hormonal</td>
                <td className="px-6 py-4 font-semibold text-emerald-600">76–88%</td>
                <td className="px-6 py-4">Setiap siklus</td>
                <td className="px-6 py-4">Tidak ada efek samping fisik.</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">IUD (Spiral)</td>
                <td className="px-6 py-4">MKJP</td>
                <td className="px-6 py-4 font-semibold text-emerald-600">Lebih dari 99%</td>
                <td className="px-6 py-4">5–10 tahun</td>
                <td className="px-6 py-4">Kram atau haid lebih banyak di bulan awal.</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">Implan (Susuk)</td>
                <td className="px-6 py-4">MKJP</td>
                <td className="px-6 py-4 font-semibold text-emerald-600">Lebih dari 99%</td>
                <td className="px-6 py-4">3 tahun</td>
                <td className="px-6 py-4">Bercak darah, perubahan pola haid.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ContraceptiveCard({ title, description, effectiveness }: { title: string, description: string, effectiveness: string }) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-md hover:border-blue-100 transition-all duration-300">
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 mb-6 flex-1 text-sm md:text-base leading-relaxed">{description}</p>
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 w-fit px-3 py-1.5 rounded-full mt-auto">
        <CheckCircle2 className="h-4 w-4" />
        {effectiveness}
      </div>
    </div>
  );
}
