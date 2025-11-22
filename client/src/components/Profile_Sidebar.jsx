import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Profile_Sidebar() {
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/signin");
  }

  return (
    <div className="w-56 bg-[#0B0E1A] shadow-xl rounded-xl p-4 border border-gray-800">
      <h3 className="text-lg font-semibold mb-3 text-white">My Account</h3>

      <div className="flex flex-col gap-2">

        {/* Profile */}
        <button
          onClick={() => navigate("/profile")}
          className="w-full text-left px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-700 hover:text-white transition"
        >
          Profile
        </button>

        {/* History */}
        <button
          onClick={() => navigate("/history")}
          className="w-full text-left px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-700 hover:text-white transition"
        >
          History
        </button>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-gray-700 hover:text-red-300 transition"
        >
          Sign Out
        </button>

      </div>
    </div>
  );
}
