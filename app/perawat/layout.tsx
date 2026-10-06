import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function PerawatLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verifikasi role perawat
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "perawat") {
    redirect("/"); // Tendang ke halaman utama jika bukan perawat
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-teal-900 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link href="/perawat" className="flex items-center gap-2">
            <div className="bg-teal-500 p-1.5 rounded-lg">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold tracking-wide">SI-KB <span className="text-teal-400 font-medium">Perawat Panel</span></span>
          </Link>

          <LogoutButton className="text-sm font-medium text-teal-200 hover:text-white transition-colors bg-transparent shadow-none hover:bg-transparent" />
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
}
