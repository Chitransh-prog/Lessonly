import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Profile_Sidebar() {
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/signin");
  }

  return (
    <div className="w-56 bg-[#0B0E1A] shadow-xl rounded-xl p-4 border border-gray-200 animate-fadeIn">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">My Account</h3>

      <div className="flex flex-col gap-2">

        {/* Profile */}
        <button
          onClick={() => navigate("/profile")}
          className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-500 transition"
        >
        Profile
        </button>

        {/* History Center */}
        <button
          onClick={() => navigate("/history")}
          className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-500 transition"
        >
          History
        </button>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-blue-500 transition"
        >
          Sign Out
        </button>

      </div>
    </div>
  );
}