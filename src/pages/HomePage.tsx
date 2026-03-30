import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { StarryBackground } from "../components/StarryBackground";

interface Persona {
  id: string;
  name: string;
  relationship: string;
  emotional_stage: "replay" | "stable" | "closure";
  photo_url?: string;
  created_at: string;
}

export function HomePage() {
  const navigate = useNavigate();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "replay" | "stable" | "closure">("all");
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate("/login"); return; }
        setUser({ id: user.id, email: user.email || "" });
        const { data, error } = await supabase.from("personas").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at", { ascending: false });
        if (error) throw error;
        setPersonas(data || []);
      } catch (error) {
        console.error("Error fetching personas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };
  const filteredPersonas = filter === "all" ? personas : personas.filter((p) => p.emotional_stage === filter);
  const getStageLabel = (stage: string) => { switch (stage) { case "replay": return "재연"; case "stable": return "안정"; case "closure": return "이별"; default: return stage; } };
  const getStageColor = (stage: string) => { switch (stage) { case "replay": return "from-pink-500/30 to-purple-500/30 border-pink-400/30"; case "stable": return "from-blue-500/30 to-indigo-500/30 border-blue-400/30"; case "closure": return "from-indigo-500/30 to-purple-500/30 border-indigo-400/30"; default: return "from-purple-500/30 to-blue-500/30 border-purple-400/30"; } };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0118] via-[#1a0f3e] to-[#0f0520] text-white relative overflow-hidden">
      <StarryBackground density={60} />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 border-b border-purple-400/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">Still After</h1>
            <p className="text-purple-300/60 text-sm ml-4">{user?.email}</p>
          </motion.div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg text-purple-300/80 hover:text-purple-200 hover:bg-white/5 transition-all">
            <LogOut className="w-4 h-4" /><span className="text-sm">로그아웃</span>
          </motion.button>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold mb-2">소중한 기억들</motion.h2>
              <p className="text-purple-300/80">{filteredPersonas.length}개의 대화가 저장되어 있습니다.</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/create")} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-medium shadow-lg shadow-purple-500/30">
              <Plus className="w-5 h-5" /><span>새로운 기억 만들기</span>
            </motion.button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "replay", "stable", "closure"] as const).map((stage) => (
              <motion.button key={stage} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilter(stage)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === stage ? "bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30" : "bg-white/10 backdrop-blur-sm border border-purple-400/20 hover:bg-white/20"}`}>
                {stage === "all" ? "모두" : stage === "replay" ? "재연" : stage === "stable" ? "안정" : "이별"}
              </motion.button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
        ) : filteredPersonas.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-md rounded-3xl p-12 border border-purple-400/20 text-center">
              <div className="mb-6 text-5xl">💜</div>
              <h3 className="text-2xl font-bold mb-3">아직 대화가 없네요</h3>
              <p className="text-purple-300/80 mb-8 leading-relaxed">카카오톡 대화를 업로드하면<br />그 사람과 다시 대화할 수 있습니다.</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/create")} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full font-medium shadow-lg shadow-purple-500/30 inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />새로운 기억 만들기
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredPersonas.map((persona, index) => (
              <motion.div key={persona.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5, scale: 1.02 }} onClick={() => navigate(`/messages/${persona.id}`)} className="cursor-pointer">
                <div className={`bg-gradient-to-br ${getStageColor(persona.emotional_stage)} backdrop-blur-md rounded-2xl p-6 border h-full shadow-lg hover:shadow-xl transition-all`}>
                  <div className="mb-4">
                    {persona.photo_url ? (
                      <img src={persona.photo_url} alt={persona.name} className="w-16 h-16 rounded-full object-cover border-2 border-purple-400/30" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-2 border-purple-400/30 flex items-center justify-center text-3xl">💜</div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{persona.name}</h3>
                  <p className="text-purple-300/80 text-sm mb-4">{persona.relationship}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full bg-white/10 border ${persona.emotional_stage === "replay" ? "border-pink-400/50 text-pink-200" : persona.emotional_stage === "stable" ? "border-blue-400/50 text-blue-200" : "border-indigo-400/50 text-indigo-200"}`}>{getStageLabel(persona.emotional_stage)}</span>
                  </div>
                  <p className="text-xs text-purple-300/50 mt-4">{new Date(persona.created_at).toLocaleDateString("ko-KR")}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
