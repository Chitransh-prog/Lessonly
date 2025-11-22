import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchUserAvatar } from "../api/UserCall";
import Profile_Sidebar from "./Profile_Sidebar";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [avatar, setAvatar] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarRef = useRef(null);

  const navLinks = [
    { name: "Home", path: "/hero" },
    { name: "Create", path: "/create" },
    { name: "Mindmaps", path: "/mindmaps" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    const getAvatar = async () => {
      try {
        const url = await fetchUserAvatar();
        setAvatar(url);
      } catch (err) {
        console.log(err);
      }
    };
    getAvatar();
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    }

    if (sidebarOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    } else {
      window.removeEventListener("mousedown", handleClickOutside);
    }

    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  return (
    <nav className="w-full flex justify-center py-4 bg-transparent">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] bg-[#0B0E1A] text-white 
                      flex items-center justify-between px-6 py-3 rounded-2xl shadow-sm relative">

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src="/Logo.png" alt="Lessonly Logo" className="h-7 w-7" />
          <span className="text-lg font-semibold">Lessonly</span>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className={`transition ${
                  location.pathname === link.path
                    ? "text-blue-500 font-semibold"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Avatar + Hamburger */}
        <div className="flex items-center gap-4">

          {/* Avatar Click → Sidebar */}
          <div className="relative" ref={sidebarRef}>
            <img
              src={avatar}
              alt="User"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="w-8 h-8 rounded-full object-cover border border-gray-600 cursor-pointer"
            />

            {sidebarOpen && (
              <div className="absolute right-0 mt-2 z-50">
                <Profile_Sidebar onClose={() => setSidebarOpen(false)} />
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="block md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <svg className="h-7 w-7" fill="none" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" />
              </svg>
            ) : (
              <svg className="h-7 w-7" fill="none" stroke="currentColor">
                <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="w-[90%] md:hidden bg-[#0B0E1A] text-white mt-2 p-4 
                        rounded-2xl space-y-3 shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                navigate(link.path);
                setMobileOpen(false);
              }}
              className={`block w-full text-left px-2 py-2 rounded-lg ${
                location.pathname === link.path
                  ? "text-blue-500 font-semibold"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
