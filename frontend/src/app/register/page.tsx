"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Hammer, Eye, EyeOff, MapPin, Phone, Mail, Lock, Globe, Hash, Briefcase } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useSearchParams } from 'next/navigation';  

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const queryRole = searchParams?.get('role') === 'pro' ? 'pro' : 'client';

  const [role, setRole] = useState<'client' | 'pro'>('client');
  const [showPassword, setShowPassword] = useState(false);
  const softGradient ="linear-gradient(135deg, #FFE8D6 0%, #FFD4B3 100%)";


  const mainCardStyle = { 
    borderRadius: '32px', 
    maxWidth: '650px' 
  };
  const inputRadius = { borderRadius: '16px' };
  const roleRadius = { borderRadius: '20px' };

  useEffect(() => {
    const newRole = searchParams?.get('role') === 'pro' ? 'pro' : 'client';
    setRole(newRole);
  }, [searchParams]);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: softGradient }}>
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-6 py-12">
        <div 
          style={mainCardStyle}
          className="w-full bg-white border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 flex flex-col"
        >
          <div className="text-center mb-10">
            <h1 className="text-[32px] font-black text-gray-900 uppercase tracking-tighter">Create Account</h1>
            <p className="text-gray-500 font-bold text-sm mt-2 uppercase">Join the GetItFixed community</p>
          </div>

          {/* ROLE SELECTION */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <button 
              type="button"
              onClick={() => setRole('client')}
              style={roleRadius}
              className={`flex flex-col items-center justify-center p-6 border-4 transition-all ${
                role === 'client' 
                ? 'border-black  bg-[linear-gradient(90deg,#EF9D39_10%,#FFD25A_90%)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-1 -translate-y-1' 
                : 'border-gray-100 bg-white opacity-60'
              }`}
            >
              <User size={24} strokeWidth={3} className="mb-2" />
              <span className="font-black text-sm uppercase">Client</span>
              <span className="text-[10px] font-bold opacity-70">Need a repair</span>
            </button>

            <button 
              type="button"
              onClick={() => setRole('pro')}
              style={roleRadius}
              className={`flex flex-col items-center justify-center p-6 border-4 transition-all ${
                role === 'pro' 
                ? 'border-black  bg-[linear-gradient(90deg,#FFD25A_10%,#EF9D39_90%)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-1 -translate-y-1' 
                : 'border-gray-100 bg-white opacity-60'
              }`}
            >
              <Hammer size={24} strokeWidth={3} className="mb-2" />
              <span className="font-black text-sm uppercase">Handyman</span>
              <span className="text-[10px] font-bold opacity-70">Want to work</span>
            </button>
          </div>

          <form className="space-y-5">
            {/* NAME & SURNAME */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="group">
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1">First Name</label>
                <input type="text" placeholder="John" style={inputRadius} className="w-full bg-white border-2 border-black p-4 text-sm font-bold outline-none focus:bg-yellow-50 transition-all" />
              </div>
              <div className="group">
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1">Last Name</label>
                <input type="text" placeholder="Doe" style={inputRadius} className="w-full bg-white border-2 border-black p-4 text-sm font-bold outline-none focus:bg-yellow-50 transition-all" />
              </div>
            </div>

            {/* EMAIL & PHONE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="group">
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                  <Mail size={12} /> Email address
                </label>
                <input type="email" placeholder="john@example.com" style={inputRadius} className="w-full bg-white border-2 border-black p-4 text-sm font-bold outline-none focus:bg-yellow-50 transition-all" />
              </div>
              <div className="group">
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                  <Phone size={12} /> Phone Number
                </label>
                <input type="tel" placeholder="+387 61 123 456" style={inputRadius} className="w-full bg-white border-2 border-black p-4 text-sm font-bold outline-none focus:bg-yellow-50 transition-all" />
              </div>
            </div>

            {/* DODATNA POLJA ZA MAJSTORE (Prikazuju se samo ako je role === 'pro') */}
{role === 'pro' && (
  <div className="p-6 border-4 border-black bg-gray-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-4 duration-300" 
       style={{ borderRadius: '24px' }}> {/* Zaobljen kontejner */}
    <div className="group relative">
      <label className="block text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-3 ml-2 flex items-center gap-2">
        <Briefcase size={14} className="text-black" /> Professional Expertise
      </label>
      
      <div className="relative">
        <select 
          /* KORISTIMO TVOJ RADIJUS OVDJE */
          style={inputRadius}
          defaultValue=""
          className="w-full bg-white border-2 border-black p-5 pr-12 text-sm font-bold normal-case tracking-tight outline-none focus: bg-[linear-gradient(90deg,#FFD25A_10%,#EF9D39_90%)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all appearance-none cursor-pointer"
        >
          <option value="" disabled className="text-gray-400">Select your main service</option>
          <option value="mechanic">Auto mechanic</option>
          <option value="pools">Pool maintenance & swimming pools</option>
          <option value="carpenter">Carpenter & woodwork</option>
          <option value="tiler">Ceramics & Tiling</option>
          <option value="cleaning">Cleaning services</option>
          <option value="electrician">Electrician</option>
          <option value="excavation">Excavation & groundwork</option>
          <option value="facade">Facade & insulation</option>
          <option value="fencing">Fencing & gates</option>
          <option value="flooring">Flooring & parquet</option>
          <option value="renovation">Full renovation expert</option>
          <option value="gardener">Gardening & landscaping</option>
          <option value="heating">Heating & plumbing systems</option>
          <option value="hvac">HVAC & air conditioning</option>
          <option value="it_support">IT support & tech solutions</option>
          <option value="masonry">Masonry & brickwork</option>
          <option value="painter">Painter & decorator</option>
          <option value="plumber">Plumbing specialist</option>
          <option value="security">Security & surveillance systems</option>
          <option value="solar">Solar panel installation</option>
          <option value="transport">Transport & moving services</option>
          <option value="upholstery">Upholstery & furniture repair</option>
          <option value="windows">Window & door installation</option>
        </select>
        
        {/* CUSTOM STRELICA - Pomjerena malo zbog zaobljenja */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none border-l-2 border-black pl-3">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L6 6L11 1" stroke="black" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      
      <p className="text-[10px] font-bold text-gray-400 mt-3 uppercase ml-2 italic">
        * Select the field you are most experienced in.
      </p>
    </div>
  </div>
)}

            {/* LOCATION INFO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="group">
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2"><MapPin size={12} /> City</label>
                <input type="text" placeholder="Mostar" style={inputRadius} className="w-full bg-white border-2 border-black p-4 text-sm font-bold outline-none focus:bg-yellow-50 transition-all" />
              </div>
              <div className="group">
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2"><Globe size={12} /> Country</label>
                <input type="text" placeholder="BiH" style={inputRadius} className="w-full bg-white border-2 border-black p-4 text-sm font-bold outline-none focus:bg-yellow-50 transition-all" />
              </div>
              <div className="group">
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2"><Hash size={12} /> Zip Code</label>
                <input type="text" placeholder="88000" style={inputRadius} className="w-full bg-white border-2 border-black p-4 text-sm font-bold outline-none focus:bg-yellow-50 transition-all" />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="group">
              <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2"><Lock size={12} /> Create Password</label>
              <div className="relative flex items-center w-full">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Strong password"
                  style={inputRadius}
                  className="w-full bg-white border-2 border-black p-4 pr-12 text-sm font-bold outline-none focus:bg-yellow-50 transition-all block"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-black hover:scale-110 transition-transform"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              style={inputRadius}
              className="w-full mt-6 mb-4 bg-black text-white py-5 font-black uppercase tracking-widest text-sm transition-all border-2 border-black shadow-[6px_6px_0px_0px_rgba(249,177,77,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95"
            >
              Create Account
            </button>
          </form>

          <div className="mt-8 text-center">
             <Link href="/login" className="text-gray-500 text-xs font-bold uppercase tracking-tight">
               Already have an account? <span className="text-black border-b-2 border-yellow-300 pb-0.5 hover:bg-yellow-300 transition-colors">Login here</span>
             </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}