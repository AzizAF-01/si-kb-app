import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartPulse, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/LogoutButton";

export async function Navbar() {
  const supabase = await createClient();
  
  // Mengambil session user yang sedang login
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    // Jika ada user, ambil nama lengkapnya dari tabel profiles
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">SI-KB</span>
        </Link>
        
        <nav className="hidden md:flex gap-6">
          <Link href="/info-kb" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Info KB
          </Link>
          <Link href="/kontrasepsi" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Kontrasepsi
          </Link>
          <Link href="/jadwal-layanan" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Jadwal
          </Link>
          <Link href="/konsultasi" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Konsultasi
          </Link>
          <Link href="/pengingat" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Pengingat
          </Link>
          <Link href="/riwayat" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Riwayat
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <User className="h-4 w-4 text-slate-400" />
                <span className="truncate max-w-[120px]">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
              </div>
              <LogoutButton variant="outline" className="rounded-full px-6 border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors" />
            </div>
          ) : (
            <Link href="/login">
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700 rounded-full px-6 shadow-sm">
                Masuk
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
