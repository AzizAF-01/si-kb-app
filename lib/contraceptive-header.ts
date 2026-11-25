export interface ContraceptiveHeaderConfig {
  badge: string;
  title: string;
  description: string;
}

export const DEFAULT_CONTRACEPTIVE_HEADER: ContraceptiveHeaderConfig = {
  badge: "Info Kontrasepsi",
  title: "Kenali pilihan kontrasepsi Anda",
  description:
    "Setiap metode punya cara kerja dan kelebihan masing-masing. Pelajari perbedaannya, lalu diskusikan dengan tenaga kesehatan untuk memilih yang paling cocok.",
};

export const HEADER_CONFIG_KEY = "__HEADER_CONFIG__";
export const SYSTEM_CATEGORY_KEY = "__SYSTEM__";

/**
 * Mengekstrak konfigurasi header halaman edukasi kontrasepsi dari baris data database.
 * Menyaring baris konfigurasi agar tidak bercampur dengan daftar metode kontrasepsi umum.
 */
export function extractContraceptiveHeader<T extends { name: string; category?: string | null; how_it_works?: string | null }>(
  rows?: T[] | null
): { header: ContraceptiveHeaderConfig; cleanedRows: T[] } {
  if (!rows || rows.length === 0) {
    return { header: DEFAULT_CONTRACEPTIVE_HEADER, cleanedRows: [] };
  }

  const headerRow = rows.find(
    (r) => r.name === HEADER_CONFIG_KEY || r.category === SYSTEM_CATEGORY_KEY
  );

  let header: ContraceptiveHeaderConfig = { ...DEFAULT_CONTRACEPTIVE_HEADER };

  if (headerRow && headerRow.how_it_works) {
    try {
      const parsed = JSON.parse(headerRow.how_it_works);
      if (parsed && typeof parsed === "object") {
        header = {
          badge:
            typeof parsed.badge === "string" && parsed.badge.trim()
              ? parsed.badge.trim()
              : DEFAULT_CONTRACEPTIVE_HEADER.badge,
          title:
            typeof parsed.title === "string" && parsed.title.trim()
              ? parsed.title.trim()
              : DEFAULT_CONTRACEPTIVE_HEADER.title,
          description:
            typeof parsed.description === "string"
              ? parsed.description
              : DEFAULT_CONTRACEPTIVE_HEADER.description,
        };
      }
    } catch {
      // Abaikan jika teks bukan format JSON
    }
  }

  const cleanedRows = rows.filter(
    (r) => r.name !== HEADER_CONFIG_KEY && r.category !== SYSTEM_CATEGORY_KEY
  );

  return { header, cleanedRows };
}
