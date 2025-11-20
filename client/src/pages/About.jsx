import React from "react";
import TextType from "../animations/TextType";

export default function AboutPage() {
  return (
    <div className="h-full bg-white text-gray-900 antialiased">
      <main className="w-[90%] md:w-[80%] lg:w-[70%] mx-auto px-4 sm:px-6 md:px-8 mt-8 md:mt-12 w-full mb-[25px]">
        <div className="flex flex-col items-center mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center">
            <svg
              width="105"
              height="113"
              viewBox="0 0 105 113"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 20C0 8.95432 8.95431 0 20 0H85C96.0457 0 105 8.95431 105 20V45.4055V75.3557C105 84.5707 97.5298 92.0409 88.3148 92.0409L79.5079 113L64.4353 92.0409H20C8.9543 92.0409 0 83.0866 0 72.0409V47.1846V20Z"
                fill="#2C6AFF"
              />
              <path
                d="M68.2776 22.3214L68.9017 19.2857L68.2776 16.8571C68.2776 16.8571 67.6535 15.0562 65.7813 13.8214C63.909 12.5867 62.0368 12 62.0368 12C62.0368 12 57.2314 12 53.2996 12M68.2776 22.3214C68.2776 22.3214 67.6535 24.1429 65.7813 26.5714C63.909 29 62.0368 29 62.0368 29M68.2776 22.3214L70.7739 18.6786L75.7665 20.5L78.887 22.9286C78.887 22.9286 79.447 22.9286 80.7592 24.75C82.0714 26.5714 83.2555 29 83.2555 29L85.1278 33.8571L85.7518 38.7143L84.5037 43.5714L85.7518 47.2143L87 51.4643V55.7143L85.1278 59.9643L83.2555 61.7857L80.7592 63.6071M80.7592 63.6071L77.6388 63M80.7592 63.6071V67.25L77.6388 72.1071C77.4308 72.7143 76.3906 74.2929 73.8943 75.75C71.398 77.2071 68.2776 78.7857 67.0294 79.3929L62.6609 80H56.42H53.2996M53.2996 80V65.4286M53.2996 80H43.9384L37.0736 77.5714L32.0809 73.9286L29.5846 69.6786L29.8787 67.3892M53.2996 65.4286L63.909 64.8214M53.2996 65.4286V50.8571M63.909 64.8214L67.6535 69.6786M63.909 64.8214L67.6535 59.6638M53.2996 50.8571H41.4421L32.0809 42.3571L40.194 33.8571L41.4421 32.0357C41.4421 32.0357 37.0736 27.1786 35.8254 24.75C34.5772 22.3214 34.5772 21.1071 34.5772 21.1071M53.2996 50.8571V42.3571M34.5772 21.1071L35.8254 17.4643C35.8254 17.4643 36.4495 15.6429 38.9458 13.8214C41.4421 12 41.4421 12 41.4421 12H53.2996M34.5772 21.1071H30.2087L25.84 22.3214C25.84 22.3214 23.9678 24.75 22.0955 27.1786C20.2233 29.6071 18.9751 32.0357 18.9751 32.0357L18.351 36.8929L19.5992 45.3929M53.2996 12V42.3571M53.2996 42.3571H65.7813M65.7813 42.3571C64.8674 42.5931 66.5474 37.1173 69.5257 36.8929C72.5041 36.6684 72.0221 36.8929 73.8943 36.8929C75.7665 36.8929 78.0029 39.8603 78.2629 42.3571C78.5229 44.854 75.7665 48.4286 73.8943 48.4286C72.0221 48.4286 70.7739 49.2473 69.5257 48.4286C68.2776 47.6099 65.7813 45.3929 65.7813 42.9643C65.7813 40.5357 65.7813 42.3571 65.7813 42.3571ZM42.6903 64.8214L40.194 61.7857L35.8254 60.5714L32.705 61.7857L30.2087 64.8214L30.1729 65.0998M42.6903 64.8214V67.25M42.6903 64.8214L40.194 62.3929L35.8254 61.1786L32.705 62.3929L30.1729 65.0998M30.1729 65.0998L29.8787 67.3892M29.8787 67.3892L21.4715 63L18 55.7143L18.9751 47.2143L19.5992 45.3929M19.5992 45.3929L23.9678 48.4286"
                stroke="white"
                strokeWidth="5"
              />
            </svg>
          </div>

          <TextType
            className="text-3xl font-black mt-3"
            text={["About Lessonly"]}
            typingSpeed={200}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
          />

        </div>
        {/* info div */}
        <section className="bg-[#101828] text-white px-4 md:px-6 lg:px-10 py-10 rounded-[20px] font-bold leading-tight [&>*]:mb-4 [&>*:last-child]:mb-0 ">
          <h2>
            Lessonly is an AI-powered web platform that automates classroom
            preparation for educators. Our mission is to reduce teacher workload
            and enhance creativity by delivering quality educational content
            within minutes.
          </h2>
          <h2>Core Functionality</h2>
          <ul className="list-disc ml-8 [&>*]:mb-1">
            <li>Content Generation: Intelligently generates lesson plans, quizzes, summaries, and flashcards from any given topic.</li>
            <li>Technology Stack: Leverages the Gemini API for structured educational material.</li>
            <li>Secure & Scalable: Uses Supabase Edge Functions to handle all AI calls, securely protecting API keys and ensuring easy scaling. Each User will be given 6000 token, renewed everyday.</li>
            <li>User Data: The Supabase Backend manages user authentication and secure data storage, with RLS (Row Level Security) ensuring users only access their own data.</li>
            <li>Output: Teachers can export results as PDF, DOCX, or share via a public link.</li>
          </ul>
          <h2>
            <p>Target Audience</p>
            <p>The platform is designed for Teachers, tutors, institutions, and education startups, as well as content creators and e-learning platforms.</p>
          </h2>
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
