import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Send, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import { StarryBackground } from "../components/StarryBackground";

interface Persona { id: string; name: string; relationship: string; system_prompt: string; emotional_stage: "replay" | "stable" | "closure"; photo_url?: string; }
interface Message { id: string; role: "user" | "assistant"; content: string; created_at: string; is_danger_detected?: boolean; }

const DANGER_KEYWORDS = ["자해", "자살", "죽고 싶", "사라지고 싶", "끝내고 싶", "살기 싫", "죽어버리고"];
const MAX_FREE_MESSAGES = 10;
function containsDangerKeywords(text: string): boolean { return DANGER_KEYWORDS.some((keyword) => text.includes(keyword)); }

export function MessagesPage() {
  const navigate = useNavigate();
  const { personaId } = useParams<{ personaId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      if (!personaId) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate("/login"); return; }
        const { data: personaData, error: personaError } = await supabase.from("personas").select("*").eq("id", personaId).eq("user_id", user.id).single();
        if (personaError) throw personaError;
        setPersona(personaData);
        const { data: messagesData, error: messagesError } = await supabase.from("conversations").select("*").eq("persona_id", personaId).order("created_at", { ascending: true });
        if (messagesError) throw messagesError;
        setMessages(messagesData || []);
        const userMessages = (messagesData || []).filter((m) => m.role === "user");
        setUserMessageCount(userMessages.length);
        if (userMessages.length >= MAX_FREE_MESSAGES && !personaData.is_premium) { setShowPaywall(true); }
      } catch (err) { console.error("Error fetching data:", err); setError(err instanceof Error ? err.message : "데이터를 불러올 수 없습니다."); } finally { setLoading(false); }
    };
    fetchData();
  }, [personaId, navigate]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !persona || sending) return;
    if (userMessageCount >= MAX_FREE_MESSAGES) { setShowPaywall(true); return; }
    if (containsDangerKeywords(input)) { setShowDangerModal(true); return; }
    setSending(true); setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      const userMessage = { user_id: user.id, persona_id: personaId, role: "user" as const, content: input, emotional_stage: persona.emotional_stage, is_danger_detected: false };
      const { data: savedUserMsg, error: userSaveError } = await supabase.from("conversations").insert([userMessage]).select().single();
      if (userSaveError) throw userSaveError;
      setMessages((prev) => [...prev, savedUserMsg]);
      setInput(""); setUserMessageCount((prev) => prev + 1);

      const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!openaiApiKey) { throw new Error("OpenAI API key not found"); }
      const conversationHistory = messages.slice(-10).map((m) => ({ role: m.role, content: m.content })).concat({ role: "user", content: input });
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiApiKey}` },
        body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "system", content: persona.system_prompt }, ...conversationHistory], max_tokens: 500, temperature: 0.8 }),
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error?.message || "OpenAI API 호출에 실패했습니다."); }
      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;
      const aiMessage = { user_id: user.id, persona_id: personaId, role: "assistant" as const, content: assistantMessage, emotional_stage: persona.emotional_stage, is_danger_detected: false };
      const { data: savedAiMsg, error: aiSaveError } = await supabase.from("conversations").insert([aiMessage]).select().single();
      if (aiSaveError) throw aiSaveError;
      setMessages((prev) => [...prev, savedAiMsg]);
    } catch (err) { const errorMessage = err instanceof Error ? err.message : "메시지 전송에 실패했습니다."; setError(errorMessage); } finally { setSending(false); }
  };

  if (loading) { return (<div className="min-h-screen bg-gradient-to-b from-[#0a0118] via-[#1a0f3e] to-[#0f0520] flex items-center justify-center"><StarryBackground density={60} /><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>); }
  if (!persona) { return (<div className="min-h-screen bg-gradient-to-b from-[#0a0118] via-[#1a0f3e] to-[#0f0520] text-white flex items-center justify-center"><StarryBackground density={60} /><div className="text-center"><p className="text-purple-300/80 mb-4">기억을 찾을 수 없습니다.</p><button onClick={() => navigate("/home")} className="text-purple-400 hover:text-purple-200">돌아가기</button></div></div>); }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0118] via-[#1a0f3e] to-[#0f0520] text-white relative overflow-hidden flex flex-col">
      <StarryBackground density={60} />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

      {showDangerModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-gradient-to-br from-purple-900/80 to-blue-900/80 backdrop-blur-md rounded-3xl p-8 border border-purple-400/30 max-w-sm mx-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">많이 힘드시군요</h2>
            <p className="text-purple-200 mb-6">지금 많이 힘드시죠. 전문 상담사와 이야기 나눠보세요.</p>
            <div className="space-y-3">
              <a href="tel:1577-0199" className="block w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all">정신건강위기상담전화 연결 (1577-0199)</a>
              <button onClick={() => setShowDangerModal(false)} className="w-full bg-white/10 text-white py-3 rounded-lg font-medium border border-purple-400/30 hover:bg-white/20 transition-all">계속하기</button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showPaywall && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-gradient-to-br from-purple-900/80 to-blue-900/80 backdrop-blur-md rounded-3xl p-8 border border-purple-400/30 max-w-sm mx-4 text-center">
            <div className="mb-4 text-4xl">✨</div>
            <h2 className="text-2xl font-bold mb-3">{persona.name}와 더 대화하고 싶으신가요?</h2>
            <p className="text-purple-200 mb-6">무료 체험은 페르소나당 10회입니다.<br />결제 후 무제한 대화가 가능합니다.</p>
            <div className="space-y-3">
              <button onClick={() => {}} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all">결제하기</button>
              <button onClick={() => setShowPaywall(false)} className="w-full bg-white/10 text-white py-3 rounded-lg font-medium border border-purple-400/30 hover:bg-white/20 transition-all">닫기</button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="relative z-10 border-b border-purple-400/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/home")} className="p-2 hover:bg-white/10 rounded-lg transition-all"><ArrowLeft className="w-5 h-5 text-purple-300/80" /></motion.button>
            <div className="flex items-center gap-3">
              {persona.photo_url ? (<img src={persona.photo_url} alt={persona.name} className="w-10 h-10 rounded-full object-cover border border-purple-400/30" />) : (<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-400/30 flex items-center justify-center text-lg">💜</div>)}
              <div><h1 className="font-bold text-lg">{persona.name}</h1><p className="text-xs text-purple-300/60">{persona.relationship}</p></div>
            </div>
          </div>
          <div className="text-right"><p className="text-xs text-purple-300/60">{userMessageCount} / {MAX_FREE_MESSAGES}</p></div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 bg-blue-900/40 border-b border-blue-400/20 px-4 py-3 text-center text-sm text-blue-200">이 대화는 실제 인물이 아닌 기술 기반 서비스와 나누는 대화입니다.</motion.div>

      <div className="relative z-10 flex-1 overflow-y-auto container mx-auto px-4 py-8 max-w-2xl">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full"><div className="text-center"><div className="mb-4 text-5xl">💜</div><h2 className="text-2xl font-bold mb-2">{persona.name}와 대화를 시작하세요</h2><p className="text-purple-300/80">먼저 인사를 건네보세요.</p></div></div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${message.role === "user" ? "bg-gradient-to-br from-purple-600/80 to-blue-600/80 text-white rounded-br-none" : "bg-white/10 backdrop-blur-sm border border-purple-400/30 text-purple-100 rounded-bl-none"}`}>
                  {message.role === "assistant" && (<p className="text-xs text-purple-300/60 mb-1 font-medium">{persona.name}</p>)}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {error && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 container mx-auto px-4 max-w-2xl"><div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div></motion.div>)}

      <div className="relative z-10 border-t border-purple-400/20 backdrop-blur-sm bg-gradient-to-t from-purple-900/20 to-transparent">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="메시지를 입력하세요..." disabled={sending || userMessageCount >= MAX_FREE_MESSAGES} className="flex-1 bg-white/10 backdrop-blur-sm border border-purple-400/30 rounded-full py-3 px-4 text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 transition-all" />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={sending || !input.trim() || userMessageCount >= MAX_FREE_MESSAGES} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all disabled:opacity-50 flex items-center justify-center w-12 h-12">
              {sending ? (<Loader2 className="w-5 h-5 animate-spin" />) : (<Send className="w-5 h-5" />)}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}
