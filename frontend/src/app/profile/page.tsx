"use client";

import React, { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { User, Mail, Lock, Camera, Save, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export default function ProfilePage() {
  const brandColor = "#EF9D39";
  const { t } = useLanguage();
  const profileTitleParts = t('profile.title').split(' ');

  const [formData] = useState(() => {
    if (typeof window === "undefined") {
      return {
        firstName: "",
        lastName: "",
        phone: "+387 61 123 456",
        location: "Sarajevo, Centar",
        email: "user@example.com",
      };
    }

    return {
      firstName: localStorage.getItem("first_name") || "",
      lastName: localStorage.getItem("last_name") || "",
      phone: localStorage.getItem("phone") || "+387 61 123 456",
      location: localStorage.getItem("location") || "Sarajevo, Centar",
      email: localStorage.getItem("email") || "user@example.com",
    };
  });

  const [username] = useState(() => {
    if (typeof window === "undefined") {
      return "User";
    }

    return localStorage.getItem("username") || "User";
  });

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;

  return (
    <div 
      className="page-gradient flex flex-col min-h-screen text-black dark:text-white selection:bg-black selection:text-white font-sans" 
    >
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
        {/* NASLOVNA SEKCIJA */}
        <div 
          className="bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-zinc-700 p-8 mb-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(239,157,57,0.2)] flex flex-col md:flex-row items-center gap-8"
          style={{ borderRadius: '30px' }}
        >
          <div className="relative group">
            <div className="w-32 h-32 bg-black border-[3px] border-black rounded-[24px] overflow-hidden shadow-[5px_5px_0px_0px_rgba(239,157,57,1)]">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <button className="absolute -bottom-2 -right-2 bg-[#EF9D39] border-2 border-black p-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
              <Camera size={18} />
            </button>
          </div>

          <div className="text-center md:text-left flex-grow">
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">
              {profileTitleParts[0]} <span style={{ color: brandColor }}>{profileTitleParts.slice(1).join(' ')}</span>
            </h1>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">
              {t('profile.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LIJEVA KOLONA: OSNOVNI PODACI */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-zinc-700 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(239,157,57,0.2)] rounded-[24px]">
              <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                <User size={20} style={{ color: brandColor }} strokeWidth={3} />
                {t('profile.basicInfo')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">First Name</label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    className="w-full border-2 border-black dark:border-zinc-600 p-3 rounded-xl font-bold dark:bg-zinc-800 dark:text-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    className="w-full border-2 border-black dark:border-zinc-600 p-3 rounded-xl font-bold dark:bg-zinc-800 dark:text-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    className="w-full border-2 border-black dark:border-zinc-600 p-3 rounded-xl font-bold dark:bg-zinc-800 dark:text-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">City / Location</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    className="w-full border-2 border-black dark:border-zinc-600 p-3 rounded-xl font-bold dark:bg-zinc-800 dark:text-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                style={{ backgroundColor: brandColor }}
                className="mt-8 w-full md:w-auto px-8 py-3 border-[3px] border-black rounded-xl font-black uppercase text-xs shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} /> {t('profile.saveChanges')}
              </button>
            </div>
          </div>

          {/* DESNA KOLONA: SIGURNOST */}
          <div className="space-y-6">
            <div className="bg-black text-white border-[3px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[24px]">
              <h2 className="text-sm font-black uppercase mb-6 flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#EF9D39]" />
                Security
              </h2>
              
              <div className="space-y-4">
                <button className="w-full bg-white text-black border-2 border-black p-3 rounded-xl font-black text-[10px] uppercase hover:bg-[#EF9D39] transition-colors flex items-center justify-between">
                  Change Email <Mail size={14} />
                </button>
                <button className="w-full bg-white text-black border-2 border-black p-3 rounded-xl font-black text-[10px] uppercase hover:bg-[#EF9D39] transition-colors flex items-center justify-between">
                  Reset Password <Lock size={14} />
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-800">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Account Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase">Verified Handyman</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-zinc-700 p-6 shadow-[8px_8px_0px_0px_rgba(255,0,0,0.2)] rounded-[24px] border-dashed">
              <p className="text-[10px] font-bold text-red-500 uppercase mb-3">Danger Zone</p>
              <button className="text-[10px] font-black uppercase text-gray-400 hover:text-red-500 underline underline-offset-4 decoration-2 transition-all">
                Delete Account Forever
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}