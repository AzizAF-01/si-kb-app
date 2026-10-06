import { createClient } from "@/lib/supabase/server";
import { PerawatChatDashboard } from "@/components/perawat/PerawatChatDashboard";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function PerawatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <PerawatChatDashboard perawatId={user.id} />;
}
