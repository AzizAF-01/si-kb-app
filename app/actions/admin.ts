"use server";

import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const getAdminClient = () => {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

export async function createNewUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const phone = (formData.get("phone") as string) || null;

  if (!email || !password || !name) {
    return { error: "Nama, email, dan password wajib diisi" };
  }

  const supabaseAdmin = getAdminClient();

  try {
    // Jika SUPABASE_SERVICE_ROLE_KEY tersedia, gunakan Admin API
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: name },
      });

      if (authError) throw authError;

      if (authData.user) {
        const profilePayload = {
          id: authData.user.id,
          full_name: name,
          role: role,
          phone: phone,
        };

        let { error: profileError } = await supabaseAdmin
          .from("profiles")
          .upsert(profilePayload, { onConflict: "id" });

        if (profileError) {
          const supabaseServer = await createServerClient();
          const fallbackRes = await supabaseServer
            .from("profiles")
            .upsert(profilePayload, { onConflict: "id" });
          profileError = fallbackRes.error;
        }

        if (profileError) throw profileError;
      }
    } else {
      // Fallback menggunakan signUp dengan client non-persisted session agar tidak menimpa cookie admin
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        const supabaseServer = await createServerClient();
        const { error: profileError } = await supabaseServer
          .from("profiles")
          .upsert({
            id: signUpData.user.id,
            full_name: name,
            role: role,
            phone: phone,
          }, { onConflict: "id" });

        if (profileError) throw profileError;
      }
    }

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/konsultasi");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateExistingUser(formData: FormData) {
  const id = formData.get("id") as string;
  const fullName = (formData.get("name") as string)?.trim();
  const role = formData.get("role") as string;
  const phone = ((formData.get("phone") as string) || "").trim() || null;

  if (!id || !fullName || !role) {
    return { error: "ID, Nama Lengkap, dan Peran wajib diisi." };
  }

  const updatePayload = {
    full_name: fullName,
    role: role,
    phone: phone,
  };

  try {
    let data: any[] | null = null;
    let lastError: any = null;

    // 1. Coba gunakan Service Role terlebih dahulu jika tersedia
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminClient = getAdminClient();
      const adminRes = await adminClient
        .from("profiles")
        .update(updatePayload)
        .eq("id", id)
        .select();

      if (!adminRes.error && adminRes.data && adminRes.data.length > 0) {
        data = adminRes.data;
      } else {
        lastError = adminRes.error;
      }
    }

    // 2. Fallback ke sesi Server Client (authenticated Admin) jika Service Role gagal / belum diberi GRANT
    if (!data) {
      const serverClient = await createServerClient();
      const serverRes = await serverClient
        .from("profiles")
        .update(updatePayload)
        .eq("id", id)
        .select();

      if (serverRes.error) {
        throw serverRes.error;
      }
      data = serverRes.data;
    }

    if (!data || data.length === 0) {
      if (lastError) throw lastError;
      return {
        error:
          "Gagal memperbarui profil. Jalankan skrip SQL 'supabase/schema_profiles_admin.sql' di SQL Editor Supabase untuk memberikan izin UPDATE kepada Admin dan service_role.",
      };
    }

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/konsultasi");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function saveContraceptiveHeader(header: {
  badge: string;
  title: string;
  description: string;
}) {
  const badge = header.badge?.trim() || "Info Kontrasepsi";
  const title = header.title?.trim() || "Kenali pilihan kontrasepsi Anda";
  const description = header.description?.trim() || "";

  const payload = {
    name: "__HEADER_CONFIG__",
    category: "__SYSTEM__",
    how_it_works: JSON.stringify({ badge, title, description }),
  };

  try {
    const supabase = await createServerClient();

    // Cek apakah sudah ada data header di database
    const { data: existing } = await supabase
      .from("contraceptives")
      .select("id")
      .eq("name", "__HEADER_CONFIG__")
      .maybeSingle();

    let error: { message: string } | null = null;
    if (existing) {
      const res = await supabase
        .from("contraceptives")
        .update(payload)
        .eq("id", existing.id);
      error = res.error;
    } else {
      const res = await supabase.from("contraceptives").insert(payload);
      error = res.error;
    }

    if (error) {
      // Fallback menggunakan admin client jika service role key tersedia
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const adminClient = getAdminClient();
        if (existing) {
          const res = await adminClient
            .from("contraceptives")
            .update(payload)
            .eq("id", existing.id);
          if (res.error) throw res.error;
        } else {
          const res = await adminClient.from("contraceptives").insert(payload);
          if (res.error) throw res.error;
        }
      } else {
        throw error;
      }
    }

    revalidatePath("/kontrasepsi");
    revalidatePath("/admin/contraceptives");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan teks header kontrasepsi.";
    return { error: message };
  }
}

export async function saveArticleHeader(header: {
  badge: string;
  title: string;
  description: string;
}) {
  const badge = header.badge?.trim() || "Info KB & Reproduksi";
  const title = header.title?.trim() || "Pusat Edukasi Keluarga Berencana";
  const description = header.description?.trim() || "";

  const payload = {
    title: "__HEADER_CONFIG__",
    category: "__SYSTEM__",
    content: JSON.stringify({ badge, title, description }),
    image_url: "https://images.unsplash.com/photo-1584982751601-97d8cb0f6669?q=80&w=800&auto=format&fit=crop",
  };

  try {
    const supabase = await createServerClient();

    const { data: existing } = await supabase
      .from("articles")
      .select("id")
      .eq("title", "__HEADER_CONFIG__")
      .maybeSingle();

    let error: { message: string } | null = null;
    if (existing) {
      const res = await supabase
        .from("articles")
        .update(payload)
        .eq("id", existing.id);
      error = res.error;
    } else {
      const res = await supabase.from("articles").insert(payload);
      error = res.error;
    }

    if (error) {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const adminClient = getAdminClient();
        if (existing) {
          const res = await adminClient
            .from("articles")
            .update(payload)
            .eq("id", existing.id);
          if (res.error) throw res.error;
        } else {
          const res = await adminClient.from("articles").insert(payload);
          if (res.error) throw res.error;
        }
      } else {
        throw error;
      }
    }

    revalidatePath("/info-kb");
    revalidatePath("/admin/articles");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan teks header artikel.";
    return { error: message };
  }
}

export async function saveFacilityHeader(header: {
  badge: string;
  title: string;
  description: string;
}) {
  const badge = header.badge?.trim() || "Jadwal Layanan";
  const title = header.title?.trim() || "Temukan layanan KB di dekat Anda";
  const description = header.description?.trim() || "";

  const payload = {
    name: "__HEADER_CONFIG__",
    type: "__SYSTEM__",
    address: JSON.stringify({ badge, title, description }),
    schedule: null,
    services: [],
  };

  try {
    const supabase = await createServerClient();

    const { data: existing } = await supabase
      .from("facilities")
      .select("id")
      .eq("name", "__HEADER_CONFIG__")
      .maybeSingle();

    let error: { message: string } | null = null;
    if (existing) {
      const res = await supabase
        .from("facilities")
        .update(payload)
        .eq("id", existing.id);
      error = res.error;
    } else {
      const res = await supabase.from("facilities").insert(payload);
      error = res.error;
    }

    if (error) {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const adminClient = getAdminClient();
        if (existing) {
          const res = await adminClient
            .from("facilities")
            .update(payload)
            .eq("id", existing.id);
          if (res.error) throw res.error;
        } else {
          const res = await adminClient.from("facilities").insert(payload);
          if (res.error) throw res.error;
        }
      } else {
        throw error;
      }
    }

    revalidatePath("/jadwal-layanan");
    revalidatePath("/admin/facilities");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan teks header jadwal layanan.";
    return { error: message };
  }
}
