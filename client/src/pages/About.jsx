import React from "react";
import TextType from "../animations/TextType";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased pb-20">
      <main className="w-[90%] md:w-[80%] lg:w-[70%] mx-auto mt-12">

        <div className="flex flex-col items-center mb-5 text-center">
          <img src="Logo.png" alt="logo" className="h-20 w-20 drop-shadow-md" />

          <TextType
            className="text-3xl font-bold mt-4"
            text={["About Lessonly"]}
            typingSpeed={200}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
          />

          <p className="mt-3 text-gray-600 max-w-xl">
            A smart, fast, AI-powered assistant for teachers and institutions.
          </p>
        </div>

        <section className="bg-[#101828] text-white p-8 md:p-10 rounded-2xl shadow-xl shadow-black/20 leading-relaxed space-y-6">

          <h2 className="text-2xl font-bold">What is Lessonly?</h2>
          <p className="text-gray-100 tracking-wide">
            Lessonly is an AI-powered web platform that automates classroom
            preparation for educators, helping reduce workload and boost creativity.
          </p>

          <hr className="border-gray-700 my-6" />

          <h2 className="text-2xl font-bold">Core Functionality</h2>
          <ul className="list-disc ml-6 space-y-2 text-gray-100">
            <li><span className="font-semibold text-white">Content Generation:</span> Lesson plans, quizzes, summaries, flashcards & more.</li>
            <li><span className="font-semibold text-white">AI Stack:</span> Powered by Gemini API.</li>
            <li><span className="font-semibold text-white">Secure & Scalable:</span> Supabase Edge Functions handle AI calls safely.</li>
            <li><span className="font-semibold text-white">User Protection:</span> RLS ensures strict data privacy.</li>
            <li><span className="font-semibold text-white">Multiple Exports:</span> Export as PDF, DOCX, or share publicly.</li>
          </ul>

          <hr className="border-gray-700 my-6" />

          <h2 className="text-2xl font-bold">Who Is It For?</h2>
          <p className="text-gray-100">
            Perfect for teachers, tutors, EdTech teams, coaching institutes & creators.
          </p>

          <hr className="border-gray-700 my-6" />

          <h2 className="text-2xl font-bold">Team & Contributors 💛</h2>
          <p className="text-gray-100">Built with passion by:</p>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">

            <a
              href="https://chitranshprasad.vercel.app"
              target="_blank"
              className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-center font-semibold 
                         transition flex items-center justify-center gap-3 hover:scale-[1.02]"
            >
              <img src="chitransh.jpeg" className="w-9 h-9 rounded-full object-cover" />
              Chitransh
            </a>

            <a
              href="https://github.com/Sumitdixit2"
              target="_blank"
              className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-center font-semibold 
                         transition flex items-center justify-center gap-3 hover:scale-[1.02]"
            >
              <img src="sumit.png" className="w-9 h-9 rounded-full object-cover" />
              Sumit Dixit
            </a>

            <a
              href="https://github.com/DevloperAryan"
              target="_blank"
              className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-center font-semibold 
                         transition flex items-center justify-center gap-3 hover:scale-[1.02]"
            >
              <img src="aryan.png" className="w-9 h-9 rounded-full object-cover" />
              Aryan Kumar
            </a>

            <a
              href="https://github.com/Sanjayyadav-Github"
              target="_blank"
              className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-center font-semibold 
                         transition flex items-center justify-center gap-3 hover:scale-[1.02]"
            >
              <img src="sanjay.png" className="w-9 h-9 rounded-full object-cover" />
              Sanjay Prasad Yadav
            </a>

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
