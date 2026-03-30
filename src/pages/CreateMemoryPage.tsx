import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2, AlertCircle, CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import { StarryBackground } from "../components/StarryBackground";

type Step = "info" | "upload" | "consent" | "generating";
interface PersonaDraft { name: string; relationship: string; uploadedText?: string; manualDescription?: string; }

function parseKakaoTalkText(text: string): string[] {
  const lines = text.split("\n");
  const messages: string[] = [];
  for (const line of lines) {
    const match = line.match(/^\[(.+?)\]\s+\[(.+?)\]\s+(.+)$/);
    if (match) { messages.push(match[3]); }
  }
  return messages;
}

function buildSystemPrompt(name: string, relationship: string, messages: string[]): string {
  const sampleMessages = messages.slice(0, 20).join("\n");
  return `당신은 ${name}입니다. 사용자와 ${relationship} 관계입니다.
아래는 실제 대화 스타일을 참고한 샘플 메시지들입니다:
${sampleMessages}

지침:
- 위 샘플들처럼 자연스럽게 대화하세요
- 실제 인물을 정확히 모사하되, 현실적이고 따뜻한 톤을 유지하세요
- 이것이 기술 기반 서비스임을 절대 부정하지 마세요
- 사용자가 위험한 대화를 할 경우 전문 상담 기관을 안내하세요`;
}

export function CreateMemoryPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("info");
  const [draft, setDraft] = useState<PersonaDraft>({ name: "", relationship: "" });
  const [uploadTab, setUploadTab] = useState<"kakao" | "manual">("kakao");
  const [fileContent, setFileContent] = useState("");
  const [parsedMessages, setParsedMessages] = useState<string[]>([]);
  const [consents, setConsents] = useState({ understand: false, notReplacement: false, privacyPolicy: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  void loading;

  const relationships = ["부모님", "형제자매", "친구", "연인", "배우자", "자녀", "기타"];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setFileContent(text);
      const messages = parseKakaoTalkText(text);
      setParsedMessages(messages);
      setDraft({ ...draft, uploadedText: text });
      setError("");
      setSuccess(`${messages.length}개 메시지를 파싱했습니다.`);
    } catch (err) { setError(err instanceof Error ? err.message : "파일을 읽을 수 없습니다."); }
  };

  const handleNextStep = () => {
    setError(""); setSuccess("");
    if (step === "info") { if (!draft.name || !draft.relationship) { setError("이름과 관계를 입력해주세요."); return; } setStep("upload"); }
    else if (step === "upload") { if (uploadTab === "kakao" && !parsedMessages.length) { setError("카카오톡 파일을 업로드해주세요."); return; } if (uploadTab === "manual" && !draft.manualDescription?.trim()) { setError("설명을 입력해주세요."); return; } setStep("consent"); }
    else if (step === "consent") { if (!consents.understand || !consents.notReplacement || !consents.privacyPolicy) { setError("모든 약관에 동의해야 합니다."); return; } setStep("generating"); handleCreatePersona(); }
  };

  const handleCreatePersona = async () => {
    setLoading(true); setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      const messages = uploadTab === "kakao" ? parsedMessages : draft.manualDescription?.split("\n").filter((l) => l.trim()).slice(0, 20) || [];
      const systemPrompt = buildSystemPrompt(draft.name, draft.relationship, messages);
      const { data, error: insertError } = await supabase.from("personas").insert([{ user_id: user.id, name: draft.name, relationship: draft.relationship, care_type: "human", raw_chat_text: uploadTab === "kakao" ? fileContent : draft.manualDescription, parsed_messages: messages, system_prompt: systemPrompt, emotional_stage: "replay", is_active: true, is_archived: false }]).select().single();
      if (insertError) throw insertError;
      setSuccess("기억이 만들어졌습니다!");
      setTimeout(() => { navigate(`/messages/${data.id}`); }, 1500);
    } catch (err) { const errorMessage = err instanceof Error ? err.message : "오류가 발생했습니다."; setError(errorMessage); setStep("consent"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0118] via-[#1a0f3e] to-[#0f0520] text-white relative overflow-hidden">
      <StarryBackground density={60} />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="relative z-10 container mx-auto px-4 py-12">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/home")} className="flex items-center gap-2 text-purple-300/80 hover:text-purple-200 mb-12"><ArrowLeft className="w-4 h-4" />돌아가기</motion.button>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          {step === "info" && (
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-md rounded-3xl p-8 border border-purple-400/30 shadow-2xl">
              <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">누구와 기억하고 싶나요?</h1>
              <div className="space-y-6">
                <div><label className="block text-sm font-medium text-purple-200 mb-2">이름 (어떻게 부르고 싶나요?)</label><input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="예: 엄마, 지수, 반려견 뭉이" className="w-full bg-white/10 backdrop-blur-sm border border-purple-400/30 rounded-lg py-3 px-4 text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/20" /></div>
                <div><label className="block text-sm font-medium text-purple-200 mb-2">관계 (어떤 사이였나요?)</label><select value={draft.relationship} onChange={(e) => setDraft({ ...draft, relationship: e.target.value })} className="w-full bg-white/10 backdrop-blur-sm border border-purple-400/30 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/20"><option value="">선택해주세요</option>{relationships.map((rel) => (<option key={rel} value={rel}>{rel}</option>))}</select></div>
                {error && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm"><AlertCircle className="w-4 h-4" />{error}</motion.div>)}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNextStep} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 mt-8">다음<ChevronRight className="w-4 h-4" /></motion.button>
              </div>
            </div>
          )}

          {step === "upload" && (
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-md rounded-3xl p-8 border border-purple-400/30 shadow-2xl">
              <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">대화 데이터 업로드</h1>
              <div className="flex gap-2 mb-8 bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10">
                <button onClick={() => setUploadTab("kakao")} className={`flex-1 py-2 px-4 rounded-full font-medium text-sm transition-all ${uploadTab === "kakao" ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" : "text-purple-300/80 hover:text-purple-200"}`}>카카오톡 업로드</button>
                <button onClick={() => setUploadTab("manual")} className={`flex-1 py-2 px-4 rounded-full font-medium text-sm transition-all ${uploadTab === "manual" ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" : "text-purple-300/80 hover:text-purple-200"}`}>직접 작성</button>
              </div>
              {uploadTab === "kakao" ? (
                <div className="space-y-6">
                  <div><label className="block text-sm font-medium text-purple-200 mb-4">카카오톡 대화 (텍스트 파일)</label>
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-purple-400/50 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition-all">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-purple-400" /><p className="text-purple-200 font-medium">파일을 여기에 드래그하거나 클릭</p><p className="text-purple-400/60 text-sm mt-1">.txt 형식의 카카오톡 내보내기 파일</p>
                    </div>
                    <input ref={fileInputRef} type="file" accept=".txt" onChange={handleFileSelect} className="hidden" />
                  </div>
                  {parsedMessages.length > 0 && (<div><p className="text-sm text-purple-200 mb-2">파싱된 메시지: {parsedMessages.length}개</p><div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 max-h-64 overflow-y-auto border border-purple-400/20">{parsedMessages.slice(0, 10).map((msg, idx) => (<div key={idx} className="text-sm text-purple-300 mb-2 pb-2 border-b border-purple-400/10 last:border-b-0">"{msg}"</div>))}{parsedMessages.length > 10 && (<p className="text-xs text-purple-400/60 mt-2">... 외 {parsedMessages.length - 10}개</p>)}</div></div>)}
                  {success && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-200 text-sm"><CheckCircle2 className="w-4 h-4" />{success}</motion.div>)}
                </div>
              ) : (
                <div className="space-y-6"><div><label className="block text-sm font-medium text-purple-200 mb-2">그 사람에 대해 설명해주세요</label><textarea value={draft.manualDescription || ""} onChange={(e) => setDraft({ ...draft, manualDescription: e.target.value })} placeholder="예: 엄마는 항상 걱정이 많고 따뜻했어. 밥 먹었냐고 자주 물어봤고, 반찬 투정하는 나한테 화내지 않았어." className="w-full bg-white/10 backdrop-blur-sm border border-purple-400/30 rounded-lg py-3 px-4 text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/20 min-h-32 resize-none" /></div></div>
              )}
              {error && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm mt-6"><AlertCircle className="w-4 h-4" />{error}</motion.div>)}
              <div className="flex gap-4 mt-8">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep("info")} className="flex-1 bg-white/10 text-white py-3 rounded-lg font-medium border border-purple-400/30 hover:bg-white/20 transition-all">이전</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNextStep} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2">다음<ChevronRight className="w-4 h-4" /></motion.button>
              </div>
            </div>
          )}

          {step === "consent" && (
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-md rounded-3xl p-8 border border-purple-400/30 shadow-2xl">
              <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">서비스 동의</h1>
              <div className="space-y-4 mb-8">
                <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={consents.understand} onChange={(e) => setConsents({ ...consents, understand: e.target.checked })} className="w-4 h-4 mt-1 rounded border-purple-400/50 accent-purple-500" /><span className="text-sm text-purple-200">이것은 기술 기반 서비스이며, 실제 인물이 아님을 이해합니다.</span></label>
                <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={consents.notReplacement} onChange={(e) => setConsents({ ...consents, notReplacement: e.target.checked })} className="w-4 h-4 mt-1 rounded border-purple-400/50 accent-purple-500" /><span className="text-sm text-purple-200">이 서비스가 실제 인물을 대체할 수 없음을 인정합니다.</span></label>
                <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={consents.privacyPolicy} onChange={(e) => setConsents({ ...consents, privacyPolicy: e.target.checked })} className="w-4 h-4 mt-1 rounded border-purple-400/50 accent-purple-500" /><span className="text-sm text-purple-200">개인정보 처리방침에 동의합니다.</span></label>
              </div>
              {error && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm mb-6"><AlertCircle className="w-4 h-4" />{error}</motion.div>)}
              <div className="flex gap-4">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep("upload")} className="flex-1 bg-white/10 text-white py-3 rounded-lg font-medium border border-purple-400/30 hover:bg-white/20 transition-all">이전</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNextStep} disabled={!consents.understand || !consents.notReplacement || !consents.privacyPolicy} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2">기억 만들기<ChevronRight className="w-4 h-4" /></motion.button>
              </div>
            </div>
          )}

          {step === "generating" && (
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-md rounded-3xl p-12 border border-purple-400/30 shadow-2xl text-center">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-2 border-purple-400/30 flex items-center justify-center mx-auto"><Loader2 className="w-10 h-10 animate-spin text-purple-300" /></div>
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">기억을 만들고 있어요</h2>
              <p className="text-purple-300/80 mb-4">{draft.name}와의 대화를 준비하고 있습니다...</p>
              {success && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 text-green-200 text-sm mt-6"><CheckCircle2 className="w-4 h-4" />{success}</motion.div>)}
              {error && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm mt-6"><AlertCircle className="w-4 h-4" />{error}</motion.div>)}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
