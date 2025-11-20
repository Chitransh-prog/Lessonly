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
  <section className="min-h-screen w-full flex justify-center ">
    <div className="w-[90%] max-w-3xl flex flex-col gap-10">

      {/* FORM CARD */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-5">
          <img src="Logo.png" alt="logo" className="h-20 w-20" />
          <TextType
            className="text-3xl font-bold mt-2"
            text={["Content Generation"]}
            typingSpeed={200}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
          />
        </div>

        {/* FORM */}
        <form onSubmit={handleGenerate} className="space-y-5">

          <div>
            <label className="text-sm font-medium">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="border h-12 w-full rounded-lg border-gray-300 px-3"
              placeholder="Enter your Topic"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Optional Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="border w-full rounded-lg border-gray-300 p-3 h-20"
              placeholder="Enter optional summary"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Select Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border h-12 w-full rounded-lg border-gray-300 px-3"
            >
              <option>Select Type</option>
              <option value="Lesson Plan">Lesson Plan</option>
              <option value="Quiz">Quiz</option>
              <option value="Study Notes">Study Notes</option>
              <option value="Short Summary">Short Summary</option>
              <option value="Long Explanation">Long Explanation</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Grade Level</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="border h-12 w-full rounded-lg border-gray-300 px-3"
            >
              <option>Select Grade</option>
              <option value="High School">High School</option>
              <option value="Senior Secondary">Senior Secondary</option>
              <option value="Elementary">Elementary</option>
              <option value="Primary">Primary</option>
              <option value="Pre-Primary">Pre-Primary</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="border h-12 w-full rounded-lg border-gray-300 px-3"
            >
              <option>Select Tone</option>
              <option value="Professional/Formal">Professional/Formal</option>
              <option value="Academic">Academic</option>
              <option value="Informal">Informal</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Language</label>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border h-12 w-full rounded-lg border-gray-300 px-3"
              placeholder="Enter language"
            />
          </div>

          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-black text-white font-semibold text-xl flex items-center justify-center gap-2"
          >
            {loading ? "Generating with AI..." : "Generate with AI"}
            {!loading && <img src="AI.svg" alt="AI" className="h-6" />}
          </button>
        </form>
      </div>

      {/* Generated Content  */}
      {result && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-3">Generated Content:</h2>
          <div className="whitespace-pre-wrap text-gray-800">{result}</div>
        </div>
      )}
     {/* History Button */}
          <button className="h-10 w-32 bg-[#101828] text-white text-lg rounded-lg absolute top-24 right-16 flex items-center justify-center gap-2">
            <img src="history.svg" className="h-4" />
            History
          </button>

    </div>
  </section>
);
}
