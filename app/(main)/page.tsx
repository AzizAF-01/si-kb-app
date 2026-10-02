import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  HeartPulse, Users, Clock, ShieldCheck, CheckCircle2, MessageCircle, 
  MapPin, BookOpen, Pill, Bell, History, ArrowRight
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-8 pt-12 md:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="flex flex-col gap-6 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600 w-fit">
              <Users className="h-4 w-4" />
              Untuk pasangan, calon pengantin & keluarga
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Informasi KB yang mudah dipahami, kapan saja Anda butuhkan
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed">
              SI-KB menemani keluarga Indonesia merencanakan masa depan dengan tenang: 
              belajar tentang KB, memilih kontrasepsi yang tepat, menemukan layanan terdekat, 
              hingga bertanya langsung kepada bidan.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <Link href="/info-kb">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-full px-8 text-base h-12">
                  Mulai Sekarang
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-full px-8 text-base h-12 border-slate-300">
                  Masuk
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-4 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>Gratis & rahasia</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-600" />
                <span>Dampingan bidan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Akses 24 jam</span>
              </div>
            </div>
          </div>

          {/* Hero Image & Badges */}
          <div className="relative">
            <div className="relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1542037104857-ffbb0b915525?q=80&w=800&auto=format&fit=crop" 
                alt="Keluarga bahagia" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            
            {/* Floating Badge 1 */}
            <div className="absolute top-8 -right-4 md:-right-8 bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              <div className="bg-green-100 p-2 rounded-full">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Bidan Rina sedang online</p>
              </div>
            </div>

            {/* Floating Badge 2 */}
            <div className="absolute bottom-12 -left-4 md:-left-8 bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Pengingat suntik KB</p>
                <p className="text-xs text-slate-500">3 hari lagi · Puskesmas Menteng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">Fitur Utama</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Semua yang Anda butuhkan, dalam satu tempat
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<BookOpen className="h-6 w-6 text-blue-600" />}
            title="Info KB"
            description="Artikel dan video ringan tentang KB dan kesehatan reproduksi."
            href="/info-kb"
          />
          <FeatureCard 
            icon={<Pill className="h-6 w-6 text-emerald-600" />}
            title="Info Kontrasepsi"
            description="Kenali metode hormonal, non-hormonal, dan MKJP beserta perbandingannya."
            href="/kontrasepsi"
          />
          <FeatureCard 
            icon={<MapPin className="h-6 w-6 text-indigo-600" />}
            title="Jadwal Layanan"
            description="Temukan Puskesmas, Posyandu, klinik, dan bidan terdekat."
            href="/jadwal-layanan"
          />
          <FeatureCard 
            icon={<MessageCircle className="h-6 w-6 text-teal-600" />}
            title="Konsultasi"
            description="Tanya langsung kepada tenaga kesehatan secara aman dan rahasia."
            href="/konsultasi"
          />
          <FeatureCard 
            icon={<Bell className="h-6 w-6 text-orange-600" />}
            title="Pengingat"
            description="Jangan lewatkan jadwal suntik, pil, atau kunjungan ulang."
            href="/pengingat"
          />
          <FeatureCard 
            icon={<History className="h-6 w-6 text-purple-600" />}
            title="Riwayat Saya"
            description="Catat riwayat layanan KB dan keluhan pribadi Anda."
            href="/riwayat"
          />
        </div>
      </section>

      {/* Why SI-KB Section */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-blue-600 rounded-[2.5rem] p-8 md:p-16 lg:p-20 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-700 rounded-full blur-3xl opacity-50"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-bold text-blue-200 tracking-widest uppercase mb-4">Kenapa SI-KB</p>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Ditemani dengan hangat, bukan dihakimi
              </h2>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex gap-4 items-start">
                <div className="bg-white/20 p-2.5 rounded-xl shrink-0">
                  <HeartPulse className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Bahasa yang sederhana</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">Informasi disusun bersama tenaga kesehatan dan ditulis tanpa istilah yang membingungkan.</p>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex gap-4 items-start">
                <div className="bg-white/20 p-2.5 rounded-xl shrink-0">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Aman dan rahasia</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">Data dan pertanyaan Anda terlindungi. Hanya Anda yang dapat melihat riwayat pribadi.</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex gap-4 items-start">
                <div className="bg-white/20 p-2.5 rounded-xl shrink-0">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Dekat dengan layanan nyata</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">Terhubung dengan Puskesmas, Posyandu, dan bidan di sekitar tempat tinggal Anda.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) {
  return (
    <Link href={href} className="group block h-full">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 h-full flex flex-col">
        <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">{description}</p>
        <div className="flex items-center text-sm font-semibold text-blue-600">
          Buka 
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
