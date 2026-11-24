"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Edit,
  Trash2,
  X,
  Pill,
  Plus,
  Clock,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  UserCheck,
  Layers,
  Check,
  FolderPlus,
  Upload,
} from "lucide-react";
import {
  CATEGORY_ICON_OPTIONS,
  CategoryIcon,
  CategoryIconId,
  DEFAULT_CATEGORY_DESCRIPTIONS,
  encodeCategoryWithIcon,
  getDefaultIconForCategory,
  getIconOption,
  isCustomImageIcon,
  parseCategoryField,
} from "@/lib/contraceptive-icons";

export interface ContraceptiveItem {
  id: string;
  name: string;
  category: string | null;
  category_icon?: string | null;
  how_it_works: string | null;
  benefits: string[] | null;
  side_effects: string[] | null;
  effectiveness: number | null;
  duration: string | null;
  suitable_for: string | null;
}

const DEFAULT_CATEGORIES = ["Hormonal", "Non-Hormonal", "MKJP"];
const STORAGE_KEY_CATEGORIES = "sikb_custom_contraceptive_categories_v1";

/**
 * Mengekstrak path file di dalam bucket 'articles' dari URL publik Supabase Storage.
 */
function extractStoragePathFromUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const marker = "/storage/v1/object/public/articles/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

/**
 * Mengompresi gambar ikon di sisi client (PNG transparan maks 128x128px)
 * agar ukuran ringan dan transparansi ikon tetap terjaga.
 */
function compressIconImageToDataUrl(file: File, maxSize = 128): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height >= width && height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        // Gunakan PNG agar latar transparan ikon tetap terjaga
        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Gagal memuat file gambar ikon."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file ikon."));
    reader.readAsDataURL(file);
  });
}

export function ContraceptiveManagement({
  initialContraceptives,
}: {
  initialContraceptives: ContraceptiveItem[];
}) {
  // Tab Utama: "items" (Metode Kontrasepsi) | "categories" (Kelompok Kategori)
  const [activeTab, setActiveTab] = useState<"items" | "categories">("items");

  const [selectedFilter, setSelectedFilter] = useState<string>("Semua");

  // Kontrol buka/tutup form tambah/edit metode kontrasepsi (Tab 1)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // State untuk kategori tambahan dan peta ikon kategori
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customCategoryIcons, setCustomCategoryIcons] = useState<Record<string, CategoryIconId>>({});

  // Muat kategori tambahan yang belum memiliki item dari localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          categories?: string[];
          icons?: Record<string, CategoryIconId>;
        };
        if (Array.isArray(parsed.categories)) {
          setCustomCategories(parsed.categories);
        }
        if (parsed.icons && typeof parsed.icons === "object") {
          setCustomCategoryIcons(parsed.icons);
        }
      }
    } catch {
      // Abaikan jika gagal parse localStorage
    }
  }, []);

  const persistCategoriesToLocal = (
    cats: string[],
    icons: Record<string, CategoryIconId>
  ) => {
    try {
      localStorage.setItem(
        STORAGE_KEY_CATEGORIES,
        JSON.stringify({ categories: cats, icons })
      );
    } catch {
      // Abaikan
    }
  };

  // Peta kategori beserta iconId-nya dari data database + state lokal
  const categoryIconMap = useMemo(() => {
    const map: Record<string, CategoryIconId> = {
      Hormonal: "pill",
      "Non-Hormonal": "leaf",
      MKJP: "shield",
    };

    initialContraceptives.forEach((item) => {
      const parsed = parseCategoryField(item.category, item.category_icon);
      if (parsed.name) {
        map[parsed.name] = parsed.iconId;
      }
    });

    Object.entries(customCategoryIcons).forEach(([catName, iconId]) => {
      map[catName] = iconId;
    });

    return map;
  }, [initialContraceptives, customCategoryIcons]);

  // Daftar nama kategori bersih
  const availableCategories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    initialContraceptives.forEach((item) => {
      const parsed = parseCategoryField(item.category, item.category_icon);
      if (parsed.name) set.add(parsed.name);
    });
    customCategories.forEach((cat) => {
      if (cat.trim()) set.add(cat.trim());
    });
    return Array.from(set);
  }, [initialContraceptives, customCategories]);

  // =========================================================
  // STATE TAB 1: Form Metode Kontrasepsi
  // =========================================================
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Hormonal");
  const [howItWorks, setHowItWorks] = useState("");
  const [benefitsText, setBenefitsText] = useState("");
  const [sideEffectsText, setSideEffectsText] = useState("");
  const [effectiveness, setEffectiveness] = useState("");
  const [duration, setDuration] = useState("");
  const [suitableFor, setSuitableFor] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =========================================================
  // STATE TAB 2: Form Kelompok Kategori & Ikon
  // =========================================================
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState<boolean>(false);
  const [editingOriginalCategoryName, setEditingOriginalCategoryName] = useState<string | null>(
    null
  );
  const [categoryFormName, setCategoryFormName] = useState<string>("");
  const [categoryFormIcon, setCategoryFormIcon] = useState<CategoryIconId>("pill");
  const [savingCategory, setSavingCategory] = useState<boolean>(false);
  const [uploadingIcon, setUploadingIcon] = useState<boolean>(false);
  const [uploadedIconName, setUploadedIconName] = useState<string | null>(null);
  const iconFileInputRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const resetFormFields = () => {
    const defaultCat = availableCategories[0] || "Hormonal";
    setName("");
    setCategory(defaultCat);
    setHowItWorks("");
    setBenefitsText("");
    setSideEffectsText("");
    setEffectiveness("");
    setDuration("");
    setSuitableFor("");
    setEditingId(null);
  };

  const handleCloseForm = () => {
    resetFormFields();
    setIsFormOpen(false);
  };

  const handleOpenAddForm = () => {
    resetFormFields();
    if (selectedFilter !== "Semua" && availableCategories.includes(selectedFilter)) {
      setCategory(selectedFilter);
    }
    setIsFormOpen(true);
  };

  const handleEditClick = (item: ContraceptiveItem) => {
    const parsed = parseCategoryField(item.category, item.category_icon);
    setName(item.name || "");
    if (!availableCategories.includes(parsed.name)) {
      setCustomCategories((prev) => [...prev, parsed.name]);
    }
    setCategory(parsed.name);
    setHowItWorks(item.how_it_works || "");
    setBenefitsText(item.benefits && Array.isArray(item.benefits) ? item.benefits.join(", ") : "");
    setSideEffectsText(
      item.side_effects && Array.isArray(item.side_effects) ? item.side_effects.join(", ") : ""
    );
    setEffectiveness(
      item.effectiveness !== null && item.effectiveness !== undefined ? String(item.effectiveness) : ""
    );
    setDuration(item.duration || "");
    setSuitableFor(item.suitable_for || "");
    setEditingId(item.id);
    setActiveTab("items");
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Hapus metode kontrasepsi ini secara permanen?")) return;

    setDeletingId(id);
    const { error } = await supabase.from("contraceptives").delete().eq("id", id);

    if (!error) {
      if (editingId === id) {
        handleCloseForm();
      }
      router.refresh();
    } else {
      alert("Gagal menghapus: " + error.message);
    }
    setDeletingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Nama metode kontrasepsi wajib diisi.");
      return;
    }

    const finalCategoryName = category.trim();
    if (!finalCategoryName) {
      alert("Kelompok kategori wajib dipilih.");
      return;
    }

    const finalIconId =
      categoryIconMap[finalCategoryName] || getDefaultIconForCategory(finalCategoryName);

    setLoading(true);

    const parseArray = (text: string) =>
      text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const parsedEffectiveness = effectiveness.trim() !== "" ? parseFloat(effectiveness) : null;
    const encodedCategory = encodeCategoryWithIcon(finalCategoryName, finalIconId);

    const payload = {
      name: name.trim(),
      category: encodedCategory,
      how_it_works: howItWorks.trim() || null,
      benefits: benefitsText.trim() ? parseArray(benefitsText) : null,
      side_effects: sideEffectsText.trim() ? parseArray(sideEffectsText) : null,
      effectiveness: parsedEffectiveness,
      duration: duration.trim() || null,
      suitable_for: suitableFor.trim() || null,
    };

    let error;
    if (editingId) {
      const res = await supabase.from("contraceptives").update(payload).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("contraceptives").insert(payload);
      error = res.error;
    }

    if (!error) {
      alert(
        editingId
          ? "Metode kontrasepsi berhasil diperbarui!"
          : "Metode kontrasepsi berhasil ditambahkan!"
      );
      handleCloseForm();
      router.refresh();
    } else {
      alert("Gagal menyimpan data: " + error.message);
    }

    setLoading(false);
  };

  // =========================================================
  // HANDLER TAB 2: Kelola Kelompok Kategori & Ikon
  // =========================================================
  const handleOpenAddCategoryForm = () => {
    setEditingOriginalCategoryName(null);
    setCategoryFormName("");
    setCategoryFormIcon("layers");
    setUploadedIconName(null);
    if (iconFileInputRef.current) iconFileInputRef.current.value = "";
    setIsCategoryFormOpen(true);
  };

  const handleOpenEditCategoryForm = (catName: string) => {
    const currentIcon = categoryIconMap[catName] || getDefaultIconForCategory(catName);
    setEditingOriginalCategoryName(catName);
    setCategoryFormName(catName);
    setCategoryFormIcon(currentIcon);
    setUploadedIconName(isCustomImageIcon(currentIcon) ? "Gambar ikon custom" : null);
    if (iconFileInputRef.current) iconFileInputRef.current.value = "";
    setIsCategoryFormOpen(true);
  };

  const handleCloseCategoryForm = () => {
    setEditingOriginalCategoryName(null);
    setCategoryFormName("");
    setCategoryFormIcon("pill");
    setUploadedIconName(null);
    if (iconFileInputRef.current) iconFileInputRef.current.value = "";
    setIsCategoryFormOpen(false);
  };

  const handleIconFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Harap pilih file gambar untuk ikon (PNG, SVG, WEBP, atau JPG).");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("Ukuran file ikon maksimal 3MB.");
      return;
    }

    setUploadingIcon(true);
    try {
      // 1. Coba upload ke Supabase Storage bucket "articles" folder "category-icons" jika bucket ada
      const fileExt = file.name.split(".").pop() || "png";
      const filePath = `category-icons/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("articles")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("articles")
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          setCategoryFormIcon(publicUrlData.publicUrl);
          setUploadedIconName(file.name);
          setUploadingIcon(false);
          return;
        }
      }

      // 2. Fallback otomatis: Kompresi gambar ke Data URL PNG transparan 128x128px
      const compressedDataUrl = await compressIconImageToDataUrl(file);
      setCategoryFormIcon(compressedDataUrl);
      setUploadedIconName(file.name);
    } catch (err: any) {
      alert("Gagal memproses gambar ikon: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleSaveCategoryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetName = categoryFormName.trim();
    if (!targetName) {
      alert("Nama kelompok kategori tidak boleh kosong.");
      return;
    }

    setSavingCategory(true);

    try {
      const sourceCatName = editingOriginalCategoryName || targetName;
      const previousIconId = categoryIconMap[sourceCatName];

      // Update state lokal & localStorage
      const nextCustomCats = Array.from(
        new Set(
          [...customCategories, targetName].filter((c) =>
            editingOriginalCategoryName && c === editingOriginalCategoryName
              ? targetName === editingOriginalCategoryName
              : true
          )
        )
      );
      const nextIcons = { ...customCategoryIcons, [targetName]: categoryFormIcon };

      setCustomCategories(nextCustomCats);
      setCustomCategoryIcons(nextIcons);
      persistCategoriesToLocal(nextCustomCats, nextIcons);

      // Jika sedang mengedit kategori yang sudah memiliki item di database, update semua item di DB
      const matchingItems = initialContraceptives.filter(
        (item) => parseCategoryField(item.category, item.category_icon).name === sourceCatName
      );

      if (matchingItems.length > 0) {
        const ids = matchingItems.map((i) => i.id);
        const encodedCat = encodeCategoryWithIcon(targetName, categoryFormIcon);

        const { error } = await supabase
          .from("contraceptives")
          .update({ category: encodedCat })
          .in("id", ids);

        if (error) {
          alert("Gagal memperbarui kategori di database: " + error.message);
          setSavingCategory(false);
          return;
        }
      }

      // Jika ikon sebelumnya adalah gambar di Supabase Storage dan diganti dengan ikon/gambar baru, hapus file lama
      if (previousIconId && previousIconId !== categoryFormIcon) {
        const oldStoragePath = extractStoragePathFromUrl(previousIconId);
        if (oldStoragePath) {
          await supabase.storage.from("articles").remove([oldStoragePath]);
        }
      }

      if (category === sourceCatName) {
        setCategory(targetName);
      }

      alert(
        editingOriginalCategoryName
          ? `Kelompok kategori "${targetName}" beserta ikonnya berhasil diperbarui!`
          : `Kelompok kategori baru "${targetName}" berhasil ditambahkan!`
      );
      handleCloseCategoryForm();
      router.refresh();
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCustomCategory = (catName: string) => {
    const count = getCategoryCount(catName);
    if (count > 0) {
      alert(
        `Kelompok "${catName}" masih memiliki ${count} metode kontrasepsi. Pindahkan atau hapus metode kontrasepsi di dalamnya terlebih dahulu.`
      );
      return;
    }
    if (!confirm(`Hapus kelompok kategori "${catName}"?`)) return;

    const nextCats = customCategories.filter((c) => c !== catName);
    const nextIcons = { ...customCategoryIcons };
    delete nextIcons[catName];

    setCustomCategories(nextCats);
    setCustomCategoryIcons(nextIcons);
    persistCategoriesToLocal(nextCats, nextIcons);
  };

  const filteredItems = initialContraceptives.filter((item) => {
    if (selectedFilter === "Semua") return true;
    const parsed = parseCategoryField(item.category, item.category_icon);
    return parsed.name === selectedFilter;
  });

  const getCategoryCount = (cat: string) => {
    if (cat === "Semua") return initialContraceptives.length;
    return initialContraceptives.filter(
      (item) => parseCategoryField(item.category, item.category_icon).name === cat
    ).length;
  };

  return (
    <div className="space-y-6">
      {/* Navigasi Sub-Tab: Metode Kontrasepsi vs Kelompok Kategori */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("items")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "items"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Pill className="h-4 w-4 text-red-600" />
            <span>Metode Kontrasepsi</span>
            <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-md text-[10px]">
              {initialContraceptives.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "categories"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="h-4 w-4 text-indigo-600" />
            <span>Kelompok Kategori & Ikon</span>
            <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-md text-[10px]">
              {availableCategories.length}
            </span>
          </button>
        </div>

        {/* Tombol Utama sesuai Tab yang Aktif */}
        {activeTab === "items" ? (
          !isFormOpen ? (
            <Button
              type="button"
              onClick={handleOpenAddForm}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Tambah Kontrasepsi
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseForm}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg px-4 py-2 text-xs font-semibold"
            >
              <X className="h-4 w-4 mr-1.5" /> Tutup Form
            </Button>
          )
        ) : !isCategoryFormOpen ? (
          <Button
            type="button"
            onClick={handleOpenAddCategoryForm}
            className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-sm"
          >
            <FolderPlus className="h-4 w-4 mr-1.5" /> Tambah Kelompok Kategori
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleCloseCategoryForm}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg px-4 py-2 text-xs font-semibold"
          >
            <X className="h-4 w-4 mr-1.5" /> Tutup Form
          </Button>
        )}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: METODE KONTRASEPSI                                             */}
      {/* ===================================================================== */}
      {activeTab === "items" && (
        <div className="space-y-6">
          {/* Deretan Filter Kategori */}
          <div className="flex flex-wrap items-center gap-2">
            {["Semua", ...availableCategories].map((cat) => {
              const active = selectedFilter === cat;
              const count = getCategoryCount(cat);
              const iconId = cat !== "Semua" ? categoryIconMap[cat] : undefined;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedFilter(cat)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                    active
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {iconId && (
                    <CategoryIcon
                      iconId={iconId}
                      className={`h-3.5 w-3.5 ${active ? "text-white" : "text-slate-500"}`}
                    />
                  )}
                  <span>{cat}</span>
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

          {/* Panel Form Tambah / Edit Kontrasepsi (Collapsible) */}
          {isFormOpen && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
              <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingId ? "Edit Metode Kontrasepsi" : "Tambah Metode Kontrasepsi Baru"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lengkapi informasi metode kontrasepsi di bawah ini.
                  </p>
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

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Nama Metode */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Metode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Contoh: Pil KB, IUD (Spiral)"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  {/* Kelompok Kategori */}
                  <div className="md:col-span-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Kelompok Kategori <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("categories");
                          handleOpenAddCategoryForm();
                        }}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Kelola Kelompok &rarr;
                      </button>
                    </div>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Efektivitas & Durasi */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Efektivitas (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={effectiveness}
                      onChange={(e) => setEffectiveness(e.target.value)}
                      placeholder="99.4"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Durasi
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Harian / 3 tahun"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Cara Kerja & Cocok Untuk */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Cara Kerja
                    </label>
                    <textarea
                      rows={2}
                      value={howItWorks}
                      onChange={(e) => setHowItWorks(e.target.value)}
                      placeholder="Contoh: Diminum setiap hari pada jam yang sama untuk mencegah pelepasan sel telur."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Cocok Untuk
                    </label>
                    <textarea
                      rows={2}
                      value={suitableFor}
                      onChange={(e) => setSuitableFor(e.target.value)}
                      placeholder="Contoh: Ibu menyusui, pasangan yang ingin menunda kehamilan jangka panjang."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Manfaat & Efek Samping */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Keunggulan / Manfaat{" "}
                      <span className="text-slate-400 font-normal">(Pisahkan dengan koma)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={benefitsText}
                      onChange={(e) => setBenefitsText(e.target.value)}
                      placeholder="Mudah digunakan, Kesuburan cepat kembali, Siklus haid teratur"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Efek Samping Umum{" "}
                      <span className="text-slate-400 font-normal">(Pisahkan dengan koma)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={sideEffectsText}
                      onChange={(e) => setSideEffectsText(e.target.value)}
                      placeholder="Mual ringan, Perubahan pola haid, Nyeri payudara"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Footer Tombol Form */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseForm}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg px-5 py-2 text-xs font-semibold"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-6 py-2 font-semibold text-xs transition-colors"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {loading
                      ? "Menyimpan..."
                      : editingId
                      ? "Simpan Perubahan"
                      : "Simpan Kontrasepsi"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Daftar Kartu Kontrasepsi */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 bg-slate-50/50">
              <Pill className="h-10 w-10 text-slate-300 mx-auto mb-2.5" />
              <p className="font-semibold text-slate-700 mb-1">Belum ada data metode kontrasepsi</p>
              <p className="text-xs text-slate-500 mb-4">
                {selectedFilter !== "Semua"
                  ? `Tidak ada metode kontrasepsi pada kelompok "${selectedFilter}".`
                  : "Mulai tambahkan data metode kontrasepsi untuk ditampilkan di halaman edukasi."}
              </p>
              {!isFormOpen && (
                <Button
                  type="button"
                  onClick={handleOpenAddForm}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-xs font-semibold"
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Tambah Kontrasepsi Baru
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const parsedCat = parseCategoryField(item.category, item.category_icon);
                const iconOpt = getIconOption(
                  categoryIconMap[parsedCat.name] || parsedCat.iconId,
                  parsedCat.name
                );

                return (
                  <div
                    key={item.id}
                    className={`p-5 border rounded-2xl flex flex-col justify-between transition-all ${
                      editingId === item.id
                        ? "border-red-500 bg-red-50/20 ring-1 ring-red-500 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                            {parsedCat.name && (
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${iconOpt.badgeClass}`}
                              >
                                <CategoryIcon iconId={iconOpt.id} className="h-3.5 w-3.5" />
                                {parsedCat.name}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {item.effectiveness !== null && item.effectiveness !== undefined && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                Efektivitas {item.effectiveness}%
                              </span>
                            )}
                            {item.duration && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                <Clock className="h-3 w-3 text-slate-500" />
                                {item.duration}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(item)}
                            className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deletingId === item.id}
                            onClick={() => handleDeleteClick(item.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                            title="Hapus metode kontrasepsi"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {item.how_it_works && (
                        <p className="text-xs text-slate-600 leading-relaxed mb-3.5">
                          {item.how_it_works}
                        </p>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 mt-auto">
                      {item.benefits && item.benefits.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <div className="leading-snug">
                            <span className="font-semibold text-slate-800">Manfaat: </span>
                            <span>{item.benefits.join(", ")}</span>
                          </div>
                        </div>
                      )}

                      {item.side_effects && item.side_effects.length > 0 && (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <div className="leading-snug">
                            <span className="font-semibold text-slate-800">Efek Samping: </span>
                            <span>{item.side_effects.join(", ")}</span>
                          </div>
                        </div>
                      )}

                      {item.suitable_for && (
                        <div className="flex items-start gap-2">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="leading-snug">
                            <span className="font-semibold text-slate-800">Cocok Untuk: </span>
                            <span>{item.suitable_for}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: KELOMPOK KATEGORI & IKON                                       */}
      {/* ===================================================================== */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          {/* Form Tambah / Edit Kelompok Kategori (Collapsible) */}
          {isCategoryFormOpen && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingOriginalCategoryName
                      ? `Edit Kelompok Kategori: ${editingOriginalCategoryName}`
                      : "Tambah Kelompok Kategori Baru"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tentukan nama kelompok kategori dan pilih ikon bawaan atau upload gambar ikon sendiri.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseCategoryForm}
                  className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 h-8 px-2.5 rounded-lg"
                >
                  <X className="h-4 w-4 mr-1" /> Tutup
                </Button>
              </div>

              <form onSubmit={handleSaveCategoryForm} className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Input Nama Kelompok, Upload Gambar Ikon & Live Preview */}
                  <div className="lg:col-span-5 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Nama Kelompok Kategori <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={categoryFormName}
                        onChange={(e) => setCategoryFormName(e.target.value)}
                        required
                        placeholder="Contoh: Kontrasepsi Mantap, Darurat"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    {/* Upload Gambar Ikon Sendiri */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Upload Gambar Ikon Sendiri{" "}
                        <span className="text-slate-400 font-normal">(Opsional)</span>
                      </label>
                      <input
                        ref={iconFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleIconFileUpload}
                        className="hidden"
                        id="category-custom-icon-upload"
                      />
                      <label
                        htmlFor="category-custom-icon-upload"
                        className={`flex items-center justify-center gap-2.5 w-full p-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                          uploadingIcon
                            ? "border-slate-300 bg-slate-100 cursor-wait"
                            : isCustomImageIcon(categoryFormIcon)
                            ? "border-emerald-400 bg-emerald-50/40"
                            : "border-slate-300 bg-white hover:border-red-400 hover:bg-red-50/20"
                        }`}
                      >
                        {uploadingIcon ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                            <span>Memproses ikon...</span>
                          </div>
                        ) : (
                          <>
                            <div className="p-2 rounded-lg bg-red-50 text-red-600 shrink-0">
                              <Upload className="h-4 w-4" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">
                                {uploadedIconName
                                  ? `Ikon: ${uploadedIconName}`
                                  : "Klik untuk upload gambar ikon"}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                PNG transparan, SVG, WEBP, atau JPG (Maks. 3MB)
                              </p>
                            </div>
                          </>
                        )}
                      </label>
                    </div>

                    {/* Preview Tampilan di Halaman Publik */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Preview Tampilan di Halaman Publik
                      </label>
                      {(() => {
                        const previewOpt = getIconOption(
                          categoryFormIcon,
                          categoryFormName || "Kelompok Baru"
                        );
                        const previewName = categoryFormName.trim() || "Nama Kelompok";
                        const previewDesc =
                          DEFAULT_CATEGORY_DESCRIPTIONS[previewName] ||
                          `Pilihan metode kontrasepsi dalam kelompok ${previewName}.`;
                        return (
                          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-4 shadow-sm">
                            <div
                              className={`${previewOpt.bgClass} ${previewOpt.textClass} p-3 rounded-2xl shrink-0 flex items-center justify-center`}
                            >
                              <CategoryIcon iconId={previewOpt.id} className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-slate-900">{previewName}</h4>
                              <p className="text-xs text-slate-600 mt-0.5">{previewDesc}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Pilihan 12 Ikon Visual Bawaan */}
                  <div className="lg:col-span-7">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Atau Pilih dari Ikon Bawaan
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {CATEGORY_ICON_OPTIONS.map((opt) => {
                        const selected = categoryFormIcon === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setCategoryFormIcon(opt.id);
                              setUploadedIconName(null);
                              if (iconFileInputRef.current) iconFileInputRef.current.value = "";
                            }}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                              selected
                                ? "bg-white border-slate-900 ring-1 ring-slate-900 shadow-sm"
                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div
                              className={`${opt.bgClass} ${opt.textClass} p-2 rounded-xl shrink-0`}
                            >
                              <CategoryIcon iconId={opt.id} className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-800 truncate flex-1">
                              {opt.label}
                            </span>
                            {selected && <Check className="h-3.5 w-3.5 text-slate-900 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseCategoryForm}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg px-5 py-2 text-xs font-semibold"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={savingCategory || uploadingIcon}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-6 py-2 font-semibold text-xs transition-colors"
                  >
                    {savingCategory ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {savingCategory
                      ? "Menyimpan..."
                      : editingOriginalCategoryName
                      ? "Simpan Perubahan Kelompok"
                      : "Simpan Kelompok Baru"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Daftar Kartu Kelompok Kategori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableCategories.map((catName) => {
              const iconId = categoryIconMap[catName] || getDefaultIconForCategory(catName);
              const opt = getIconOption(iconId, catName);
              const count = getCategoryCount(catName);
              const isDefault = DEFAULT_CATEGORIES.includes(catName);
              const desc =
                DEFAULT_CATEGORY_DESCRIPTIONS[catName] ||
                `Pilihan metode kontrasepsi dalam kelompok ${catName}.`;

              return (
                <div
                  key={catName}
                  className={`p-5 border rounded-2xl bg-white flex flex-col justify-between gap-4 transition-all ${
                    editingOriginalCategoryName === catName && isCategoryFormOpen
                      ? "border-red-500 ring-1 ring-red-500 bg-red-50/10"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`${opt.bgClass} ${opt.textClass} p-3 rounded-2xl shrink-0 flex items-center justify-center`}
                    >
                      <CategoryIcon iconId={opt.id} className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900">{catName}</h3>
                        <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {count} Metode
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Tema Ikon: <strong className="text-slate-600">{opt.label}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditCategoryForm(catName)}
                        className="h-8 px-3 text-xs text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1.5" /> Ubah Ikon / Nama
                      </Button>

                      {!isDefault && count === 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCustomCategory(catName)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                          title="Hapus kelompok kosong"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
