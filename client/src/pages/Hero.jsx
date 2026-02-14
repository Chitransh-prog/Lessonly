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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-6">
      
      {/* Card Container */}
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl p-10 text-center space-y-8">

        {/* Logo */}
        <img
          src="Logo.png"
          alt="Lessonly Logo"
          className="h-20 w-20 mx-auto"
        />

        {/* Title */}
        <div className="space-y-3">
          <TextType
            className="text-4xl font-extrabold text-gray-900"
            text={["Welcome to Lessonly"]}
            typingSpeed={120}
            pauseDuration={1500}
            showCursor
            cursorCharacter="|"
          />

          <p className="text-lg text-gray-600">
            AI-powered tools to simplify your teaching workflow.
          </p>
        </div>

        {/* Greeting */}
        <h2 className="text-xl font-semibold text-gray-700">
          Hello, <span className="text-blue-600">{userName}</span> 👋
        </h2>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">

          <button
            onClick={CreatePage}
            className="rounded-xl px-6 py-4 bg-black text-white font-semibold shadow-lg hover:scale-105 hover:bg-gray-900 transition-all duration-300"
          >
            Create Notes
          </button>

          <button
            onClick={MindmapsPage}
            className="rounded-xl px-6 py-4 bg-blue-600 text-white font-semibold shadow-lg hover:scale-105 hover:bg-blue-700 transition-all duration-300"
          >
            Create Mindmaps
          </button>

          <button
            onClick={NewsletterPage}
            className="rounded-xl px-6 py-4 bg-gray-200 text-gray-800 font-semibold shadow hover:scale-105 hover:bg-gray-300 transition-all duration-300"
          >
            Subscribe
          </button>
        </div>

      </div>
    </div>
  );
}
