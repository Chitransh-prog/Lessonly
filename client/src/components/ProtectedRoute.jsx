import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// Adjust the path to your supabase client
import { supabase } from '../lib/supabase'; 

const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null means checking, true/false means result

    useEffect(() => {
        const checkAuth = async () => {
            // Get the current Supabase session
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Supabase session error:", error);
                setIsAuthenticated(false);
                return;
            }

            // If a session exists, the user is authenticated
            setIsAuthenticated(!!session);
        };

        checkAuth();
        
        // Listen for auth state changes (in case of async login/logout)
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // 1. Show a loading state while checking auth
    if (isAuthenticated === null) {
        return <div className="text-center p-10">Loading authentication status...</div>;
    }

    // 2. If authenticated, render the children routes
    // Outlet is a feature of nested routes in react-router-dom v6
    if (isAuthenticated) {
        return <Outlet />;
    }

    // 3. If not authenticated, redirect to the sign-in page
    return <Navigate to="/signin" replace />;
};

export default ProtectedRoute;