"use client";
import Link from "next/link";
import React, { useState } from "react";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState("client");

  const brandColor = "#EF9D39";

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
    if (!isLoggedIn) return [];
    switch (role) {
      case "client":
        return [
          { name: "New Request", href: "/client/new-request" },
          { name: "My Requests", href: "/client/requests" },
        ];
      case "provider":
        return [
          { name: "Dashboard", href: "/provider/dashboard" },
          { name: "Calendar", href: "/provider/calendar" },
        ];
      case "admin":
        return [
          { name: "Users", href: "/admin/users" },
          { name: "Tracking", href: "/admin/tracking" },
          { name: "Disputes", href: "/admin/disputes" },
        ];
      default:
        return [];
    }
  };

  const loginAs = (role: string) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("client");
    setIsMenuOpen(false);
  };

  return (
    <header className="border-b-2 border-black w-full bg-white px-6 py-5 font-sans uppercase tracking-tight relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* 1. LOGO */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-3 text-2xl font-black normal-case tracking-tighter">
            <img src="/GetItFixed Logo.png" alt="Logo" className="h-10 w-auto object-contain" />
            <span>GetItFixed</span>
          </Link>
        </div>

        {/* 2. SREDINA - NAV LINKOVI (Vraćeni fontovi i dodata boja) */}
        <nav className="hidden lg:flex flex-grow justify-center items-center gap-x-8 px-4">
          {/* Osnovni linkovi - Vraćeno na text-sm */}
          {visibleBaseLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold hover:underline underline-offset-8 decoration-2 transition-all whitespace-nowrap text-black"
            >
              {link.name}
            </Link>
          ))}

          {/* Role-specific linkovi - Brand Boja (Narandžasta) */}
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

        {/* 3. DESNA STRANA */}
        <div className="flex items-center gap-4 shrink-0">
          {!isLoggedIn ? (
            <div className="flex items-center gap-4">
              {/* DEV HELPER */}
              <div className="hidden md:flex gap-1 border border-dashed border-gray-300 p-1.5 text-[9px] font-bold lowercase rounded-xl bg-gray-50">
                <button onClick={() => loginAs("client")} className="px-1 hover:text-[#EF9D39]">c</button>
                <button onClick={() => loginAs("provider")} className="px-1 hover:text-[#EF9D39]">p</button>
                <button onClick={() => loginAs("admin")} className="px-1 hover:text-[#EF9D39]">a</button>
              </div>

              <Link href="/login">
                  <button className="text-sm font-black px-5py-2.5 rounded-[30px] border-2 border-transparent cursor-pointer hover:underline underline-offset-8 decoration-2 transition-all whitespace-nowrap text-black  transition-all active:scale-95 normal-case tracking-tight">
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
                className="flex items-center gap-3 border-2 border-black p-1.5 pl-4 bg-white rounded-[16px] hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black leading-none uppercase">{userRole}</p>
                  <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase leading-none">Settings</p>
                </div>
                <div className="w-8 h-8 bg-black flex items-center justify-center text-white text-xs font-bold border border-black rounded-lg uppercase">
                  {userRole[0]}
                </div>
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