import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Initial check
    const session = supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session);
    });

    // Auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return <div className="text-center p-10">Loading authentication...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
}
