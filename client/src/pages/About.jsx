import React from "react";
import TextType from "../animations/TextType";

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#1e293b] to-slate-900 relative overflow-x-hidden pb-20">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="relative z-10 w-[90%] md:w-[80%] lg:w-[60%] mx-auto mt-16 animate-fadeIn">

        {/* Header Section */}
        <div className="flex flex-col items-center mb-12 text-center space-y-4">
          <img 
            src="Logo.png" 
            alt="logo" 
            className="h-24 w-24 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-transform hover:scale-110 duration-500" 
          />

          <div className="h-12 flex items-center justify-center">
            <TextType
              className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg"
              text={["About Lessonly"]}
              typingSpeed={100}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="|"
            />
          </div>

          <p className="text-slate-400 max-w-xl text-lg font-medium">
            A smart, fast, <span className="text-cyan-400">AI-powered assistant</span> for teachers and institutions.
          </p>
        </div>

        {/* Content Card */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 text-slate-200 p-8 md:p-12 rounded-3xl shadow-2xl space-y-8">

          {/* Intro */}
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">What is Lessonly?</h2>
            <p className="text-slate-300 leading-relaxed text-lg">
              Lessonly is an AI-powered web platform that automates classroom
              preparation for educators, helping reduce workload and boost creativity.
            </p>
          </div>

          <hr className="border-white/10" />

          {/* Core Functionality */}
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Core Functionality</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Content Generation", desc: "Lesson plans, quizzes, summaries & flashcards." },
                { title: "AI Stack", desc: "Powered by Gemini API." },
                { title: "Secure & Scalable", desc: "Supabase Edge Functions handle AI calls safely." },
                { title: "User Protection", desc: "RLS ensures strict data privacy." },
                { title: "Multiple Exports", desc: "Export as PDF, DOCX, or share publicly." }
              ].map((item, index) => (
                <li key={index} className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl hover:border-cyan-500/30 transition-colors">
                  <span className="block font-semibold text-white mb-1">{item.title}</span>
                  <span className="text-slate-400 text-sm">{item.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <hr className="border-white/10" />

          {/* Target Audience */}
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">Who Is It For?</h2>
            <p className="text-slate-300">
              Perfect for teachers, tutors, EdTech teams, coaching institutes & creators.
            </p>
          </div>

          <hr className="border-white/10" />

          {/* Team Section */}
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
              Team & Contributors <span className="text-yellow-400">💛</span>
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { name: "Chitransh", img: "chitransh.jpeg", link: "https://chitranshprasad.vercel.app" },
                { name: "Sumit Dixit", img: "sumit.png", link: "https://github.com/Sumitdixit2" },
                { name: "Aryan Kumar", img: "aryan.png", link: "https://github.com/DevloperAryan" },
                { name: "Sanjay Prasad Yadav", img: "sanjay.png", link: "https://github.com/Sanjayyadav-Github" }
              ].map((member, idx) => (
                <a
                  key={idx}
                  href={member.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative px-4 py-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 flex items-center gap-4 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  
                  <img 
                    src={member.img} 
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-600 group-hover:border-cyan-400 transition-colors" 
                  />
                  <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {member.name}
                  </span>
                  
                  <svg className="w-5 h-5 text-slate-500 ml-auto group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

        </section>
      </main>

      <style>{`
        .cursor-blink { display: inline-block; animation: blink 1s step-start infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}