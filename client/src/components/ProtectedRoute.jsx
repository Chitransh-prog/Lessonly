import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { fetchCheckAuth } from "../api/AuthCall";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null means checking, true/false means result

  useEffect(() => {
    const checkAuth = async () => {
      const session = await fetchCheckAuth();
      if (!session) {
        setIsAuthenticated(false);
      }
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="text-center p-10">Loading authentication status...</div>
    );
  }

  if (isAuthenticated) {
    return <Outlet />;
  }

  return <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
