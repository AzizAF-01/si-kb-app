"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Send, UserCircle2, Loader2, MessageSquare } from "lucide-react";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type Conversation = {
  id: string;
  user_id: string;
  profiles: {
    full_name: string;
  };
};

export function PerawatChatDashboard({ perawatId }: { perawatId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Load daftar percakapan
  useEffect(() => {
    async function loadConversations() {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id, 
          user_id,
          profiles!conversations_user_id_fkey (full_name),
          messages!inner (id)
        `)
        .eq("perawat_id", perawatId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Gagal memuat percakapan:", error.message);
      } else if (data) {
        const cleanedData = data.map(conv => ({
          id: conv.id,
          user_id: conv.user_id,
          profiles: conv.profiles
        }));
        setConversations(cleanedData as any);
      }
      setLoading(false);
    }
    loadConversations();
  }, [supabase]);

  // Load pesan saat percakapan dipilih
  useEffect(() => {
    if (!activeConv) return;
    
    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConv)
        .order("created_at", { ascending: true });
      
      if (data) setMessages(data);
    }
    loadMessages();

    // Subscribe ke realtime messages
    const channel = supabase
      .channel(`admin_room_${activeConv}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConv}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConv, supabase]);

  // Scroll otomatis
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv || isSending) return;

    setIsSending(true);
    const content = newMessage;
    setNewMessage("");

    await supabase.from("messages").insert({
      conversation_id: activeConv,
      sender_id: perawatId,
      content: content,
    });

    setIsSending(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 w-full">Memuat dashboard...</div>;
  }

  return (
    <div className="flex w-full h-[calc(100vh-64px)]">
      {/* Sidebar Daftar Pasien */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-800">Daftar Pasien</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-slate-500 text-center mt-4">Belum ada pasien</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors flex items-center gap-3 ${
                  activeConv === conv.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                }`}
              >
                <UserCircle2 className="h-10 w-10 text-slate-400 shrink-0" />
                <div className="truncate">
                  <h3 className="font-bold text-sm text-slate-900 truncate">
                    {conv.profiles?.full_name || "Pasien Tidak Diketahui"}
                  </h3>
                  <p className="text-xs text-slate-500">Ketuk untuk membalas</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Area Chat Tengah */}
      <div className="flex-1 flex flex-col bg-slate-50 relative">
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare className="h-16 w-16 mb-4 text-slate-300" />
            <p>Pilih pasien di panel kiri untuk memulai obrolan</p>
          </div>
        ) : (
          <>
            {/* Header Percakapan Aktif */}
            <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
              <h2 className="font-bold text-slate-800">
                {conversations.find(c => c.id === activeConv)?.profiles?.full_name}
              </h2>
            </div>

            {/* List Pesan */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isPerawat = msg.sender_id === perawatId;
                const time = new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                
                return (
                  <div key={msg.id} className={`flex ${isPerawat ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                      isPerawat 
                        ? "bg-slate-900 text-white rounded-tr-sm" 
                        : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                    }`}>
                      <p className="text-sm md:text-base leading-relaxed break-words">{msg.content}</p>
                      <p className={`text-[10px] mt-2 text-right ${isPerawat ? "text-slate-400" : "text-slate-400"}`}>
                        {time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Form Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik balasan perawat di sini..." 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || isSending}
                  className="h-auto aspect-square rounded-full bg-slate-900 hover:bg-slate-800 shrink-0"
                >
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Send className="h-5 w-5 text-white" />}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
