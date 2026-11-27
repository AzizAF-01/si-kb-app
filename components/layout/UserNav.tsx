"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { 
  BookOpen, 
  Pill, 
  Calendar, 
  MessageCircle, 
  Bell, 
  History, 
  Menu, 
  X 
} from "lucide-react";

export const USER_NAV_ITEMS = [
  { href: "/info-kb", label: "Info KB", icon: BookOpen },
  { href: "/kontrasepsi", label: "Kontrasepsi", icon: Pill },
  { href: "/jadwal-layanan", label: "Jadwal", icon: Calendar },
  { href: "/konsultasi", label: "Konsultasi", icon: MessageCircle },
  { href: "/pengingat", label: "Pengingat", icon: Bell },
  { href: "/riwayat", label: "Riwayat", icon: History },
];

export function UserNav() {
  const pathname = usePathname();
  const [clickedPath, setClickedPath] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (clickedPath && pathname === clickedPath) {
      setClickedPath(null);
    }
  }, [pathname, clickedPath]);

  // Optimistic highlight: tampilkan active menu secara instan saat diklik
  const activePath = isPending && clickedPath ? clickedPath : pathname;

  const isItemActive = (href: string) => {
    if (href === "/") return activePath === "/";
    return activePath === href || activePath.startsWith(href + "/");
  };

  const handleNavClick = (href: string) => {
    if (pathname === href) return;
    startTransition(() => {
      setClickedPath(href);
    });
  };

  return (
    <nav className="hidden md:flex items-center gap-1 lg:gap-2">
      {USER_NAV_ITEMS.map((item) => {
        const isActive = isItemActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            onClick={() => handleNavClick(item.href)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
              isActive
                ? "bg-blue-50 text-blue-600 font-bold shadow-xs border border-blue-200/80"
                : "text-slate-600 hover:text-blue-600 hover:bg-slate-100/70"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [clickedPath, setClickedPath] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (clickedPath && pathname === clickedPath) {
      setClickedPath(null);
    }
  }, [pathname, clickedPath]);

  // Otomatis tutup menu mobile jika pathname berganti
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const activePath = isPending && clickedPath ? clickedPath : pathname;

  const isItemActive = (href: string) => {
    if (href === "/") return activePath === "/";
    return activePath === href || activePath.startsWith(href + "/");
  };

  const handleNavClick = (href: string) => {
    if (pathname === href) return;
    startTransition(() => {
      setClickedPath(href);
    });
  };

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label={isOpen ? "Tutup Menu" : "Buka Menu"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay backdrop dengan transisi buka-tutup halus */}
      <div 
        className={`fixed inset-0 top-16 bg-slate-900/30 backdrop-blur-xs z-40 transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Dropdown menu dengan transisi slide & fade terkoordinasi */}
      <div 
        className={`fixed inset-x-0 top-16 bg-white border-b border-slate-200 shadow-xl z-50 p-4 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] origin-top ${
          isOpen 
            ? "opacity-100 translate-y-0 scale-y-100 pointer-events-auto" 
            : "opacity-0 -translate-y-2 scale-y-95 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-1.5">
          {USER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => {
                  setIsOpen(false);
                  handleNavClick(item.href);
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-bold border border-blue-200/80 shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
