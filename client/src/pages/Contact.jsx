import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { ToastContainer, toast } from "react-toastify";
import TextType from "../animations/TextType";
import "react-toastify/dist/ReactToastify.css";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const success = () => toast.success("Subscribed Successfully 🎉", { 
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });

  const failure = (msg) => toast.error(msg || "Something went wrong 🙃", { 
    theme: "dark" 
  });

  const handleSubscribe = async () => {
    if (!email.trim() || !email.includes("@")) {
      failure("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("newsletter").insert({ email });

      if (error) {
        if (error.code === '23505') { // Unique violation code for Postgres
            failure("You are already subscribed!");
        } else {
            throw error;
        }
      } else {
        success();
        setEmail("");
      }
    } catch (error) {
      console.error(error);
      failure();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#1e293b] to-slate-900 relative overflow-x-hidden flex flex-col justify-center pb-20">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

      <ToastContainer />

      <main className="relative z-10 w-[90%] md:w-[80%] lg:w-[60%] mx-auto px-4 mt-8 text-center animate-fadeIn">

        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <img 
            src="Logo.png" 
            alt="logo" 
            className="h-20 w-20 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] mb-4 hover:scale-110 transition-transform duration-500" 
          />

          <div className="h-12 flex items-center justify-center">
            <TextType
                className="text-4xl font-black text-white tracking-tight drop-shadow-lg"
                text={["Get In Touch"]}
                typingSpeed={100}
                pauseDuration={1500}
                showCursor
                cursorCharacter="|"
            />
          </div>
        </div>

        {/* Glass Card */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          
          {/* Subtle sheen effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="max-w-3xl mx-auto text-left relative z-10">

            <h2 className="text-xl md:text-2xl font-semibold text-slate-200 leading-relaxed mb-8">
              Want to get notified about <span className="text-cyan-400">new AI capabilities</span> in Lessonly?
              <br />
              <span className="text-slate-400 text-lg font-normal block mt-2">Sign up for our newsletter to be the first to know about:</span>
            </h2>

            {/* Feature List */}
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                "Advanced AI Models",
                "Feature Expansion",
                "New Content Tools"
              ].map((item, index) => (
                <li key={index} className="flex items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-200 font-medium">
                  <span className="mr-3 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-lg">•</span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Input + Button Area */}
            <div className="flex flex-col sm:flex-row gap-4">
              
              <div className="flex-1 relative">
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full bg-slate-900/60 border border-slate-600 rounded-xl px-5 py-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all disabled:opacity-50"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubscribe}
                disabled={loading}
                className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? "Subscribing..." : "Subscribe Now"}
              </button>

            </div>

            <p className="mt-6 text-sm text-slate-500 text-center sm:text-left">
              By subscribing, you agree with Lessonly’s <span className="text-slate-400 underline cursor-pointer hover:text-cyan-400">Terms of Service</span> and <span className="text-slate-400 underline cursor-pointer hover:text-cyan-400">Privacy Policy</span>.
            </p>

          </div>
        </section>
      </main>
    </div>
  );
}