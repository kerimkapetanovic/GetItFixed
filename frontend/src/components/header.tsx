"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";

export default function Header() {
  const router = useRouter();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState("client");
  const [userData, setUserData] = useState({ firstName: "", lastName: "" });
  const [username, setUsername] = useState("");
  const avatarSeed = username || `${userData.firstName}${userData.lastName}` || userRole;
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;

  const brandColor = "#EF9D39";

  // 1. UČITAVANJE SESIJE (UI DIO)
  useEffect(() => {
    const role = localStorage.getItem("user_role");
    const loggedIn = localStorage.getItem("is_logged_in") === "true";
    const fName = localStorage.getItem("first_name") || "";
    const lName = localStorage.getItem("last_name") || "";
    const storedUsername = localStorage.getItem("username") || "";
  setUsername(storedUsername);

    if (loggedIn && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      setUserData({ firstName: fName, lastName: lName });
    }
  }, []);


  // 2. LOGOUT LOGIKA (ČISTI I KUKI I LOCALSTORAGE)
  const handleLogout = async () => {
    try {
      await api.post("/api/accounts/logout/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      setIsLoggedIn(false);
      setUserRole("client");
      setIsMenuOpen(false);
      router.push("/login");
    }
  };

  const allBaseLinks = [
    { name: "How It Works?", href: "/how-it-works", adminHide: true },
    { name: "Services", href: "/services", adminHide: false },
    { name: "AI Assistant", href: "/ai-repair-assistant", adminHide: true },
    { name: "Help", href: "/help", adminHide: false }, 
    { name: "Contact", href: "/contact", adminHide: false },
  ];

  const visibleBaseLinks = allBaseLinks.filter(
    (link) => !isLoggedIn || userRole !== "admin" || !link.adminHide,
  );
const getRoleLinks = (role: string) => {
  if (!isLoggedIn || !username) return []; // Dodaj provjeru za username
  
  switch (role) {
    case "client":
      return [
        { name: "New Request", href: `/${username}/new-request` },
        { name: "My Requests", href: `/${username}/requests` },
      ];
    case "handyman":
      return [
        { name: "Dashboard", href: `/${username}/dashboard` },
        { name: "Calendar", href: `/${username}/calendar` },
      ];
    case "admin":
      return [
        { name: "Users", href: "/admin/users" },
        { name: "Tracking", href: "/admin/tracking" },
      ];
    default:
      return [];
  }
};

  return (
    <header className="border-b-2 border-black w-full bg-white px-6 py-5 font-sans uppercase tracking-tight relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-3 text-2xl font-black normal-case tracking-tighter">
            <img src="/GetItFixed Logo.png" alt="Logo" className="h-10 w-auto object-contain" />
            <span>GetItFixed</span>
          </Link>
        </div>

        {/* NAV LINKOVI */}
        <nav className="hidden lg:flex flex-grow justify-center items-center gap-x-8 px-4">
          {visibleBaseLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold hover:underline underline-offset-8 decoration-2 transition-all whitespace-nowrap text-black"
            >
              {link.name}
            </Link>
          ))}

          {isLoggedIn && (
            <div className="flex items-center gap-4 ml-2 pl-8 border-l-2 border-gray-100">
              {getRoleLinks(userRole).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ backgroundColor: brandColor }}
                  className="text-black text-[11px] font-black px-5 py-2.5 rounded-[12px] hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 whitespace-nowrap border-2 border-black"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* DESNA STRANA (Login ili Profile) */}
        <div className="flex items-center gap-4 shrink-0">
          {!isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/login">
                  <button className="text-sm font-black px-5 py-2.5 rounded-[30px] border-2 border-transparent cursor-pointer hover:underline underline-offset-8 decoration-2 transition-all whitespace-nowrap text-black transition-all active:scale-95 normal-case tracking-tight">
                    Login
                  </button>
                </Link>              
                <Link href="/register">
                <button className="border-2 border-black px-6 py-2.5 text-sm font-black cursor-pointer rounded-[30px] bg-[#EF9D39] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                  Sign Up
                </button>
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 border-2 border-black p-2 pl-4 bg-white rounded-[16px] hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black leading-none uppercase">
                    {userData.firstName ? `${userData.firstName} ${userData.lastName}` : userRole}
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase leading-none">{userRole}</p>
                </div>
                <img
                  src={avatarUrl}
                  alt="Profile avatar"
                  className="w-10 h-10 rounded-full border-2 border-black object-cover shrink-0"
                />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white border-2 border-black z-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[20px] overflow-hidden">
                  <ul className="flex flex-col text-sm font-bold">
                    <li className="p-4 border-b-2 border-black hover:bg-gray-50 cursor-pointer">Account Settings</li>
                    <li onClick={handleLogout} className="p-4 bg-black text-white hover:bg-red-600 cursor-pointer text-center font-black uppercase tracking-widest transition-colors">
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}