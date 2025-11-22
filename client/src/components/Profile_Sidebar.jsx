import { useNavigate } from "react-router-dom";

export default function History() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-28 pb-10 w-[90%] max-w-5xl mx-auto">
      <h1 className="text-4xl font-black mb-10">Your History</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Content History Box */}
        <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Content History</h2>
            <p className="text-gray-600 mb-4">
              View all educational content you’ve generated.
            </p>
          </div>

          <button
            onClick={() => navigate("/create-history")}
            className="mt-auto px-5 py-2 bg-black text-white rounded-xl w-max"
          >
            View More →
          </button>
        </div>

        {/* Mindmap History Box */}
        <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Mindmap History</h2>
            <p className="text-gray-600 mb-4">
              Explore all the mindmaps you’ve created.
            </p>
          </div>

          <button
            onClick={() => navigate("/mindmaps-history")}
            className="mt-auto px-5 py-2 bg-black text-white rounded-xl w-max"
          >
            View More →
          </button>
        </div>
      </div>
    </div>
  );
}
