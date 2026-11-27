"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createNewUser, updateExistingUser } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  UserPlus,
  Edit,
  X,
  Users,
  ShieldAlert,
  Stethoscope,
  User,
  Phone,
  Check,
} from "lucide-react";

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: "admin" | "perawat" | "bidan" | "user" | string;
  phone: string | null;
  avatar_url?: string | null;
  created_at: string;
}

export function UserManagement({
  initialUsers,
  currentUserId,
}: {
  initialUsers: UserProfile[];
  currentUserId: string;
}) {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("Semua");

  // Mode form: null (tertutup), "create" (tambah pengguna), "edit" (edit pengguna)
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Field state
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("perawat");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success" | ""; text: string }>({
    type: "",
    text: "",
  });

  const router = useRouter();

  const resetForm = () => {
    setFullName("");
    setRole("perawat");
    setPhone("");
    setEmail("");
    setPassword("");
    setEditingUser(null);
    setMessage({ type: "", text: "" });
  };

  const handleCloseForm = () => {
    resetForm();
    setFormMode(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setFormMode("create");
  };

  const handleOpenEdit = (user: UserProfile) => {
    setMessage({ type: "", text: "" });
    setEditingUser(user);
    setFullName(user.full_name || "");
    setRole(user.role || "user");
    setPhone(user.phone || "");
    setFormMode("edit");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.set("name", fullName);
    formData.set("role", role);
    formData.set("phone", phone);

    if (formMode === "edit" && editingUser) {
      formData.set("id", editingUser.id);
      const result = await updateExistingUser(formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        alert("Data pengguna berhasil diperbarui!");
        handleCloseForm();
        router.refresh();
      }
    } else if (formMode === "create") {
      formData.set("email", email);
      formData.set("password", password);
      const result = await createNewUser(formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        alert("Pengguna baru berhasil ditambahkan!");
        handleCloseForm();
        router.refresh();
      }
    }

    setLoading(false);
  };

  const filteredUsers = initialUsers.filter((u) => {
    if (selectedRoleFilter === "Semua") return true;
    if (selectedRoleFilter === "perawat") {
      return u.role?.toLowerCase() === "perawat" || u.role?.toLowerCase() === "bidan";
    }
    return u.role?.toLowerCase() === selectedRoleFilter.toLowerCase();
  });

  const getRoleCount = (roleFilter: string) => {
    if (roleFilter === "Semua") return initialUsers.length;
    if (roleFilter === "perawat") {
      return initialUsers.filter(
        (u) => u.role?.toLowerCase() === "perawat" || u.role?.toLowerCase() === "bidan"
      ).length;
    }
    return initialUsers.filter((u) => u.role?.toLowerCase() === roleFilter.toLowerCase()).length;
  };

  const getRoleBadge = (userRole: string) => {
    switch (userRole?.toLowerCase()) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <ShieldAlert className="h-3 w-3" /> ADMIN
          </span>
        );
      case "perawat":
      case "bidan":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <Stethoscope className="h-3 w-3" /> {userRole.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <User className="h-3 w-3" /> USER
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar Atas: Filter Peran & Tombol Tambah Pengguna */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "Semua", value: "Semua" },
            { label: "Admin", value: "admin" },
            { label: "Perawat", value: "perawat" },
            { label: "User", value: "user" },
          ].map((tab) => {
            const active = selectedRoleFilter === tab.value;
            const count = getRoleCount(tab.value);
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedRoleFilter(tab.value)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  active
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    active ? "bg-slate-700 text-slate-100" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {formMode === null ? (
            <Button
              type="button"
              onClick={handleOpenCreate}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-sm"
            >
              <UserPlus className="h-4 w-4 mr-1.5" /> Tambah Pengguna
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseForm}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg px-4 py-2 text-xs font-semibold bg-white"
            >
              <X className="h-4 w-4 mr-1.5" /> Tutup Form
            </Button>
          )}
        </div>
      </div>

      {/* Panel Form Tambah / Edit Pengguna (Collapsible dengan transisi halus) */}
      <div
        className={`mx-6 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          formMode !== null
            ? "max-h-[850px] opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-red-50 text-red-600">
                {formMode === "edit" ? (
                  <Edit className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {formMode === "edit"
                    ? `Edit Pengguna: ${editingUser?.full_name || "Tanpa Nama"}`
                    : "Tambah Pengguna Baru"}
                </h3>
                <p className="text-xs text-slate-500">
                  {formMode === "edit"
                    ? "Perbarui nama lengkap, nomor telepon, atau peran akses pengguna."
                    : "Buat akun baru dengan akses sebagai Perawat, Admin, atau User."}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCloseForm}
              className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 h-8 px-2.5 rounded-lg"
            >
              <X className="h-4 w-4 mr-1" /> Tutup
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {message.text && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold border ${
                  message.type === "error"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Contoh: Perawat Sari"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Peran Akses <span className="text-red-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  <option value="perawat">Perawat (Akses Panel Chat)</option>
                  <option value="admin">Admin (Super Admin CMS)</option>
                  <option value="user">User Biasa (Akseptor / Pasien)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nomor Telepon <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            {formMode === "create" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="sari@sikb.com"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseForm}
                className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg px-5 py-2 text-xs font-semibold bg-white"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-6 py-2 font-semibold text-xs transition-colors"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-1.5" />}
                {loading
                  ? "Menyimpan..."
                  : formMode === "edit"
                  ? "Simpan Perubahan"
                  : "Buat Pengguna"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Tabel Daftar Pengguna */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50/50 text-slate-500 border-y border-slate-200 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
              <th className="px-6 py-4 font-semibold">Peran</th>
              <th className="px-6 py-4 font-semibold">No. Telepon</th>
              <th className="px-6 py-4 font-semibold">Tanggal Mendaftar</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                  Tidak ada pengguna yang ditemukan.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isEditingThis = formMode === "edit" && editingUser?.id === u.id;
                const isCurrentUser = u.id === currentUserId;
                return (
                  <tr
                    key={u.id}
                    className={`transition-colors ${
                      isEditingThis ? "bg-red-50/40" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{u.full_name || "Tanpa Nama"}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                            Anda
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {u.phone ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {u.phone}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(u)}
                        className={`h-8 px-3 text-xs font-medium ${
                          isEditingThis
                            ? "border-red-400 text-red-700 bg-red-50"
                            : "text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
