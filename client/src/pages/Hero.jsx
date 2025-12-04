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
      if (!name) console.log("Cannot get name");
      else setUserName(name);
    };

    getUserName();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const userMetadata = session.user.user_metadata;
          const name =
            userMetadata?.full_name || userMetadata?.name || "Educator";
          setUserName(name);
        } else {
          console.log("Session not found");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center pt-12 gap-6 pb-20">

      {/* Logo */}
      <img src="Logo.png" alt="Lessonly Logo" className="h-20 w-20" />

      {/* Title Animation */}
      <TextType
        className="text-3xl font-black"
        text={["Welcome to Lessonly!", "Welcome to Lessonly!"]}
        typingSpeed={200}
        pauseDuration={1500}
        showCursor={true}
        cursorCharacter="|"
      />

      {/* Greeting */}
      <h1 className="text-xl sm:text-2xl font-semibold mt-4 text-gray-700 text-center">
        Hello, {userName}. <br /> Let's create something brilliant.
      </h1>

      {/* Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">

        {/* Create Notes */}
        <button
          onClick={CreatePage}
          className="rounded-[15px] px-6 py-3 bg-black hover:bg-[#206edf] transition text-white font-semibold shadow-md"
        >
          Create Notes
        </button>

        {/* Mindmaps */}
        <button
          onClick={MindmapsPage}
          className="rounded-[15px] px-6 py-3 bg-black hover:bg-[#206edf] transition text-white font-semibold shadow-md"
        >
          Create Mindmaps
        </button>

        {/* Newsletter */}
        <button
          onClick={NewsletterPage}
          className="rounded-[15px] px-6 py-3 bg-black hover:bg-[#206edf] transition text-white font-semibold shadow-md"
        >
          Subscribe to Newsletter
        </button>
      </div>
    </div>
  );
}
