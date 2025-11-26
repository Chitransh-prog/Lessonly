import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    // 1️⃣ Get current session instantly
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // 2️⃣ Listen for changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Still restoring session → show nothing (NO layout flicker)
  if (session === undefined) return null;

  // No session → redirect
  if (!session) return <Navigate to="/signin" replace />;

  // Authenticated
  return <Outlet />;
}
