export interface FacilityHeaderConfig {
  badge: string;
  title: string;
  description: string;
}

export const DEFAULT_FACILITY_HEADER: FacilityHeaderConfig = {
  badge: "Jadwal Layanan",
  title: "Temukan layanan KB di dekat Anda",
  description:
    "Daftar Puskesmas, Posyandu, klinik, dan praktik perawat beserta alamat dan jam layanannya. Datang sesuai jadwal agar Anda dilayani dengan nyaman.",
};

export const FACILITY_HEADER_CONFIG_KEY = "__HEADER_CONFIG__";
export const FACILITY_SYSTEM_TYPE_KEY = "__SYSTEM__";

/**
 * Mengekstrak konfigurasi header halaman fasilitas dan jadwal layanan dari baris data database.
 * Menyaring baris konfigurasi agar tidak bercampur dengan daftar fasilitas publik.
 */
export function extractFacilityHeader<
  T extends { name?: string | null; type?: string | null; address?: string | null }
>(
  rows?: T[] | null
): { header: FacilityHeaderConfig; cleanedRows: T[] } {
  if (!rows || rows.length === 0) {
    return { header: DEFAULT_FACILITY_HEADER, cleanedRows: [] };
  }

  const headerRow = rows.find(
    (r) => r.name === FACILITY_HEADER_CONFIG_KEY || r.type === FACILITY_SYSTEM_TYPE_KEY
  );

  let header: FacilityHeaderConfig = { ...DEFAULT_FACILITY_HEADER };

  if (headerRow && headerRow.address) {
    try {
      const parsed = JSON.parse(headerRow.address);
      if (parsed && typeof parsed === "object") {
        header = {
          badge:
            typeof parsed.badge === "string" && parsed.badge.trim()
              ? parsed.badge.trim()
              : DEFAULT_FACILITY_HEADER.badge,
          title:
            typeof parsed.title === "string" && parsed.title.trim()
              ? parsed.title.trim()
              : DEFAULT_FACILITY_HEADER.title,
          description:
            typeof parsed.description === "string"
              ? parsed.description
              : DEFAULT_FACILITY_HEADER.description,
        };
      }
    } catch {
      // Abaikan jika teks bukan format JSON
    }
  }

  const cleanedRows = rows.filter(
    (r) => r.name !== FACILITY_HEADER_CONFIG_KEY && r.type !== FACILITY_SYSTEM_TYPE_KEY
  );

  return { header, cleanedRows };
}
