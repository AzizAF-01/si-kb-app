"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function LogoutButton({ variant = "outline", className = "" }: { variant?: any, className?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    // Hapus sesi dari client-side browser
    await supabase.auth.signOut();
    
    // Gunakan hard reload untuk memaksa Next.js membuang semua cache dan memuat ulang Navbar
    window.location.href = "/";
  };

  return (
    <Button 
      variant={variant} 
      className={className} 
      onClick={handleLogout}
      disabled={loading}
      type="button"
    >
      {loading ? "Logout..." : "Logout"}
    </Button>
  );
}
