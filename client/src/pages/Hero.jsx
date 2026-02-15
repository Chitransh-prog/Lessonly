import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import TextType from "../animations/TextType";
import { fetchUserName } from "../api/UserCall";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const [userName, setUserName] = useState("Educator");
  const navigate = useNavigate();

  const CreatePage = () => navigate("/create");
  const MindmapsPage = () => navigate("/mindmaps");
  const NewsletterPage = () => navigate("/contact");

  useEffect(() => {
    const getUserName = async () => {
      const name = await fetchUserName();
      if (name) setUserName(name);
    };

    getUserName();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const userMetadata = session.user.user_metadata;
          const name =
            userMetadata?.full_name || userMetadata?.name || "Educator";
          setUserName(name);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-950 relative overflow-hidden flex items-center justify-center px-4 md:px-6">
      
      {/* --- AMBIENT BACKGROUND --- */}
      {/* Main Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#0f172a] to-slate-950 z-0" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-soft-light pointer-events-none"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse z-0 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse delay-1000 z-0 pointer-events-none" />


      {/* --- GLASS CONTAINER --- */}
      <div className="relative z-10 w-full max-w-5xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-8 md:p-12 text-center flex flex-col items-center gap-10">

        {/* Logo & Header Group */}
        <div className="space-y-6 flex flex-col items-center">
          
          {/* Logo with Glow Ring */}
          <div className="relative group cursor-default">
            <div className="absolute inset-0 bg-cyan-400 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <img
              src="Logo.png"
              alt="Lessonly Logo"
              className="relative h-24 w-24 drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Typing Title */}
          <div className="space-y-4 max-w-2xl">
            <div className="h-14 md:h-16 flex items-center justify-center">
              <TextType
                className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight drop-shadow-sm"
                text={["Welcome to Lessonly"]}
                typingSpeed={100}
                pauseDuration={2500}
                showCursor
                cursorCharacter="|"
              />
            </div>

            <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed">
              Your AI-powered teaching assistant. <br className="hidden md:block"/>
              Simplify workflows, generate content, and visualize ideas instantly.
            </p>
          </div>
        </div>

        {/* Greeting Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 shadow-inner">
          <span>Hello,</span>
          <span className="text-cyan-400 font-bold tracking-wide">{userName}</span>
          <span className="animate-bounce">👋</span>
        </div>

        {/* --- ACTION CARDS GRID --- */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">

          {/* Card 1: Create Notes (Primary) */}
          <button
            onClick={CreatePage}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-[0_10px_30px_-10px_rgba(6,182,212,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(6,182,212,0.7)] hover:-translate-y-2 transition-all duration-300 border border-white/20 overflow-hidden"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Icon */}
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            
            {/* Text */}
            <div className="text-center relative z-10">
              <h3 className="text-xl font-bold mb-1">Create Content</h3>
              <p className="text-cyan-100 text-sm font-medium opacity-90">Generate Lessons & Quizzes</p>
            </div>
          </button>

          {/* Card 2: Mindmaps (Secondary) */}
          <button
            onClick={MindmapsPage}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl bg-slate-800/50 backdrop-blur-md border border-slate-700/50 hover:bg-slate-800 hover:border-blue-500/50 hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.3)] hover:-translate-y-2 transition-all duration-300"
          >
            {/* Icon */}
            <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors duration-300">
              <svg className="w-8 h-8 text-blue-400 group-hover:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            {/* Text */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">Visual Mindmaps</h3>
              <p className="text-slate-400 text-sm font-medium group-hover:text-slate-300">Transform PDFs into Maps</p>
            </div>
          </button>

          {/* Card 3: Subscribe (Tertiary) */}
          <button
            onClick={NewsletterPage}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl bg-slate-800/30 backdrop-blur-md border border-slate-700/30 hover:bg-slate-800/60 hover:border-purple-500/40 hover:-translate-y-2 transition-all duration-300"
          >
            {/* Icon */}
            <div className="p-4 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 transition-colors duration-300">
              <svg className="w-8 h-8 text-purple-400 group-hover:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Text */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-200 group-hover:text-purple-200 transition-colors">Newsletter</h3>
              <p className="text-slate-500 text-sm font-medium group-hover:text-slate-400">Stay Updated</p>
            </div>
          </button>
          
        </div>

      </div>
    </div>
  );
}