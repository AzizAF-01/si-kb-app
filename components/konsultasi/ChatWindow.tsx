"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export function ChatWindow({ 
  userId, 
  conversationId, 
  initialMessages 
}: { 
  userId: string;
  conversationId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Efek untuk menggeser layar (scroll) ke pesan paling bawah
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Efek untuk mendengarkan pesan masuk secara real-time
  useEffect(() => {
    const channel = supabase
      .channel(`room_${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Hindari pesan duplikat dari diri sendiri (karena sudah ditambahkan saat kirim)
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
  }, [conversationId, supabase]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const content = newMessage;
    setNewMessage(""); // Kosongkan input agar user merasa responsif

    // Kirim ke database (Realtime subscription yang akan menambahkannya ke layar)
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: content,
    });

    if (error) {
      alert("Gagal mengirim pesan");
    }

    setIsSending(false);
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Area Pesan */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
            <div className="bg-white p-4 rounded-full shadow-sm">👋</div>
            <p className="text-sm">Mulai percakapan dengan Bidan sekarang.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === userId;
            const time = new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
            
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  isMe 
                    ? "bg-blue-600 text-white rounded-br-sm" 
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                }`}>
                  <p className="text-sm md:text-base leading-relaxed break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-2 text-right ${isMe ? "text-blue-100" : "text-slate-400"}`}>
                    {time}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Area Input (Ketikan) */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan Anda di sini..." 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || isSending}
            className="h-auto aspect-square rounded-full bg-blue-600 hover:bg-blue-700 shrink-0"
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
