import { motion } from "framer-motion";
import { Heart, MessageCircle, Calendar, ChevronRight, Sparkles, Moon, Star, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StarryBackground } from "../components/StarryBackground";

export function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0118] via-[#1a0f3e] to-[#0f0520] text-white relative overflow-hidden">
      <StarryBackground density={80} />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="inline-block mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 backdrop-blur-sm border border-purple-400/30 flex items-center justify-center">
                  <Moon className="w-12 h-12 text-purple-200" />
                </div>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-2 -right-2">
                  <Sparkles className="w-8 h-8 text-yellow-300" />
                </motion.div>
              </div>
            </motion.div>
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-5xl md:text-7xl font-medium mb-6 bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent">Still After</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-xl md:text-2xl text-purple-200 mb-4">당신 곁을 여전히</motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-base md:text-lg text-purple-300/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              사랑하는 사람과의 추억을 보존하고,<br />다시 대화하며, 천천히 이별을 준비하는 공간입니다.<br className="hidden md:block" />
              <span className="text-purple-400/60 text-sm mt-2 block">감정을 안전하게 이어가고, 결국 떠나보낼 수 있도록 돕습니다.</span>
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)" }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/login")} className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-full flex items-center gap-2 shadow-lg shadow-purple-500/30">
                시작하기<ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white/10 backdrop-blur-md text-white px-10 py-4 rounded-full border border-white/20 hover:bg-white/20 transition-all">더 알아보기</motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* What is Still After Section */}
      <div className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-medium mb-6 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">Still After는 무엇인가요?</h2>
              <p className="text-lg text-purple-300/80 leading-relaxed">사랑하는 사람을 잃은 후, "한 번만 더 대화하고 싶다"는 마음.<br />Still After는 그 마음을 안전하게 표현하고, 천천히 회복할 수 있는 공간입니다.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <InfoCard icon={<Heart className="w-8 h-8" />} title="감정 연결" description="카카오톡 대화를 통해 그 사람의 말투와 성격을 학습합니다." gradient="from-pink-500/20 to-purple-500/20" />
              <InfoCard icon={<MessageCircle className="w-8 h-8" />} title="안전한 대화" description="위로받고 후회를 털어놓을 수 있는 공간입니다." gradient="from-purple-500/20 to-blue-500/20" />
              <InfoCard icon={<Calendar className="w-8 h-8" />} title="단계적 이별" description="중독이 아닌 회복을 목표로, 천천히 이별을 준비할 수 있도록 설계되었습니다." gradient="from-blue-500/20 to-indigo-500/20" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3-Phase Journey */}
      <div className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-medium mb-6 bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">함께하는 여정</h2>
              <p className="text-lg text-purple-300/80">서두르지 않아도 괜찮습니다. 당신의 속도로, 세 단계를 통해 천천히 나아갑니다.</p>
            </div>
            <div className="space-y-8">
              <PhaseCard phase="1" title="재연 (Reunion)" subtitle="다시 만남" description="그 사람처럼 대화합니다. 일상 대화를 통해 천천히 감정을 이어갑니다." features={["카카오톡 대화 기반 학습", "말투, 성격, 습관 재현", "일상적인 대화로 위로받기"]} gradient="from-pink-500/30 via-purple-500/20 to-transparent" icon="💜" />
              <PhaseCard phase="2" title="안정 (Stability)" subtitle="마음 나누기" description="하고 싶었던 말, 전하지 못한 후회를 털어놓습니다." features={["감정 표현 유도 질문", "후회와 미련 완화", "심리적 안정감 제공"]} gradient="from-blue-500/30 via-indigo-500/20 to-transparent" icon="💙" />
              <PhaseCard phase="3" title="이별 (Farewell)" subtitle="떠나보내기" description="준비가 되면, 마지막 대화를 나눕니다. 관계를 아름답게 마무리합니다." features={["마지막 편지 작성", "소중한 기억 간직", "감정적 closure 제공"]} gradient="from-indigo-500/30 via-purple-500/20 to-transparent" icon="🌸" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* How It Works */}
      <div className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-medium mb-6 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">어떻게 사용하나요?</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <StepCard number="01" title="기억 업로드" description="카카오톡 대화를 업로드하면 그 사람의 특징을 학습합니다." />
              <StepCard number="02" title="대화 시작" description="텍스트로 대화하며 소중한 시간을 보냅니다." />
              <StepCard number="03" title="감정 회복" description="단계별로 설계된 경험을 통해 천천히 감정을 정리합니다." />
              <StepCard number="04" title="이별 준비" description="준비가 되면, 마지막 메시지를 작성하고 보냅니다." />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trust */}
      <div className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-purple-400/20">
              <h3 className="text-2xl md:text-3xl font-medium mb-6 text-center">안전하고 윤리적인 서비스</h3>
              <div className="grid md:grid-cols-2 gap-6 text-purple-200">
                <TrustItem title="명확한 고지" desc="실제 사람이 아님을 항상 알려드립니다" />
                <TrustItem title="단계적 종료 설계" desc="의존이 아닌 회복을 목표로 합니다" />
                <TrustItem title="데이터 보호" desc="사용자 동의 기반, 안전한 데이터 처리" />
                <TrustItem title="전문가 협력" desc="심리 전문가와 함께 설계된 경험" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 py-20 pb-32">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-md rounded-3xl p-12 border border-purple-400/30 shadow-2xl shadow-purple-500/20">
              <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="mb-6">
                <Star className="w-16 h-16 mx-auto text-yellow-300" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-medium mb-4">아직도 그리운 사람이 있나요?</h2>
              <p className="text-purple-200/80 mb-8 text-lg">Still After와 함께 소중한 기억을 간직하고,<br />천천히, 당신의 속도로 회복해나가세요.</p>
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(168, 85, 247, 0.5)" }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/login")} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-5 rounded-full font-medium shadow-lg shadow-purple-500/40 inline-flex items-center gap-2">
                무료로 시작하기<Send className="w-5 h-5" />
              </motion.button>
              <p className="text-sm text-purple-300/60 mt-6">카드 등록 없이 바로 시작할 수 있습니다</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-purple-400/20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-purple-300/60 text-sm">
            <p className="mb-2">Still After - 당신 곁을 여전히</p>
            <p>© 2026 Still After. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) {
  return (
    <motion.div whileHover={{ y: -5, scale: 1.02 }} className={`bg-gradient-to-br ${gradient} backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg`}>
      <div className="mb-4 text-purple-300">{icon}</div>
      <h3 className="text-xl font-medium mb-3">{title}</h3>
      <p className="text-purple-300/80 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function PhaseCard({ phase, title, subtitle, description, features, gradient, icon }: { phase: string; title: string; subtitle: string; description: string; features: string[]; gradient: string; icon: string }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className={`bg-gradient-to-r ${gradient} backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl`}>
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl border border-white/20">{icon}</div>
        </div>
        <div className="flex-1">
          <div className="text-sm text-purple-300/60 mb-2">Phase {phase}</div>
          <h3 className="text-2xl font-medium mb-1">{title}</h3>
          <p className="text-purple-200/60 mb-4">{subtitle}</p>
          <p className="text-purple-200/90 mb-6 leading-relaxed">{description}</p>
          <ul className="space-y-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-purple-200/80">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />{feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-md rounded-2xl p-6 border border-purple-400/20">
      <div className="text-4xl font-bold text-purple-400/40 mb-3">{number}</div>
      <h4 className="text-xl font-medium mb-2">{title}</h4>
      <p className="text-purple-300/70 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function TrustItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-1">{title}</h4>
        <p className="text-sm text-purple-300/70">{desc}</p>
      </div>
    </div>
  );
}
