import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <h3 className="text-xl font-bold text-white mb-4">SI-KB</h3>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            Sistem Informasi Keluarga Berencana. Edukasi kesehatan reproduksi yang hangat dan mudah dipahami untuk setiap keluarga Indonesia.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Fitur</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/info-kb" className="hover:text-white transition-colors">Info KB</Link></li>
            <li><Link href="/kontrasepsi" className="hover:text-white transition-colors">Kontrasepsi</Link></li>
            <li><Link href="/jadwal-layanan" className="hover:text-white transition-colors">Jadwal</Link></li>
            <li><Link href="/konsultasi" className="hover:text-white transition-colors">Konsultasi</Link></li>
            <li><Link href="/pengingat" className="hover:text-white transition-colors">Pengingat</Link></li>
            <li><Link href="/riwayat" className="hover:text-white transition-colors">Riwayat</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Informasi</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/tentang" className="hover:text-white transition-colors">Tentang Aplikasi</Link></li>
            <li><Link href="/kontak" className="hover:text-white transition-colors">Kontak</Link></li>
            <li><Link href="/privasi" className="hover:text-white transition-colors">Kebijakan Privasi</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500">
        © 2026 SI-KB. Informasi di situs ini bersifat edukasi dan tidak menggantikan saran tenaga kesehatan.
      </div>
    </footer>
  );
}
