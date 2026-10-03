"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Kita HARUS menggunakan SERVICE_ROLE_KEY agar proses pembuatan user tidak me-logout sesi admin saat ini
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function createNewUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;

  if (!email || !password || !name) {
    return { error: "Semua data wajib diisi" };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY belum ditambahkan di .env.local" };
  }

  try {
    // 1. Buat user baru menggunakan Admin API (tanpa memengaruhi sesi login saat ini)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: name }
    });

    if (authError) throw authError;

    // 2. Beri jeda 1 detik agar trigger Supabase selesai membuat profil
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Update role di tabel profiles
    if (authData.user) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ role: role })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;
    }

    revalidatePath("/admin");
    return { success: true };
    
  } catch (error: any) {
    return { error: error.message };
  }
}
