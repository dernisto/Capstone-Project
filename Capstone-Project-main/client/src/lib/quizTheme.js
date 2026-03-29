const textPrimary = "text-[#1A1A1A]";
const textSecondary = "text-[#6B7280]";
const borderQuiz = "border-[#E9E7FF]";
const quizPageShell = "min-h-screen relative font-sans antialiased text-[#1A1A1A] [letter-spacing:-0.01em]";
const quizPageGradient = "fixed inset-0 -z-20 bg-[linear-gradient(135deg,#F5F3FF_0%,#FFFFFF_40%,#F3F0FF_100%)]";
const quizPageRadialGlow = "fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(circle_at_50%_-5%,rgba(108,59,255,0.11),transparent_58%)]";
const quizCard = "rounded-2xl border border-[#E9E7FF] bg-white/80 backdrop-blur-[10px] shadow-[0_6px_20px_rgba(108,59,255,0.08)] p-6";
const quizCardSm = `${quizCard} p-5`;
const quizBtnPrimary = "rounded-xl font-medium text-white transition-all duration-[250ms] ease-out bg-gradient-to-br from-[#6C3BFF] to-[#8A63FF] shadow-[0_8px_20px_rgba(108,59,255,0.25)] hover:-translate-y-px hover:shadow-[0_10px_25px_rgba(108,59,255,0.35)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(108,59,255,0.15),0_8px_20px_rgba(108,59,255,0.25)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_20px_rgba(108,59,255,0.25)]";
const quizFocusGlow = "focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(108,59,255,0.15)]";
const quizLeaderTop = "bg-[linear-gradient(90deg,rgba(108,59,255,0.09)_0%,rgba(108,59,255,0.02)_100%)] shadow-[inset_0_0_0_1px_rgba(108,59,255,0.12)]";
const quizSurfaceSoft = "bg-[#FAFAFF] border border-[#E9E7FF]";
export {
  borderQuiz,
  quizBtnPrimary,
  quizCard,
  quizCardSm,
  quizFocusGlow,
  quizLeaderTop,
  quizPageGradient,
  quizPageRadialGlow,
  quizPageShell,
  quizSurfaceSoft,
  textPrimary,
  textSecondary
};
