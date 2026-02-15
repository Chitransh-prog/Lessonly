import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import TextType from "../animations/TextType"; // Assuming you have this, otherwise standard h1 is fine

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ first_name: "", last_name: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("id, first_name, last_name, email, created_at")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
        });
      }
      setLoading(false);
    }

    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (!error) {
      setProfile({ ...profile, ...formData });
      setEditMode(false);
    }

    setSaving(false);
  };

  // Reusable Input Style
  const inputClass = "w-full bg-slate-900/60 border border-slate-600 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all";

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
            <p className="text-slate-400 animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#1e293b] to-slate-900 relative overflow-x-hidden pt-28 pb-20">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-[90%] max-w-3xl mx-auto animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                {profile?.first_name?.[0] || profile?.email?.[0] || "U"}
            </div>
            <div>
                <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">
                    Your Profile
                </h1>
                <p className="text-slate-400">Manage your account settings</p>
            </div>
        </div>

        {/* Glass Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8 relative overflow-hidden">
            
            {/* Decoration line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-50" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Email (Read Only) */}
                <div className="md:col-span-2">
                    <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2 ml-1">Email Address</p>
                    <div className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-400 flex items-center justify-between cursor-not-allowed">
                        <span>{profile?.email}</span>
                        <svg className="w-5 h-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>

                {/* First Name */}
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">First Name</p>
                    {editMode ? (
                        <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className={inputClass}
                        />
                    ) : (
                        <div className="text-xl font-medium text-slate-200 border-b border-slate-700 pb-2 px-1">
                            {profile?.first_name || <span className="text-slate-600 italic">Not set</span>}
                        </div>
                    )}
                </div>

                {/* Last Name */}
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Last Name</p>
                    {editMode ? (
                        <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className={inputClass}
                        />
                    ) : (
                        <div className="text-xl font-medium text-slate-200 border-b border-slate-700 pb-2 px-1">
                            {profile?.last_name || <span className="text-slate-600 italic">Not set</span>}
                        </div>
                    )}
                </div>

                {/* Member Since */}
                <div className="md:col-span-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Member Since</p>
                    <p className="text-lg text-slate-300 px-1 font-mono">
                        {new Date(profile?.created_at).toLocaleDateString(undefined, {
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex gap-4 border-t border-white/5 mt-4">
            {!editMode ? (
                <button
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:-translate-y-1"
                onClick={() => setEditMode(true)}
                >
                Edit Profile
                </button>
            ) : (
                <>
                <button
                    className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-slate-900 font-bold shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                    className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all"
                    onClick={() => {
                        setEditMode(false);
                        setFormData({ first_name: profile.first_name, last_name: profile.last_name });
                    }}
                >
                    Cancel
                </button>
                </>
            )}
            </div>
        </div>
      </div>
    </div>
  );
}