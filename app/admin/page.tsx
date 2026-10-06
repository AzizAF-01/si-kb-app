import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { CreateUserForm } from "@/components/admin/CreateUserForm";

export const dynamic = 'force-dynamic';

export default async function TrueAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Ambil semua pengguna untuk dimonitor
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Kelola Pengguna</h1>
        <p className="text-sm text-slate-600">Pantau akun terdaftar dan kelola akses Perawat atau Admin.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-slate-700" />
            <h2 className="font-semibold text-slate-800">Daftar Pengguna Sistem</h2>
          </div>
          <div className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
            Total: {users?.length || 0} Pengguna
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
                <th className="px-6 py-4 font-semibold">Peran</th>
                <th className="px-6 py-4 font-semibold text-right">Tanggal Mendaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users?.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    Belum ada pengguna terdaftar.
                  </td>
                </tr>
              ) : (
                users?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900">{u.full_name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        u.role === 'admin' ? 'bg-red-50 text-red-700 border-red-200' :
                        u.role === 'perawat' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-right">
                      {new Date(u.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <CreateUserForm />
        </div>
      </div>
    </div>
  );
}
