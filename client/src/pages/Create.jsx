import TextType from "../animations/TextType";

export default function Create() {
  return (
    <>
      <section className="min-h-screen w-full flex justify-center items-center">
        <div className="w-[70%] h-screen p-5 flex justify-center items-center relative">
          <div className="w-96 h-[95vh] p-3">
            <div className="w-full h-36">
              <div className="flex justify-center items-center">
                <img src="/public/logo.png" alt="logo" className="h-20 w-20" />
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
            <div className="w-full h-125 flex justify-center items-center">
                <form action="">
                    <label htmlFor="topic" className="text-sm font-medium">Topic:</label> <br />
                    <input type="text" id="topic" placeholder="Enter your Topic" className="border h-12 w-85 rounded-sm border-gray-300 px-2 opacity-50"/> <br />
                    <label htmlFor="summary" className="text-sm font-medium">Optional Summary:</label> <br />
                    <input type="text" id="summary" placeholder="Enter optional summary fot it" className="border h-12 w-85 rounded-sm border-gray-300 px-2 opacity-50"/> <br /> 
                    <label htmlFor="type" className="text-sm font-medium">Select Type:</label> <br />
                    <select name="type" id="type" className="border h-12 w-85 rounded-sm border-gray-300 px-2 opacity-50">
                        <option value="Select type">Select Type</option>
                    </select>
                    <label htmlFor="lesson para" className="text-sm font-medium">Lesson Parameters:</label> <br />
                    <select name="lesson para" id="lesson para" className="border h-12 w-85 rounded-sm border-gray-300 px-2 opacity-50">
                        <option value="Select type">Select the Audience/Grade level</option>
                    </select>
                    <select name="lesson tone" id="lesson tone" className="border h-12 w-85 mt-3 rounded-sm border-gray-300 px-2 opacity-50">
                        <option value="Select type">Select the Tone style</option>
                    </select>
                    <label htmlFor="language" className="text-sm font-medium">Language:</label> <br />
                    <input type="text" id="language" placeholder="Enter the language for generation" className="border h-12 w-85 rounded-sm border-gray-300 px-2 opacity-50"/> <br /> <br />
                    <button className="border h-12 w-85 rounded-xl border-gray-300 bg-black px-2 text-white font-semibold">Generate with</button>
                </form>
            </div>
          </div>
          <button className="h-10 w-32 bg-[#101828] text-white text-lg rounded-lg absolute top-0 right-0">
            History
          </button>
        </div>
      </section>
    </>
  );
}
