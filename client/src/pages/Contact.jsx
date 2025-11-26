import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { ToastContainer, toast } from "react-toastify";
import TextType from "../animations/TextType";
import "react-toastify/dist/ReactToastify.css";

export default function ContactPage() {
  const [email, setEmail] = useState("");

  const success = () => toast("Subscribed Successfully 🎉", { theme: "dark" });
  const failure = () => toast("Something went wrong, try again 🙃", { theme: "dark" });

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast("Please enter a valid email", { theme: "dark" });
      return;
    }

    const { error } = await supabase.from("newsletter").insert({ email });

    if (error) {
      console.error(error);
      failure();
    } else {
      success();
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased flex flex-col">
      <main className="w-[90%] md:w-[80%] lg:w-[70%] mx-auto px-4 sm:px-6 md:px-8 mt-8 md:mt-12 text-center">

        <div className="flex flex-col items-center">
          <img src="Logo.png" alt="logo" className="h-20 w-20" />

          <TextType
            className="text-3xl font-black mt-3"
            text={["Get In Touch"]}
            typingSpeed={200}
            pauseDuration={1500}
            showCursor
            cursorCharacter="|"
          />
        </div>

        <section className="mt-8 sm:mt-12 bg-[#101828] text-white rounded-2xl p-6 sm:p-10 md:p-12 shadow-lg">
          <div className="max-w-3xl mx-auto text-left">

            <h2 className="text-base sm:text-lg md:text-xl font-semibold leading-relaxed">
              Do you want to get notified about new features and AI capabilities in Lessonly?
              <br />
              Sign up for our newsletter to be among the first to find out about:
            </h2>

            <ul className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm md:text-base font-medium">
              <li className="flex items-center">
                <span className="mr-3 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">•</span>
                Advanced AI Models
              </li>
              <li className="flex items-center">
                <span className="mr-3 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">•</span>
                Feature Expansion
              </li>
              <li className="flex items-center">
                <span className="mr-3 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">•</span>
                New Content Tools
              </li>
            </ul>

            {/* Input + Button */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 mx-2">

              <div className="w-full sm:flex-1">
                <div className="w-full bg-gray-200 rounded-[15px] px-3 py-2 sm:py-3 flex items-center">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your Email Address"
                    aria-label="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent placeholder-gray-500 outline-none w-full text-sm sm:text-base text-black font-medium"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubscribe}
                className="w-full sm:w-auto rounded-[15px] px-6 py-2.5 sm:py-3 bg-[#2b82ff] hover:bg-[#206edf] transition text-white font-semibold shadow-md"
              >
                Subscribe
              </button>

            </div>

           

            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-400">
              By subscribing, you agree with Lessonly’s Terms of Service and Privacy Policy.
            </p>

          </div>
        </section>
      </main>
    </div>
  );
}
