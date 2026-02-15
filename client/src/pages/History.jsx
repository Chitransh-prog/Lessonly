import { useNavigate } from "react-router-dom";
import TextType from "../animations/TextType"; // Optional, standard h1 works too if preferred

export default function History() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#1e293b] to-slate-900 relative overflow-x-hidden pt-28 pb-20">
      
      {/* Background Ambience */}
      <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-[90%] max-w-5xl mx-auto animate-fadeIn">
        
        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-6">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md mb-2">
            Your History
          </h1>
          <p className="text-slate-400 text-lg">
            Manage your past generations and saved mindmaps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Content History Box */}
          <div 
            onClick={() => navigate("/create-history")}
            className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:bg-white/10 hover:border-cyan-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-2xl overflow-hidden"
          >
            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-6 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                Content History
              </h2>
              <p className="text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                View all educational content, lesson plans, and quizzes you’ve generated using Lessonly AI.
              </p>
            </div>

            <div className="mt-8 relative z-10">
              <span className="inline-flex items-center text-cyan-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                View More <span className="ml-2">→</span>
              </span>
            </div>
          </div>

          {/* Mindmap History Box */}
          <div 
            onClick={() => navigate("/mindmaps-history")}
            className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:bg-white/10 hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-2xl overflow-hidden"
          >
            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-6 group-hover:border-blue-500/50 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                Mindmap History
              </h2>
              <p className="text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                Browse the visual mindmaps you created from PDFs and text using our AI tools.
              </p>
            </div>

            <div className="mt-8 relative z-10">
              <span className="inline-flex items-center text-blue-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                View More <span className="ml-2">→</span>
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}