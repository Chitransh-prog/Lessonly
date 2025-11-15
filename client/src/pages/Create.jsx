import { useState } from "react";
import TextType from "../animations/TextType";
import { generateEducationalContent } from "../lib/gemini";
import { saveGeneratedContent } from "../api/content";
import { supabase } from "../lib/supabase";


export default function Create() {
  const [topic, setTopic] = useState("");
  const [summary, setSummary] = useState("");
  const [type, setType] = useState("");
  const [grade, setGrade] = useState("");
  const [tone, setTone] = useState("");
  const [language, setLanguage] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const getUserId = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
};

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
  

    try {
      const data = await generateEducationalContent({
        topic,
        summary,
        type,
        grade,
        tone,
        language,
      });
      setResult(data);
      // Saving to Supabase
      const user_id = await getUserId();

      await saveGeneratedContent({
        title: topic,
        description: summary || "",
        content: data,
        user_id,
      });

alert("Content saved successfully!");

    } catch (err) {
      console.error(err);
      setResult("Error generating content.");
    }

    setLoading(false);
  };

  return (
    <>
      <section className="min-h-screen w-full flex justify-center items-center">
        <div className="w-[70%] h-screen p-5 flex justify-center items-center relative">
          <div className="w-96 h-[95vh] p-3">
            <div className="w-full h-36">
              <div className="flex justify-center items-center">
                <img src="Logo.png" alt="logo" className="h-20 w-20" />
              </div>
              <div className="flex justify-center items-center">
                <TextType
                  className="text-3xl font-black"
                  text={["Content Generation"]}
                  typingSpeed={200}
                  pauseDuration={1500}
                  showCursor={true}
                  cursorCharacter="|"
                />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleGenerate} className="space-y-4">

              <label className="text-sm font-medium">Topic:</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="border h-12 w-85 rounded-sm border-gray-300 px-2 opacity-50"
                placeholder="Enter your Topic"
                required
              />

              <label className="text-sm font-medium">Optional Summary:</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="border h-12 w-85 rounded-sm border-gray-300 px-2 opacity-50"
                placeholder="Enter optional summary"
              />

              <label className="text-sm font-medium">Select Type:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border h-12 w-85 rounded-sm border-gray-300 px-2 opacity-50"
              >
                <option>Select Type</option>
                <option value="Lesson Plan">Lesson Plan</option>
                <option value="Quiz">Quiz</option>
                <option value="Study Notes">Study Notes</option>
                <option value="Short Summary">Short Summary</option>
                <option value="Long Explanation">Long Explanation</option>
              </select>

              <label className="text-sm font-medium">Grade Level:</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="border h-12 w-85 rounded-sm border-gray-300 px-2 opacity-50"
              >
                <option>Select Grade</option>
                <option value="High School">High School</option>
                <option value="Senior Secondary">Senior Secondary</option>
                <option value="Elementary">Elementary</option>
                <option value="Primary">Primary</option>
                <option value="Pre-Primary">Pre-Primary</option>
              </select>

              <label className="text-sm font-medium">Tone:</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="border h-12 w-85 rounded-sm border-gray-300 px-2 opacity-50"
              >
                <option>Select Tone</option>
                <option value="Professional/Formal">Professional/Formal</option>
                <option value="Academic">Academic</option>
                <option value="Informal">Informal</option>
              </select>

              <label className="text-sm font-medium">Language:</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border h-12 w-85 rounded-sm border-gray-300 px-2 opacity-50"
                placeholder="Enter language"
              />

              <button
                type="submit"
                className="border h-12 w-85 rounded-xl border-gray-300 bg-black px-2 text-white font-semibold text-3xl"
              >
                {loading ? "Generating..." : "Generate with "}
                {!loading && <img src="AI.svg" alt="AI" className="inline-block" />}
              </button>
            </form>
          </div>

          {/* Output */}
          <div className="w-[55%] p-5 bg-white rounded-lg shadow-md overflow-y-auto">
            <h2 className="text-xl font-semibold mb-3">Generated Content:</h2>
            <div className="whitespace-pre-wrap">{result}</div>
          </div>
        </div>
      </section>
    </>
  );
}
