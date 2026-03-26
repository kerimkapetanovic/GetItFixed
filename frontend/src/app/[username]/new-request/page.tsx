"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Wrench, Star, MapPin, Search, Check, Info, User } from "lucide-react";

export default function NewRequestPage() {
  const params = useParams();
  const username = params.username;

  const brandColor = "#EF9D39";

  // 1. SVI TVOJI SERVISI
  const services = [
    { id: "all", name: "All Services" },
    { id: "mechanic", name: "Auto mechanic" },
    { id: "pools", name: "Pool maintenance" },
    { id: "carpenter", name: "Carpenter & woodwork" },
    { id: "tiler", name: "Ceramics & Tiling" },
    { id: "cleaning", name: "Cleaning services" },
    { id: "electrician", name: "Electrician" },
    { id: "excavation", name: "Excavation" },
    { id: "facade", name: "Facade & insulation" },
    { id: "fencing", name: "Fencing & gates" },
    { id: "flooring", name: "Flooring & parquet" },
    { id: "renovation", name: "Full renovation" },
    { id: "gardener", name: "Gardening" },
    { id: "heating", name: "Heating & plumbing" },
    { id: "hvac", name: "HVAC & AC" },
    { id: "it_support", name: "IT support" },
    { id: "masonry", name: "Masonry & brickwork" },
    { id: "painter", name: "Painter & decorator" },
    { id: "plumber", name: "Plumbing specialist" },
    { id: "security", name: "Security systems" },
    { id: "solar", name: "Solar panel" },
    { id: "transport", name: "Transport & moving" },
    { id: "upholstery", name: "Upholstery" },
    { id: "windows", name: "Window & door" },
    { id: "roofing", name: "Roofing specialist" },
    { id: "appliances", name: "Appliance repair" },
    { id: "pest_control", name: "Pest control" },
  ];

  // 2. DUMMY PODACI ZA MAJSTORE (Povezani sa ID-evima servisa)
  const allHandymen = [
    { id: 1, name: "Mujo Mujić", category: "plumber", rating: 4.9, jobs: 124, location: "Centar", price: "30 KM/h", avatar: "MM" },
    { id: 2, name: "Kenan K.", category: "electrician", rating: 4.7, jobs: 89, location: "Ilidža", price: "25 KM/h", avatar: "KK" },
    { id: 3, name: "Amar D.", category: "painter", rating: 5.0, jobs: 45, location: "Stari Grad", price: "40 KM/h", avatar: "AD" },
    { id: 4, name: "Hamo H.", category: "plumber", rating: 4.5, jobs: 210, location: "Vogošća", price: "20 KM/h", avatar: "HH" },
    { id: 5, name: "Edin E.", category: "mechanic", rating: 4.8, jobs: 156, location: "Novi Grad", price: "35 KM/h", avatar: "EE" },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredHandymen = selectedCategory === "all" 
    ? allHandymen 
    : allHandymen.filter(h => h.category === selectedCategory);

  return (
    <div className="page-gradient flex flex-col min-h-screen text-black dark:text-white selection:bg-black selection:text-white font-sans">
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
       {/* HEADER BOX (Prilagođen stilu sa slike) */}
<div 
          className="text-center mb-12 p-8 border-[3px] border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          style={{ borderRadius: '30px' }}
        >
  {/* Mali ukrasni detalj u uglu (opcionalno za extra vibe) */}
  <div className="absolute -top-4 -right-4 w-12 h-12 bg-black rotate-45"></div>

 <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
    FIND YOUR <span style={{ color: brandColor }}>EXPERT</span>
  </h1>
  
  <div className="flex flex-col items-center gap-4">
    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] leading-relaxed">
      hi {username?.toString().split('-')[0]} • pick a service to begin
    </p>
    
    </div>
</div>

        {/* HORIZONTAL SCROLL FILTER BAR */}
        <div className="relative mb-12 group">
          <div className="flex overflow-x-auto gap-3 p-5 bg-white border-[3px] border-black rounded-[28px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] no-scrollbar scroll-smooth">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedCategory(service.id)}
                className={`whitespace-nowrap flex items-center gap-2 px-6 py-3 rounded-[18px] border-2 border-black font-black uppercase text-[10px] transition-all ${
                  selectedCategory === service.id 
                  ? "bg-[#EF9D39] text-black shadow-none translate-x-1 translate-y-1" 
                  : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                }`}
              >
                {selectedCategory === service.id && <Check size={16} className="text-green-700 font-bold" />}
                {service.name}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-3 px-2">
             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">← Swipe for more</p>
             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Showing: {selectedCategory.replace('_', ' ')}</p>
          </div>
        </div>

        {/* MAJSTORI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredHandymen.length > 0 ? (
            filteredHandymen.map((handy) => (
              <div 
                key={handy.id}
                className="bg-white border-[3px] border-black p-6 rounded-[24px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col"
              >
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 bg-black border-[3px] border-black rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-[4px_4px_0px_0px_rgba(239,157,57,1)] shrink-0">
                    {handy.avatar}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xl font-black uppercase tracking-tight">{handy.name}</h3>
                      <div className="flex items-center gap-1 bg-yellow-400 px-2 py-1 border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Star size={12} fill="black" /> {handy.rating}
                      </div>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">
                      {services.find(s => s.id === handy.category)?.name} • {handy.jobs} Jobs
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase bg-gray-50 p-3 rounded-xl border-2 border-black">
                    <MapPin size={14} style={{ color: brandColor }} />
                    {handy.location}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase bg-gray-50 p-3 rounded-xl border-2 border-black">
                    <Wrench size={14} style={{ color: brandColor }} />
                    {handy.price}
                  </div>
                </div>

                <button 
                  style={{ backgroundColor: brandColor }}
                  className="w-full mt-auto py-4 border-[3px] border-black rounded-2xl font-black uppercase text-xs shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:scale-[0.98]"
                >
                  Book this expert
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center border-[3px] border-dashed border-black/20 rounded-[40px] bg-white/30">
              <User size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="font-black uppercase text-gray-400 tracking-[0.2em] text-sm">
                No handymen available for this category yet.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      
      {/* CSS ZA SKRIVANJE SCROLLBAR-A */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}