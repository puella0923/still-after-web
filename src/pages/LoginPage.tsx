import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { StarryBackground } from "../components/StarryBackground";

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: signupError } = await supabase.auth.signUp({ email, password });
        if (signupError) throw signupError;
        setSuccess("회원가입 완료! 이메일을 확인해주세요.");
        setTimeout(() => { setMode("login"); setEmail(""); setPassword(""); setSuccess(""); }, 2000);
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        setSuccess("로그인 성공!");
        setTimeout(() => { navigate("/home"); }, 1000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "오류가 발생했습니다";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0118] via-[#1a0f3e] to-[#0f0520] text-white relative overflow-hidden flex items-center justify-center">
      <StarryBackground density={60} />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-md rounded-3xl p-8 border border-purple-400/30 shadow-2xl shadow-purple-500/20">
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 backdrop-blur-sm border border-purple-400/30 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-purple-200" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">Still After</h1>
            <p className="text-purple-300/80 text-sm">당신 곁을 여전히</p>
          </div>

          <div className="flex gap-2 mb-8 bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10">
            <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} className={`flex-1 py-2 px-4 rounded-full font-medium text-sm transition-all ${mode === "login" ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" : "text-purple-300/80 hover:text-purple-200"}`}>로그인</button>
            <button onClick={() => { setMode("signup"); setError(""); setSuccess(""); }} className={`flex-1 py-2 px-4 rounded-full font-medium text-sm transition-all ${mode === "signup" ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" : "text-purple-300/80 hover:text-purple-200"}`}>회원가입</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-purple-200 mb-2">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" disabled={loading} className="w-full bg-white/10 backdrop-blur-sm border border-purple-400/30 rounded-lg py-3 pl-10 pr-4 text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50" required />
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-purple-200 mb-2">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={loading} className="w-full bg-white/10 backdrop-blur-sm border border-purple-400/30 rounded-lg py-3 pl-10 pr-4 text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50" required minLength={6} />
              </div>
            </div>
            {error && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span></motion.div>)}
            {success && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-200 text-sm"><CheckCircle2 className="w-4 h-4 flex-shrink-0" /><span>{success}</span></motion.div>)}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading || !email || !password} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />처리 중...</>) : mode === "login" ? "로그인" : "회원가입"}
            </motion.button>
          </form>

          <div className="mt-6 p-4 bg-purple-900/30 backdrop-blur-sm rounded-lg border border-purple-400/20">
            <p className="text-xs text-purple-300/70 text-center">카드 등록 없이 바로 시작할 수 있습니다.<br />10회 이후 결제 화면으로 이동합니다.</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/")} className="w-full mt-4 text-purple-300/80 hover:text-purple-200 text-sm font-medium transition-colors">← 돌아가기</motion.button>
        </motion.div>
      </div>
    </div>
  );
}
