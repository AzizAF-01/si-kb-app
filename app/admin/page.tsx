import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { UserManagement } from "@/components/admin/UserManagement";

export const dynamic = 'force-dynamic';

export default async function TrueAdminPage() {
  // getAuthenticatedUser menggunakan React.cache (0ms latensi tambahan dari layout)
  const [user, supabase] = await Promise.all([
    getAuthenticatedUser(),
    createClient(),
  ]);

  if (!user) redirect("/login");

  // Ambil semua pengguna untuk dimonitor dan dikelola
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Kelola Pengguna</h1>
        <p className="text-sm text-slate-600">
          Pantau akun terdaftar, ubah informasi dan peran akses pengguna, atau tambahkan akun Perawat dan Admin baru.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-slate-700" />
            <h2 className="font-semibold text-slate-800">Daftar Pengguna Sistem</h2>
          </div>
          <div className="text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            Total: {users?.length || 0} Pengguna
          </div>
        </div>

        <UserManagement initialUsers={users || []} currentUserId={user.id} />
      </div>
    </div>
  );
}
