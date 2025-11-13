import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ContactPage() {
  const [email, setEmail] = useState("");

  const success = () => toast("Subscribed Successfully 🎉",{theme:"dark"});
  const failure = () => toast("Something went wrong, try again 🙃",{theme:"dark"});

  const handleSubscribe = async () => {
    if (!email) {
      toast("Please enter a valid email");
      return;
    }

    const { error } = await supabase
      .from("newsletter")
      .insert({ email });

    if (error) {
      console.error(error);
      failure(); 
    } else {
      success(); 
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">

      <main className=" w-[90%] md:w-[80%] lg:w-[70%] mx-auto px-4 sm:px-6 md:px-8 mt-8 md:mt-12 text-center w-full">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center">

            {/* YOUR ORIGINAL MAIN SVG (UNCHANGED) */}
            <svg width="105" height="113" viewBox="0 0 105 113" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* … YOUR FULL ORIGINAL PATHS HERE … */}
            </svg>

          </div>

          <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#101828]">
            Get in Touch<span className="cursor-blink">|</span>
          </h1>
        </div>

        <section className="mt-[20px] mb-[50px] sm:mt-12 bg-[#101828] text-white rounded-2xl p-6 sm:p-10 md:p-12 shadow-lg ">
          <div className="max-w-3xl mx-auto text-left">

            <h2 className="text-base sm:text-lg md:text-xl font-semibold leading-relaxed">
              Do you want to get notified about new features and AI capabilities in Lessonly?
              <br />
              Sign up for our newsletter to be among the first to find out about:
            </h2>

            <ul className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm md:text-base font-medium list-none">
              <li className="flex items-center"><span className="inline-flex items-center justify-center mr-3 w-6 h-6 rounded-full bg-white/10 text-white text-xs">•</span>Advanced AI Models</li>
              <li className="flex items-center"><span className="inline-flex items-center justify-center mr-3 w-6 h-6 rounded-full bg-white/10 text-white text-xs">•</span>Feature Expansion</li>
              <li className="flex items-center"><span className="inline-flex items-center justify-center mr-3 w-6 h-6 rounded-full bg-white/10 text-white text-xs">•</span>New Content Tools</li>
            </ul>

            <div className="mt-6 mx-4 sm:mt-8 flex flex-col sm:flex-row items-center gap-3">

              <div className="w-full sm:flex-1">
                <label htmlFor="email" className="flex items-center w-full bg-gray-200 rounded-[15px] px-3 py-2 sm:py-3 text-base">

                  {/* email icon removed */}
                  <input
                    id="email"
                    name="email"
                    type="email"
                    aria-label="Email address"
                    placeholder="Enter your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent placeholder-gray-500 outline-none w-full text-sm sm:text-base text-black font-medium"
                  />
                </label>
              </div>

              <button
                onClick={handleSubscribe}
                className="w-full sm:w-auto rounded-[15px] px-6 py-2.5 sm:py-3 bg-[#2b82ff] hover:bg-[#206edf] transition text-white font-semibold shadow-md cursor-pointer"
              >
                Subscribe
              </button>
            </div>

            <ToastContainer /> 

            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-400">
              By subscribing, you agree with Lessonly Terms of Service and Privacy Policy.
            </p>

          </div>
        </section>
      </main>

      <style>{`
        .cursor-blink {
          display: inline-block;
          animation: blink 1s step-start infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>

    </div>
  );
}
