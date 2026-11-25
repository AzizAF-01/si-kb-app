"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Users, FileText, Building, Pill, Loader2 } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Kelola Pengguna", icon: Users },
  { href: "/admin/articles", label: "Kelola Artikel", icon: FileText },
  { href: "/admin/facilities", label: "Jadwal Layanan", icon: Building },
  { href: "/admin/contraceptives", label: "Kelola Kontrasepsi", icon: Pill },
];

export function AdminNav() {
  const pathname = usePathname();
  const [clickedPath, setClickedPath] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Optimistic navigation: jika sedang transisi, tampilkan tab tujuan secara instan
  const activePath = isPending && clickedPath ? clickedPath : pathname;

  const handleNavClick = (href: string) => {
    startTransition(() => {
      setClickedPath(href);
    });
  };

  return (
    <div className="bg-white border-b border-slate-200 mb-8 shadow-sm">
      <div className="container mx-auto px-4 max-w-6xl flex gap-2 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.href;
          const isTransitioning = isPending && clickedPath === item.href && pathname !== item.href;

          return (
            <Link 
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={() => handleNavClick(item.href)}
              className={`flex items-center gap-2 px-6 py-4 font-bold border-b-[3px] transition-all whitespace-nowrap ${
                isActive 
                  ? 'border-red-600 text-red-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {isTransitioning ? (
                <Loader2 className="h-5 w-5 animate-spin text-red-600" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
