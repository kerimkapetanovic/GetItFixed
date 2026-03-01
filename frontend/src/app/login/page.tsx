"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Hammer, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function LoginPage() {
  // Postavljamo 'client' kao defaultno checkiranu ulogu
  const [role, setRole] = useState<'client' | 'pro'>('client');
  const [showPassword, setShowPassword] = useState(false);

  // Stilovi za radijuse i fiksne širine
  const mainCardStyle = { 
    borderRadius: '32px', 
    maxWidth: '500px' // Ovo sprečava da bude "široko i blijedo"
  };
  const inputRadius = { borderRadius: '16px' };
  const roleRadius = { borderRadius: '20px' };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD]">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-6 py-12">
        {/* KARTICA - Centrirana i fiksne širine */}
        <div 
          style={mainCardStyle}
          className="w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 flex flex-col"
        >
          
          <div className="text-center mb-10">
            <h1 className="text-[32px] font-black text-gray-900 uppercase tracking-tighter">Welcome Back</h1>
            <p className="text-gray-500 font-bold text-sm mt-2 uppercase">Sign in to your account</p>
          </div>

          {/* ROLE SELECTION - Klikabilno i jasno označeno */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {/* Klijent Kartica */}
            <button 
              type="button"
              onClick={() => setRole('client')}
              style={roleRadius}
              className={`flex flex-col items-center justify-center p-6 border-4 transition-all ${
                role === 'client' 
                ? 'border-black bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' 
                : 'border-gray-100 bg-white hover:border-gray-200 opacity-60'
              }`}
            >
              <div className={`p-3 rounded-xl mb-3 ${role === 'client' ? ' text-black' : 'bg-gray-100 text-gray-400'}`}>
                <User size={24} strokeWidth={3} />
              </div>
              <span className="font-black text-sm uppercase tracking-tight">Client</span>
              <span className="text-[10px] font-bold opacity-70">Looking for help</span>
            </button>

            {/* Majstor Kartica */}
            <button 
              type="button"
              onClick={() => setRole('pro')}
              style={roleRadius}
              className={`flex flex-col items-center justify-center p-6 border-4 transition-all ${
                role === 'pro' 
                ? 'border-black bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' 
                : 'border-gray-100 bg-white hover:border-gray-200 opacity-60'
              }`}
            >
              <div className={`p-3 rounded-xl mb-3 ${role === 'pro' ? ' text-black' : 'bg-gray-100 text-gray-400'}`}>
                <Hammer size={24} strokeWidth={3} />
              </div>
              <span className="font-black text-sm uppercase tracking-tight">Handyman</span>
              <span className="text-[10px] font-bold opacity-70">Offering services</span>
            </button>
          </div>

          {/* FORMA ZA PRIJAVU */}
          <div className="space-y-6">
            <div className="group">
              <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1">Email address</label>
              <input 
                type="email" 
                placeholder={role === 'client' ? "client@example.com" : "handyman@example.com"}                
                style={inputRadius}
                className="w-full bg-white border-2 border-black p-4 text-sm font-bold text-gray-900 outline-none focus:bg-yellow-50 transition-all placeholder:text-gray-300"
              />
            </div>
<div className="group">
  <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1">
    Password
  </label>
  
  {/* KONTEJNER: Koristimo flex da ih držimo u istoj liniji bez obzira na sve */}
  <div className="relative flex items-center w-full">
    <input 
      type={showPassword ? "text" : "password"} 
      placeholder="Your password"
      style={inputRadius}
      /* pr-12 ostavlja prostor za ikonu unutra */
      className="w-full bg-white border-2 border-black p-4 pr-12 text-sm font-bold text-gray-900 outline-none focus:bg-yellow-50 transition-all placeholder:text-gray-300 block"
    />
    
    {/* DUGME: Forsiramo ga desno sa absolute, ali unutar flex centra */}
    <button 
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      /* right-4 ga zakucava desno, h-full osigurava centriranje unutar inputa */
      className="absolute right-0 flex items-center justify-center text-black hover:scale-110 transition-transform z-30"
      style={{ height: '24px', width: '24px', background: 'transparent', border: 'none' }}
    >
      {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
    </button>
  </div>
</div>
            <button 
              style={inputRadius}
              className="w-full mt-3 mb-4 bg-black text-white py-5 font-black uppercase tracking-widest text-sm transition-all border-2 border-black shadow-[6px_6px_0px_0px_rgba(249,177,77,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95"
            >
              Sign in
            </button>
          </div>

          <div className="mt-10 text-center">
             <Link href="/register" className="text-gray-500 text-xs font-bold uppercase tracking-tight">
               Don't have an account? <span className="text-black border-b-2 border-yellow-300 pb-0.5 hover:bg-yellow-300 transition-colors">Register here</span>
             </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}