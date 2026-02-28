"use client";
import Link from 'next/link';
import React, { useState } from 'react';

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userRole, setUserRole] = useState('client'); 

    const allBaseLinks = [
        { name: "How It Works?", href: "/how-it-works", adminHide: true },
        { name: "Services", href: "/services", adminHide: false },
        { name: "AI Assistant", href: "/ai-repair-assistant", adminHide: true },
        { name: "Contact", href: "/contact", adminHide: false },
    ];

    // FIX: Sada provjeravamo i da li je korisnik ulogovan pre nego što sakrijemo linkove
    const visibleBaseLinks = allBaseLinks.filter(link => 
        !isLoggedIn || userRole !== 'admin' || !link.adminHide
    );

    const getRoleLinks = (role) => {
        if (!isLoggedIn) return [];
        switch (role) {
            case 'client': return [{ name: "My Requests", href: "/client/requests" }];
            case 'provider': return [
                { name: "Dashboard", href: "/provider/dashboard" },
                { name: "Calendar", href: "/provider/calendar" }
            ];
            case 'admin': return [
                { name: "Users", href: "/admin/users" },
                { name: "Tracking Cases", href: "/admin/tracking" }, // NOVO
                { name: "Disputes", href: "/admin/disputes" },
                { name: "Analytics", href: "/admin/analytics" }
            ];
            default: return [];
        }
    };

    const loginAs = (role) => {
        setUserRole(role);
        setIsLoggedIn(true);
        setIsMenuOpen(false);
    };

    // FIX: Resetujemo ulogu na logoutu
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserRole('client'); 
        setIsMenuOpen(false);
    };

    return (
        <header className="border-b-2 border-black w-full bg-white px-6 py-5 font-sans uppercase tracking-tight">
            <div className="max-w-7xl mx-auto flex justify-between items-center relative">
                
                {/* 1. LOGO */}
                <div className="flex-1 flex justify-start">
                    <Link href="/" className="text-2xl font-black normal-case tracking-tighter shrink-0">
                        GetItFixed
                    </Link>
                </div>

                {/* 2. SREDINA - NAV LINKOVI */}
                <nav className="hidden lg:flex items-center gap-8">
                    {visibleBaseLinks.map((link) => (
                        <Link 
                            key={link.href} 
                            href={link.href} 
                            className="text-sm font-bold hover:underline underline-offset-8 decoration-2 transition-all whitespace-nowrap"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* 3. DESNA STRANA */}
                <div className="flex-1 flex justify-end items-center gap-6">
                    {isLoggedIn && (
                        <nav className="hidden md:flex items-center gap-3 border-r-2 border-gray-200 pr-6 mr-2">
                            {getRoleLinks(userRole).map((link) => (
                                <Link 
                                    key={link.href} 
                                    href={link.href} 
                                    className="bg-black text-white text-[10px] font-bold px-4 py-2 hover:bg-gray-800 transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    )}

                    {!isLoggedIn ? (
                        <div className="flex items-center gap-5">
                            <div className="flex gap-2 border border-dashed border-gray-300 p-2 text-[10px] font-bold lowercase">
                                <button onClick={() => loginAs('client')} className="hover:underline">C</button>
                                <button onClick={() => loginAs('provider')} className="hover:underline">P</button>
                                <button onClick={() => loginAs('admin')} className="hover:underline">A</button>
                            </div>
                            <button className="text-sm font-bold hover:underline underline-offset-4">Login</button>
                            <button className="border-2 border-black px-5 py-2 text-sm font-black bg-white hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                                Sign Up
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-4 border-2 border-black p-2 pl-4 bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                            >
                                <div className="text-right">
                                    <p className="text-[10px] font-black leading-none">{userRole}</p>
                                    <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase leading-none">Settings</p>
                                </div>
                                <div className="w-9 h-9 bg-black flex items-center justify-center text-white text-sm font-bold border border-black">
                                    {userRole[0].toUpperCase()}
                                </div>
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 mt-3 w-52 bg-white border-2 border-black z-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                    <ul className="flex flex-col text-sm font-bold">
                                        <li className="p-4 border-b border-black hover:bg-gray-50 cursor-pointer">Account Settings</li>
                                        {userRole === 'admin' && (
                                            <li className="p-4 border-b border-black hover:bg-gray-50 cursor-pointer text-red-600">System Logs</li>
                                        )}
                                        <li 
                                            onClick={handleLogout}
                                            className="p-4 bg-black text-white hover:bg-red-600 cursor-pointer transition-colors text-center font-black uppercase tracking-widest"
                                        >
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