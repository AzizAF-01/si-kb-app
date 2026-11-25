export interface ArticleHeaderConfig {
  badge: string;
  title: string;
  description: string;
}

export const DEFAULT_ARTICLE_HEADER: ArticleHeaderConfig = {
  badge: "Info KB & Reproduksi",
  title: "Pusat Edukasi Keluarga Berencana",
  description:
    "Dapatkan informasi terpercaya seputar kesehatan reproduksi, metode kontrasepsi, dan perencanaan keluarga dari pakarnya.",
};

export const ARTICLE_HEADER_CONFIG_KEY = "__HEADER_CONFIG__";
export const ARTICLE_SYSTEM_CATEGORY_KEY = "__SYSTEM__";

/**
 * Mengekstrak konfigurasi header halaman edukasi artikel dari baris data database.
 * Menyaring baris konfigurasi agar tidak bercampur dengan daftar artikel publik.
 */
export function extractArticleHeader<
  T extends { title?: string | null; category?: string | null; content?: string | null }
>(
  rows?: T[] | null
): { header: ArticleHeaderConfig; cleanedRows: T[] } {
  if (!rows || rows.length === 0) {
    return { header: DEFAULT_ARTICLE_HEADER, cleanedRows: [] };
  }

  const headerRow = rows.find(
    (r) => r.title === ARTICLE_HEADER_CONFIG_KEY || r.category === ARTICLE_SYSTEM_CATEGORY_KEY
  );

  let header: ArticleHeaderConfig = { ...DEFAULT_ARTICLE_HEADER };

  if (headerRow && headerRow.content) {
    try {
      const parsed = JSON.parse(headerRow.content);
      if (parsed && typeof parsed === "object") {
        header = {
          badge:
            typeof parsed.badge === "string" && parsed.badge.trim()
              ? parsed.badge.trim()
              : DEFAULT_ARTICLE_HEADER.badge,
          title:
            typeof parsed.title === "string" && parsed.title.trim()
              ? parsed.title.trim()
              : DEFAULT_ARTICLE_HEADER.title,
          description:
            typeof parsed.description === "string"
              ? parsed.description
              : DEFAULT_ARTICLE_HEADER.description,
        };
      }
    } catch {
      // Abaikan jika teks bukan format JSON
    }
  }

  const cleanedRows = rows.filter(
    (r) => r.title !== ARTICLE_HEADER_CONFIG_KEY && r.category !== ARTICLE_SYSTEM_CATEGORY_KEY
  );

  return { header, cleanedRows };
}
