"use client";

import { useState } from "react";
import { createNewUser } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus } from "lucide-react";

export function CreateUserForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    const result = await createNewUser(formData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Pengguna berhasil ditambahkan!" });
      (e.target as HTMLFormElement).reset();
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <UserPlus className="h-5 w-5 text-slate-700" />
        <h3 className="font-semibold text-slate-800">Tambah Akses Admin / Bidan</h3>
      </div>
      
      {message.text && (
        <div className={`p-3 rounded-lg text-sm font-semibold border ${
          message.type === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap</label>
          <input 
            type="text" 
            name="name"
            required
            placeholder="Bidan Sari" 
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              required
              placeholder="sari@sikb.com"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              required
              minLength={6}
              placeholder="Min. 6 karakter"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Peran Akses</label>
          <select 
            name="role"
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
          >
            <option value="bidan">Bidan (Akses Panel Chat)</option>
            <option value="admin">Admin (Akses Monitoring)</option>
            <option value="user">User Biasa</option>
          </select>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-6 py-2 font-semibold transition-colors mt-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {loading ? "Menyimpan..." : "Buat Pengguna"}
        </Button>
      </form>
    </div>
  );
}
