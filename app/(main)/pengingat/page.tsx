import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReminderForm } from "@/components/pengingat/ReminderForm";
import { CalendarHeart, Pill, CalendarCheck, Users } from "lucide-react";

export const dynamic = 'force-dynamic';

// Fungsi helper untuk menghitung hari
function getDaysLeftInfo(dateString: string) {
  const targetDate = new Date(dateString);
  const today = new Date();
  
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { text: "Hari ini", style: "bg-blue-500 text-white" };
  if (diffDays === 1) return { text: "Besok", style: "bg-emerald-50 text-emerald-700" };
  if (diffDays < 0) return { text: "Terlewat", style: "bg-red-50 text-red-600" };
  return { text: `${diffDays} hari lagi`, style: "bg-emerald-50 text-emerald-700" };
}

// Fungsi helper untuk icon berdasarkan kategori
function getIconForCategory(category: string) {
  switch (category) {
    case 'Jadwal suntik KB': return <CalendarHeart className="h-6 w-6" />;
    case 'Minum pil KB': return <Pill className="h-6 w-6" />;
    case 'Kunjungan ulang': return <CalendarCheck className="h-6 w-6" />;
    case 'Konseling': return <Users className="h-6 w-6" />;
    default: return <CalendarHeart className="h-6 w-6" />;
  }
}

export default async function PengingatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Mengambil daftar pengingat yang belum selesai
  const { data: reminders } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_done", false)
    .order("remind_at", { ascending: true });

  const activeCount = reminders?.length || 0;

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-6xl">
      <div className="max-w-2xl mb-12">
        <p className="text-sm font-bold text-teal-600 tracking-widest uppercase mb-4">Pengingat</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
          Jadwal KB Anda, tidak ada yang terlewat
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Tambahkan pengingat untuk suntik, minum pil, atau kunjungan ulang. SI-KB akan menyimpan jadwal dan membantu Anda mengingatnya.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form (Client Component) */}
        <div className="lg:col-span-1">
          <ReminderForm userId={user.id} />
        </div>

        {/* Right Column: List (Server Rendered) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-900">Pengingat mendatang</h2>
            <span className="text-sm font-medium text-slate-500">{activeCount} aktif</span>
          </div>

          {activeCount === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
              <p className="text-slate-500">Belum ada jadwal pengingat. Silakan tambahkan melalui form di samping.</p>
            </div>
          ) : (
            reminders?.map((reminder: any) => {
              const dateObj = new Date(reminder.remind_at);
              const dateStr = dateObj.toLocaleDateString("id-ID", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
              const timeStr = dateObj.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
              const daysLeft = getDaysLeftInfo(reminder.remind_at);
              
              return (
                <div key={reminder.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="bg-teal-50 text-teal-600 h-12 w-12 rounded-xl flex items-center justify-center shrink-0">
                    {getIconForCategory(reminder.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 truncate pr-2">{reminder.title}</h3>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shrink-0 ${daysLeft.style}`}>
                        {daysLeft.text}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      {dateStr} · {timeStr} {reminder.note ? `· ${reminder.note}` : ''}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
