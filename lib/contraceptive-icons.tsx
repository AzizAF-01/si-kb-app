import React from "react";
import {
  Pill,
  Leaf,
  ShieldCheck,
  Syringe,
  HeartPulse,
  Calendar,
  Activity,
  Baby,
  Stethoscope,
  Sparkles,
  Clock,
  Layers,
} from "lucide-react";

export type PresetCategoryIconId =
  | "pill"
  | "leaf"
  | "shield"
  | "syringe"
  | "heart"
  | "calendar"
  | "activity"
  | "baby"
  | "stethoscope"
  | "sparkles"
  | "clock"
  | "layers";

/**
 * CategoryIconId dapat berupa ID ikon bawaan (PresetCategoryIconId)
 * maupun URL / Data URL gambar custom hasil upload (string).
 */
export type CategoryIconId = PresetCategoryIconId | string;

export interface CategoryIconOption {
  id: CategoryIconId;
  label: string;
  bgClass: string;
  textClass: string;
  badgeClass: string;
  isCustomImage?: boolean;
}

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  {
    id: "pill",
    label: "Pil / Kapsul",
    bgClass: "bg-blue-100",
    textClass: "text-blue-600",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "leaf",
    label: "Alami / Daun",
    bgClass: "bg-emerald-100",
    textClass: "text-emerald-600",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "shield",
    label: "Perisai / Proteksi",
    bgClass: "bg-indigo-100",
    textClass: "text-indigo-600",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    id: "syringe",
    label: "Suntik / Injeksi",
    bgClass: "bg-cyan-100",
    textClass: "text-cyan-600",
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  {
    id: "heart",
    label: "Kesehatan / Hati",
    bgClass: "bg-rose-100",
    textClass: "text-rose-600",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    id: "calendar",
    label: "Kalender / Siklus",
    bgClass: "bg-amber-100",
    textClass: "text-amber-600",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "stethoscope",
    label: "Klinis / Stetoskop",
    bgClass: "bg-teal-100",
    textClass: "text-teal-600",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
  },
  {
    id: "baby",
    label: "Ibu & Anak",
    bgClass: "bg-pink-100",
    textClass: "text-pink-600",
    badgeClass: "bg-pink-50 text-pink-700 border-pink-200",
  },
  {
    id: "activity",
    label: "Medis / Detak",
    bgClass: "bg-red-100",
    textClass: "text-red-600",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
  {
    id: "clock",
    label: "Waktu / Jangka",
    bgClass: "bg-sky-100",
    textClass: "text-sky-600",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    id: "sparkles",
    label: "Khusus / Modern",
    bgClass: "bg-violet-100",
    textClass: "text-violet-600",
    badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    id: "layers",
    label: "Kelompok Umum",
    bgClass: "bg-purple-100",
    textClass: "text-purple-600",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

export const DEFAULT_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Hormonal: "Menggunakan hormon untuk mencegah pelepasan sel telur.",
  "Non-Hormonal": "Tanpa hormon, bekerja sebagai penghalang atau secara alami.",
  MKJP: "Metode Kontrasepsi Jangka Panjang, perlindungan bertahun-tahun.",
};

export function isCustomImageIcon(iconId?: string | null): boolean {
  if (!iconId) return false;
  const trimmed = iconId.trim();
  return (
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  );
}

export function getDefaultIconForCategory(categoryName: string): CategoryIconId {
  switch (categoryName.trim()) {
    case "Hormonal":
      return "pill";
    case "Non-Hormonal":
      return "leaf";
    case "MKJP":
      return "shield";
    default:
      return "layers";
  }
}

export function getIconOption(
  iconId?: string | null,
  categoryName?: string | null
): CategoryIconOption {
  if (isCustomImageIcon(iconId)) {
    return {
      id: iconId!.trim(),
      label: "Gambar Custom",
      bgClass: "bg-slate-100",
      textClass: "text-slate-700",
      badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
      isCustomImage: true,
    };
  }

  const validOption = CATEGORY_ICON_OPTIONS.find((o) => o.id === iconId);
  if (validOption) return validOption;
  const fallbackId = getDefaultIconForCategory(categoryName || "");
  return CATEGORY_ICON_OPTIONS.find((o) => o.id === fallbackId) || CATEGORY_ICON_OPTIONS[0];
}

/**
 * Mengurai nilai category dari database.
 * Mendukung ikon bawaan maupun URL / Data URL gambar custom dengan format `iconId::NamaKategori`.
 */
export function parseCategoryField(
  rawCategory: string | null | undefined,
  rawCategoryIcon?: string | null
): { name: string; iconId: CategoryIconId } {
  const raw = (rawCategory || "").trim();
  if (!raw) {
    return { name: "Lainnya", iconId: rawCategoryIcon || "layers" };
  }

  if (raw.includes("::")) {
    const sepIdx = raw.lastIndexOf("::");
    const prefix = raw.slice(0, sepIdx).trim();
    const cleanName = raw.slice(sepIdx + 2).trim() || "Lainnya";

    if (isCustomImageIcon(prefix)) {
      return {
        name: cleanName,
        iconId: rawCategoryIcon || prefix,
      };
    }

    const matchedIcon = CATEGORY_ICON_OPTIONS.find((o) => o.id === prefix);
    if (matchedIcon) {
      return {
        name: cleanName,
        iconId: rawCategoryIcon || matchedIcon.id,
      };
    }
  }

  if (isCustomImageIcon(rawCategoryIcon)) {
    return {
      name: raw,
      iconId: rawCategoryIcon!.trim(),
    };
  }

  const defaultIcon = getDefaultIconForCategory(raw);
  const validExplicitIcon = CATEGORY_ICON_OPTIONS.find((o) => o.id === rawCategoryIcon)?.id;

  return {
    name: raw,
    iconId: validExplicitIcon || defaultIcon,
  };
}

/**
 * Memformat nama kategori dan iconId untuk disimpan ke kolom `category`.
 */
export function encodeCategoryWithIcon(categoryName: string, iconId: CategoryIconId): string {
  const cleanName = categoryName.trim();
  return `${iconId}::${cleanName}`;
}

export function CategoryIcon({
  iconId,
  className = "h-6 w-6",
}: {
  iconId?: string | null;
  className?: string;
}) {
  if (isCustomImageIcon(iconId)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconId!}
        alt="Ikon kategori"
        className={`${className} object-contain shrink-0`}
      />
    );
  }

  switch (iconId) {
    case "pill":
      return <Pill className={className} />;
    case "leaf":
      return <Leaf className={className} />;
    case "shield":
      return <ShieldCheck className={className} />;
    case "syringe":
      return <Syringe className={className} />;
    case "heart":
      return <HeartPulse className={className} />;
    case "calendar":
      return <Calendar className={className} />;
    case "activity":
      return <Activity className={className} />;
    case "baby":
      return <Baby className={className} />;
    case "stethoscope":
      return <Stethoscope className={className} />;
    case "sparkles":
      return <Sparkles className={className} />;
    case "clock":
      return <Clock className={className} />;
    case "layers":
    default:
      return <Layers className={className} />;
  }
}
