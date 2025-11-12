import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import TextType from "../animations/TextType";
import { fetchUserName } from "../api/UserCall";

export default function Hero() {
  const [userName, setUserName] = useState("Educator");

  useEffect(() => {
    const getUserName = async () => {
      const name = await fetchUserName();
      if (!name) {
        console.log("Cannot get name");
      }
      setUserName(name);
    };

    getUserName();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          console.log("Updated name: ", session);
          const userMetadata = session.user.user_metadata;
          const name =
            userMetadata?.full_name || userMetadata?.name || "Educator";
          return name;
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
    <>
      <div className="h-screen flex flex-col items-center justify-center ">
        <img src="Logo.png" alt="Lessonly Logo" />

        <TextType
          className="text-6xl font-black"
          text={["Welcome to Lessonly!", "Welcome to Lessonly!"]}
          typingSpeed={200}
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter="|"
        />

        <h1 className="text-2xl font-semibold mt-4 text-gray-700">
          Hello, {userName}. Let's create something brilliant.
        </h1>
      </div>
    </>
  );
}
