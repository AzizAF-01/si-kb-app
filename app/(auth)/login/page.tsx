"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Ambil role dari tabel profiles
    if (authData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
      } else if (profile?.role === "perawat") {
        router.push("/perawat");
      } else {
        router.push("/");
      }
      
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Selamat Datang</h1>
        <p className="text-sm text-slate-500">Masuk ke akun SI-KB Anda untuk melanjutkan</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
            {error === "Invalid login credentials" ? "Email atau password salah." : error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1.5">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="contoh@email.com" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-semibold text-slate-900">Password</label>
            <Link href="#" className="text-xs font-semibold text-blue-600 hover:underline">
              Lupa password?
            </Link>
          </div>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl py-6 text-base font-semibold mt-4"
        >
          {loading ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <div className="text-center text-sm text-slate-600">
        Belum punya akun?{" "}
        <Link href="/register" className="font-bold text-blue-600 hover:underline">
          Daftar sekarang
        </Link>
      </div>
    </div>
  );
}
