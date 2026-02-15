import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchUserAvatar } from "../api/UserCall";
import Profile_Sidebar from "./Profile_Sidebar"; // Ensure this component is also dark-themed!
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [avatar, setAvatar] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarRef = useRef(null); // Ref for the sidebar container
  const avatarRef = useRef(null);  // Ref for the avatar button

  const navLinks = [
    { name: "Home", path: "/hero" },
    { name: "Create", path: "/create" },
    { name: "Mindmaps", path: "/mindmaps" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  // Load Avatar
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        // Only fetch if user exists
        const url = await fetchUserAvatar();
        setAvatar(url || "https://api.dicebear.com/9.x/micah/svg?seed=User"); // Fallback avatar
      }
    };

    load();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') load();
      if (event === 'SIGNED_OUT') setAvatar(null);
    });
    
    return () => listener.subscription.unsubscribe();
  }, []);

  // Close sidebar/mobile menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) &&
        !avatarRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-center py-6 z-50 pointer-events-none">
      {/* pointer-events-none on wrapper allows clicking through the empty sides, 
         pointer-events-auto on the actual navbar restores clicks.
      */}
      
      <div
        className="
          pointer-events-auto
          w-[90%] md:w-[85%] lg:w-[70%] 
          bg-slate-900/80 backdrop-blur-xl 
          border border-white/10 
          text-slate-100 
          flex items-center justify-between 
          px-6 py-3 rounded-2xl shadow-2xl shadow-black/50
          transition-all duration-300
        "
      >
        {/* --- Logo --- */}
        <Link to="/hero" className="flex items-center gap-3 group">
          <img 
            src="/Logo.png" 
            alt="Lessonly Logo" 
            className="h-8 w-8 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] group-hover:scale-110 transition-transform duration-300" 
          />
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
            Lessonly
          </span>
        </Link>

        {/* --- Desktop Navigation --- */}
        <ul className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-2 py-1 border border-white/5">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`
                    relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
                    ${isActive 
                      ? "text-cyan-950 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]" 
                      : "text-slate-400 hover:text-white hover:bg-white/10"
                    }
                  `}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* --- Right Side: Avatar + Mobile Toggle --- */}
        <div className="flex items-center gap-4">
          
          {/* Avatar Profile Trigger */}
          <div className="relative">
            <button
              ref={avatarRef}
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
                setMobileOpen(false);
              }}
              className={`
                relative p-0.5 rounded-full transition-all duration-300
                ${sidebarOpen ? "ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]" : "hover:ring-2 hover:ring-slate-600"}
              `}
            >
              <img
                src={avatar || "https://api.dicebear.com/9.x/micah/svg?seed=Guest"}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover bg-slate-800"
              />
            </button>

            {/* Profile Sidebar Dropdown (Floating) */}
            {sidebarOpen && (
              <div 
                ref={sidebarRef}
                className="absolute right-0 top-14 w-64 animate-slide-down origin-top-right z-[60]"
              >
                {/* We wrap the Sidebar component in a glass container style */}
                <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                  <Profile_Sidebar onClose={() => setSidebarOpen(false)} />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
            onClick={() => {
              setMobileOpen(!mobileOpen);
              setSidebarOpen(false);
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* --- Mobile Menu Dropdown --- */}
      {mobileOpen && (
        <div
          className="
            absolute top-[90px] 
            w-[90%] md:hidden 
            bg-slate-900/95 backdrop-blur-xl border border-white/10 
            p-4 rounded-2xl shadow-2xl shadow-black/80
            z-40 flex flex-col gap-2 animate-slide-down pointer-events-auto
          "
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.name}
                onClick={() => {
                  navigate(link.path);
                  setMobileOpen(false);
                }}
                className={`
                  w-full text-left px-4 py-3 rounded-xl font-medium transition-all
                  ${isActive 
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                {link.name}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}