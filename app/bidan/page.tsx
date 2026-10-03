import { createClient } from "@/lib/supabase/server";
import { BidanChatDashboard } from "@/components/bidan/BidanChatDashboard";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function BidanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <BidanChatDashboard bidanId={user.id} />;
}
