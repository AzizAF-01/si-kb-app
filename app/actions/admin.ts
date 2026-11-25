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
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .upsert({
            id: authData.user.id,
            full_name: name,
            role: role,
            phone: phone,
          }, { onConflict: "id" });

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

  try {
    // Gunakan Service Role jika ada, atau gunakan sesi Super Admin saat ini
    const client = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? getAdminClient()
      : await createServerClient();

    const { data, error } = await client
      .from("profiles")
      .update({
        full_name: fullName,
        role: role,
        phone: phone,
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        error:
          "Gagal memperbarui profil. Pastikan kebijakan RLS tabel 'profiles' di Supabase mengizinkan Admin melakukan UPDATE.",
      };
    }

    revalidatePath("/admin");
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
