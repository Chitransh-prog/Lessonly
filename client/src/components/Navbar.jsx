import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchUserAvatar } from "../api/UserCall";

export default function Navbar() {
  const location = useLocation();
  const [avatar, setAvatar] = useState(null);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Create", path: "/create" },
    { name: "Mindmaps", path: "/mindmaps" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    const getUserAvatar = async () => {
      const avatarUrl = await fetchUserAvatar();
      setAvatar(avatarUrl);
    };
    getUserAvatar();
  });

  return (
    <nav className="w-full flex justify-center py-4 bg-transparent">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] bg-[#0B0E1A] text-white flex items-center justify-between px-6 py-3 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-2">
          <img src="/Logo.png" alt="Lessonly Logo" className="h-7 w-7" />
          <span className="text-lg font-semibold tracking-tight">Lessonly</span>
        </div>

        <ul className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className={`transition-colors duration-200 ${
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

        <div className="flex items-center">
          <img
            src={avatar}
            alt="User"
            className="w-8 h-8 rounded-full object-cover border border-gray-700"
          />
        </div>
      </div>
    </nav>
  );
}
