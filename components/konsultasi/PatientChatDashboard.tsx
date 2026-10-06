"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageCircle, Phone, Video, Users, Loader2 } from "lucide-react";
import { ChatWindow } from "@/components/konsultasi/ChatWindow";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type PerawatProfile = {
  id: string;
  full_name: string;
};

export function PatientChatDashboard({ userId }: { userId?: string | null }) {
  const [perawats, setPerawats] = useState<PerawatProfile[]>([]);
  const [activePerawat, setActivePerawat] = useState<PerawatProfile | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingChat, setCreatingChat] = useState(false);

  const supabase = createClient();

  // Load daftar Perawat
  useEffect(() => {
    async function fetchPerawats() {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "perawat");
      
      if (data) setPerawats(data);
      setLoading(false);
    }
    fetchPerawats();
  }, [supabase]);

  // Handle saat pasien memilih perawat
  const selectPerawat = async (perawat: PerawatProfile) => {
    setActivePerawat(perawat);
    
    if (!userId) {
      // Jika belum login, jangan buat percakapan, cukup set activePerawat saja
      return; 
    }

    setCreatingChat(true);
    setConversationId(null);
    setInitialMessages([]);

    // 1. Cek apakah percakapan dengan perawat ini sudah ada
    let { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .eq("perawat_id", perawat.id)
      .single();

    // 2. Jika belum ada, buat
    if (!conversation) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({ user_id: userId, perawat_id: perawat.id })
        .select()
        .single();
      conversation = newConv;
    }

    if (conversation) {
      setConversationId(conversation.id);
      
      // Ambil riwayat chat lama
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });
        
      if (msgs) setInitialMessages(msgs);
    }
    
    setCreatingChat(false);
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="animate-spin h-8 w-8 text-blue-500 mx-auto" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Kolom Kiri: Daftar Perawat */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-24 flex flex-col max-h-[600px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
            <Users className="h-5 w-5 text-teal-600" />
            <h2 className="font-bold text-slate-800">Pilih Perawat</h2>
          </div>
          <div className="overflow-y-auto flex-1">
            {perawats.length === 0 ? (
              <p className="p-6 text-center text-slate-500 text-sm">Belum ada perawat yang aktif.</p>
            ) : (
              perawats.map((b) => (
                <button
                  key={b.id}
                  onClick={() => selectPerawat(b)}
                  className={`w-full flex items-center gap-4 p-4 border-b border-slate-100 transition-colors text-left hover:bg-teal-50 ${
                    activePerawat?.id === b.id ? "bg-teal-50 border-l-4 border-l-teal-500" : ""
                  }`}
                >
                  <div className="w-12 h-12 bg-teal-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                    <img 
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${b.full_name.replace(/\s+/g, '')}&backgroundColor=transparent`} 
                      alt={b.full_name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{b.full_name}</h3>
                    <p className="text-xs text-slate-500">Perawat Tersertifikasi</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Chat Window Realtime */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px] border-t-4 border-t-blue-500">
          
          {!activePerawat ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
               <div className="bg-slate-50 p-4 rounded-full mb-4">
                 <MessageCircle className="h-10 w-10 text-slate-300" />
               </div>
               <p>Silakan pilih Perawat dari daftar di sebelah kiri untuk memulai konsultasi.</p>
             </div>
          ) : (
            <>
              {/* Header Chat */}
              <div className="bg-white border-b border-slate-100 p-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-200 rounded-full overflow-hidden">
                    <img 
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${activePerawat.full_name.replace(/\s+/g, '')}&backgroundColor=transparent`} 
                      alt={activePerawat.full_name} 
                    />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">{activePerawat.full_name}</h2>
                    <p className="text-xs text-slate-500">Pesan dilindungi enkripsi end-to-end</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600"><Phone className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600"><Video className="h-4 w-4" /></Button>
                </div>
              </div>

              {/* Komponen Chat Interaktif atau Peringatan Login */}
              {!userId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50">
                  <div className="bg-red-100 p-4 rounded-full mb-4">
                    <Users className="h-10 w-10 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Login Diperlukan</h3>
                  <p className="text-slate-500 mb-6 max-w-sm">
                    Anda harus masuk ke akun Anda terlebih dahulu untuk memulai konsultasi dengan <b>{activePerawat.full_name}</b>.
                  </p>
                  <Link href="/login">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-2 font-bold shadow-sm">
                      Login Sekarang
                    </Button>
                  </Link>
                </div>
              ) : creatingChat || !conversationId ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin h-6 w-6 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">Menghubungkan ruang obrolan...</p>
                </div>
              ) : (
                <ChatWindow 
                  userId={userId} 
                  conversationId={conversationId} 
                  initialMessages={initialMessages} 
                  key={conversationId} // Memaksa re-render jika perawat diganti
                />
              )}
            </>
          )}

        </div>
      </div>
      
    </div>
  );
}
