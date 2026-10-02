import { Button } from "@/components/ui/button";
import { Send, Calendar } from "lucide-react";

export default function KonsultasiPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-6xl">
      <div className="max-w-2xl mb-12">
        <p className="text-sm font-bold text-teal-600 tracking-widest uppercase mb-4">Konsultasi</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
          Tanya langsung kepada tenaga kesehatan
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Ceritakan kekhawatiran Anda tanpa rasa malu. Percakapan bersifat rahasia dan dijawab oleh bidan serta dokter terverifikasi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Chat Interface */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="bg-white border-b border-slate-100 p-4 flex items-center gap-4 shrink-0">
            <div className="bg-blue-500 text-white font-bold h-12 w-12 rounded-full flex items-center justify-center text-lg">
              BR
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Bidan Rina Kartika, Amd.Keb</h3>
              <div className="flex items-center gap-1.5 text-xs text-teal-600 font-medium mt-0.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                </span>
                Online · biasanya membalas dalam 5 menit
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 flex flex-col gap-4">
            <div className="flex flex-col gap-1 max-w-[85%] self-start">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm shadow-sm text-sm text-slate-800 leading-relaxed">
                Selamat pagi, Bu. Saya Bidan Rina. Ada yang bisa saya bantu hari ini?
              </div>
              <span className="text-[10px] text-slate-400 ml-1">08.02</span>
            </div>

            <div className="flex flex-col gap-1 max-w-[85%] self-end items-end">
              <div className="bg-blue-500 text-white p-4 rounded-2xl rounded-tr-sm shadow-sm text-sm leading-relaxed">
                Pagi, Bu Bidan. Saya baru menikah dan ingin menunda kehamilan sekitar 1 tahun. Metode apa yang cocok?
              </div>
              <span className="text-[10px] text-slate-400 mr-1">08.04</span>
            </div>

            <div className="flex flex-col gap-1 max-w-[85%] self-start">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm shadow-sm text-sm text-slate-800 leading-relaxed">
                Untuk menunda sementara, pil KB atau suntik 3 bulan bisa jadi pilihan. Keduanya mudah dihentikan saat Ibu siap hamil.
              </div>
              <span className="text-[10px] text-slate-400 ml-1">08.06</span>
            </div>

            <div className="flex flex-col gap-1 max-w-[85%] self-end items-end">
              <div className="bg-blue-500 text-white p-4 rounded-2xl rounded-tr-sm shadow-sm text-sm leading-relaxed">
                Kalau suntik, apakah ada efek sampingnya?
              </div>
              <span className="text-[10px] text-slate-400 mr-1">08.07</span>
            </div>

            <div className="flex flex-col gap-1 max-w-[85%] self-start">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm shadow-sm text-sm text-slate-800 leading-relaxed">
                Kadang haid jadi tidak teratur. Itu wajar dan tidak berbahaya. Ibu bisa datang ke Puskesmas untuk pemeriksaan awal dulu ya.
              </div>
              <span className="text-[10px] text-slate-400 ml-1">08.09</span>
            </div>
          </div>

          {/* Chat Input */}
          <div className="bg-white border-t border-slate-100 p-4 shrink-0 flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Tulis pertanyaan Anda..." 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <Button size="icon" className="h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600 shrink-0">
              <Send className="h-5 w-5 ml-0.5" />
            </Button>
          </div>
        </div>

        {/* Teleconsultation Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 sticky top-24">
            <div className="bg-teal-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
              <Calendar className="h-6 w-6 text-teal-600" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">Daftar sesi telekonsultasi</h3>
            <p className="text-sm text-slate-600 mb-8">
              Pilih waktu video call 20 menit bersama bidan atau dokter. Gratis.
            </p>

            <form className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Nama lengkap</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Siti Aminah" 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Nomor WhatsApp</label>
                <input 
                  type="tel" 
                  placeholder="08xx xxxx xxxx" 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Tanggal yang diinginkan</label>
                <input 
                  type="date" 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Topik konsultasi</label>
                <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_16px_center] bg-no-repeat pr-10">
                  <option value="">Memilih kontrasepsi</option>
                  <option value="keluhan">Keluhan pasca pasang</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Keluhan singkat (opsional)</label>
                <textarea 
                  rows={3}
                  placeholder="Ceritakan secara singkat..." 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>

              <Button className="w-full bg-blue-500 hover:bg-blue-600 rounded-xl py-6 text-base font-semibold mt-2">
                Daftar Sesi
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
