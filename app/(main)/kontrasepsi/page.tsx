import { CheckCircle2, Pill, Clock, Sparkles, AlertCircle, UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  CategoryIcon,
  CategoryIconId,
  DEFAULT_CATEGORY_DESCRIPTIONS,
  getIconOption,
  parseCategoryField,
} from "@/lib/contraceptive-icons";

export const dynamic = 'force-dynamic';

interface ContraceptiveRow {
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

export default async function KontrasepsiPage() {
  const supabase = await createClient();

  const { data: contraceptivesData, error } = await supabase
    .from("contraceptives")
    .select("*")
    .order("name", { ascending: true });

  const contraceptives: ContraceptiveRow[] = contraceptivesData || [];

  // Kumpulkan kategori unik beserta iconId yang dikonfigurasi dari database
  const categoryIconMap: Record<string, CategoryIconId> = {};
  contraceptives.forEach((c) => {
    const parsed = parseCategoryField(c.category, c.category_icon);
    categoryIconMap[parsed.name] = parsed.iconId;
  });

  // Urutkan kelompok kategori: utamakan Hormonal, Non-Hormonal, MKJP, lalu diikuti kategori baru lainnya secara dinamis
  const defaultOrder = ["Hormonal", "Non-Hormonal", "MKJP"];
  const allCategories = Array.from(
    new Set(contraceptives.map((c) => parseCategoryField(c.category, c.category_icon).name))
  ).sort((a, b) => {
    const idxA = defaultOrder.indexOf(a);
    const idxB = defaultOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const formatArray = (arr: string[] | null) => {
    if (!arr || arr.length === 0) return "-";
    return Array.isArray(arr) ? arr.join(", ") : String(arr);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-6xl">
      <div className="max-w-2xl mb-16">
        <p className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-4">Info Kontrasepsi</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
          Kenali pilihan kontrasepsi Anda
        </h1>
        <p className="text-lg text-slate-600">
          Setiap metode punya cara kerja dan kelebihan masing-masing. Pelajari perbedaannya, lalu diskusikan dengan tenaga kesehatan untuk memilih yang paling cocok.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100">
          Gagal memuat data kontrasepsi dari database: {error.message}
        </div>
      )}

      {contraceptives.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 mb-16">
          <Pill className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">Belum ada data metode kontrasepsi di database.</p>
          <p className="text-sm text-slate-400 mt-1">Admin dapat menambahkan data melalui menu Kelola Kontrasepsi di Dashboard Admin.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-14 mb-20">
            {allCategories.map((categoryName) => {
              const itemsInCategory = contraceptives.filter(
                (c) => parseCategoryField(c.category, c.category_icon).name === categoryName
              );
              if (itemsInCategory.length === 0) return null;

              const iconId = categoryIconMap[categoryName];
              const iconOpt = getIconOption(iconId, categoryName);
              const description =
                DEFAULT_CATEGORY_DESCRIPTIONS[categoryName] ||
                `Pilihan metode kontrasepsi dalam kelompok ${categoryName}.`;

              return (
                <section key={categoryName}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`${iconOpt.bgClass} ${iconOpt.textClass} p-3 rounded-2xl shrink-0`}>
                      <CategoryIcon iconId={iconOpt.id} className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">{categoryName}</h2>
                      <p className="text-slate-600">{description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-0 md:ml-16">
                    {itemsInCategory.map((item) => (
                      <ContraceptiveCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Comparison Table Section */}
          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Tabel perbandingan metode</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full text-left text-sm text-slate-600 min-w-[950px]">
                <thead className="bg-blue-50 text-blue-800 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-2xl">Metode</th>
                    <th className="px-6 py-4">Kelompok</th>
                    <th className="px-6 py-4">Efektivitas</th>
                    <th className="px-6 py-4">Durasi</th>
                    <th className="px-6 py-4">Manfaat / Kelebihan</th>
                    <th className="px-6 py-4">Efek Samping Umum</th>
                    <th className="px-6 py-4 rounded-tr-2xl">Cocok Untuk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contraceptives.map((item) => {
                    const parsedCat = parseCategoryField(item.category, item.category_icon);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors align-top">
                        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{parsedCat.name || "-"}</td>
                        <td className="px-6 py-4 font-semibold text-emerald-600 whitespace-nowrap">
                          {item.effectiveness !== null && item.effectiveness !== undefined ? `${item.effectiveness}%` : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.duration || "-"}</td>
                        <td className="px-6 py-4">{formatArray(item.benefits)}</td>
                        <td className="px-6 py-4">{formatArray(item.side_effects)}</td>
                        <td className="px-6 py-4">{item.suitable_for || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function ContraceptiveCard({ item }: { item: ContraceptiveRow }) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-md hover:border-blue-100 transition-all duration-300">
      {/* Header: Nama & Badges */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
        <div className="flex flex-wrap items-center gap-1.5">
          {item.duration && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              {item.duration}
            </span>
          )}
          {item.effectiveness !== null && item.effectiveness !== undefined && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              Efektivitas {item.effectiveness}%
            </span>
          )}
        </div>
      </div>

      {/* Cara Kerja (how_it_works) */}
      {item.how_it_works && (
        <p className="text-slate-600 mb-5 text-sm md:text-base leading-relaxed">
          {item.how_it_works}
        </p>
      )}

      {/* Detail Informasi dari Database: Benefits, Side Effects, Suitable For */}
      <div className="space-y-3 mt-auto pt-4 border-t border-slate-100 text-xs md:text-sm">
        {item.benefits && item.benefits.length > 0 && (
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Manfaat: </span>
              <span className="text-slate-600">{item.benefits.join(", ")}</span>
            </div>
          </div>
        )}

        {item.side_effects && item.side_effects.length > 0 && (
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Efek Samping: </span>
              <span className="text-slate-600">{item.side_effects.join(", ")}</span>
            </div>
          </div>
        )}

        {item.suitable_for && (
          <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100 mt-2">
            <UserCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Cocok Untuk: </span>
              <span className="text-slate-600">{item.suitable_for}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
