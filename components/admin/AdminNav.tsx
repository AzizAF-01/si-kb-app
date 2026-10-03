"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, FileText, Building } from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="bg-white border-b border-slate-200 mb-8 shadow-sm">
      <div className="container mx-auto px-4 max-w-6xl flex gap-2">
        <Link 
          href="/admin" 
          className={`flex items-center gap-2 px-6 py-4 font-bold border-b-[3px] transition-colors ${
            pathname === '/admin' 
              ? 'border-red-600 text-red-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Users className="h-5 w-5" /> Kelola Pengguna
        </Link>
        <Link 
          href="/admin/articles" 
          className={`flex items-center gap-2 px-6 py-4 font-bold border-b-[3px] transition-colors ${
            pathname === '/admin/articles' 
              ? 'border-red-600 text-red-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <FileText className="h-5 w-5" /> Kelola Artikel
        </Link>
        <Link 
          href="/admin/facilities" 
          className={`flex items-center gap-2 px-6 py-4 font-bold border-b-[3px] transition-colors ${
            pathname === '/admin/facilities' 
              ? 'border-red-600 text-red-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Building className="h-5 w-5" /> Jadwal Layanan
        </Link>
      </div>
    </div>
  );
}
