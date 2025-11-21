import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg">Loading...</div>;

  return (
    <div className="min-h-screen pt-28 pb-10 w-[90%] max-w-3xl mx-auto">
      <h1 className="text-4xl font-black mb-6">Your Profile</h1>

      <div className="bg-white rounded-2xl shadow p-6 space-y-6 border border-gray-200">
        {/* Email (non-editable) */}
        <div>
          <p className="text-gray-500 text-sm">Email</p>
          <p className="text-xl font-semibold">{profile?.email}</p>
        </div>

        {/* First Name */}
        <div>
          <p className="text-gray-500 text-sm">First Name</p>
          {editMode ? (
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="border w-full px-3 py-2 rounded-lg"
            />
          ) : (
            <p className="text-xl font-semibold">{profile?.first_name}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <p className="text-gray-500 text-sm">Last Name</p>
          {editMode ? (
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="border w-full px-3 py-2 rounded-lg"
            />
          ) : (
            <p className="text-xl font-semibold">{profile?.last_name}</p>
          )}
        </div>

        {/* Member Since */}
        <div>
          <p className="text-gray-500 text-sm">Member Since</p>
          <p className="text-lg">{new Date(profile?.created_at).toLocaleString()}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          {!editMode ? (
            <button
              className="px-5 py-2 bg-black text-white rounded-xl"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                className="px-5 py-2 bg-green-600 text-white rounded-xl"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                className="px-5 py-2 bg-gray-300 text-black rounded-xl"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}