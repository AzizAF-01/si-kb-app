import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function TrueAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verifikasi role admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/"); // Tendang ke halaman utama jika bukan admin
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-red-900 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-lg">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold tracking-wide">SI-KB <span className="text-red-300 font-medium">Super Admin</span></span>
          </Link>

          <LogoutButton className="text-sm font-medium text-red-200 hover:text-white transition-colors bg-transparent shadow-none hover:bg-transparent" />
        </div>
      </header>

      <AdminNav />

      <main className="flex-1 container mx-auto px-4 pb-12 max-w-6xl">
        {children}
      </main>
    </div>
  );
}
