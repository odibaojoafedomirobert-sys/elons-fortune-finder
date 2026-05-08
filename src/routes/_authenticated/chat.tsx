import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "Support — ElonTesla" }] }),
  component: ChatPage,
});

interface Msg { id: string; content: string; sender_id: string; is_from_admin: boolean; created_at: string; }

function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    supabase.from("support_messages")
      .select("*").eq("user_id", user.id).order("created_at", { ascending: true })
      .then(({ data }) => setMessages((data as any) ?? []));

    const channel = supabase.channel(`chat-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `user_id=eq.${user.id}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Msg]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || !user) return;
    if (content.length > 1000) { toast.error("Message too long"); return; }
    setSending(true);
    const { error } = await supabase.from("support_messages").insert({
      user_id: user.id, sender_id: user.id, is_from_admin: false, content,
    });
    setSending(false);
    if (error) toast.error(error.message);
    else setText("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-4 flex flex-col">
        <div className="mx-auto max-w-3xl w-full px-4 flex-1 flex flex-col">
          <div className="py-4 border-b">
            <h1 className="text-xl font-bold">Live Support</h1>
            <p className="text-xs text-muted-foreground">Our team typically replies within minutes.</p>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-12">
                Say hi 👋 — start the conversation with our support team.
              </div>
            ) : messages.map((m) => (
              <div key={m.id} className={`flex ${m.is_from_admin ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  m.is_from_admin ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                }`}>
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <p className={`text-[10px] mt-1 ${m.is_from_admin ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={send} className="border-t pt-3 pb-2 flex gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" maxLength={1000} disabled={sending} />
            <Button type="submit" variant="hero" disabled={sending || !text.trim()}>Send</Button>
          </form>
        </div>
      </main>
    </div>
  );
}
