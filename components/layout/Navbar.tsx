import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartPulse, User } from "lucide-react";
import { getAuthenticatedUser, getCurrentProfile } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { UserNav, MobileNav } from "@/components/layout/UserNav";

export async function Navbar() {
  // Menggunakan helper ter-cache (React.cache) agar tidak memicu query auth ganda
  const [user, profile] = await Promise.all([
    getAuthenticatedUser(),
    getCurrentProfile(),
  ]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">SI-KB</span>
        </Link>
        
        <UserNav />

        <div className="flex items-center gap-3 md:gap-4">
          {user ? (
            <div className="flex items-center gap-3 md:gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <User className="h-4 w-4 text-slate-400" />
                <span className="truncate max-w-[120px]">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
              </div>
              <LogoutButton variant="outline" className="rounded-full px-5 md:px-6 border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors text-xs md:text-sm" />
            </div>
          ) : (
            <Link href="/login">
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700 rounded-full px-5 md:px-6 shadow-sm text-xs md:text-sm">
                Masuk
              </Button>
            </Link>
          )}

          <MobileNav />
        </div>
      </div>
    </header>
  );
}
