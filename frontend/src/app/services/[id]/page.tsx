"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Star, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// 1. EXPANDED MOCK DATABASE - Now covering all 21 categories!
const mockProviders = [
  // Plumbing & Electrical
  { id: 101, name: "Amar D.", category: "plumbing", rating: 4.9, jobs: 142, price: "50 BAM/hr", location: "Sarajevo" },
  { id: 102, name: "Kerim K.", category: "plumbing", rating: 4.7, jobs: 89, price: "40 BAM/hr", location: "Ilidža" },
  { id: 103, name: "Haris Š.", category: "electrical", rating: 5.0, jobs: 210, price: "60 BAM/hr", location: "Sarajevo" },
  
  // Tech & HVAC
  { id: 104, name: "Faris B.", category: "it_support", rating: 4.8, jobs: 56, price: "45 BAM/hr", location: "Vogošća" },
  { id: 105, name: "Senad O.", category: "hvac", rating: 4.6, jobs: 120, price: "70 BAM/hr", location: "Sarajevo" },
  
  // Construction & Walls
  { id: 106, name: "Emir T.", category: "painting", rating: 4.9, jobs: 34, price: "30 BAM/hr", location: "Zenica" },
  { id: 107, name: "Nedim H.", category: "tiler", rating: 4.8, jobs: 92, price: "45 BAM/hr", location: "Tuzla" },
  { id: 108, name: "Kenan B.", category: "facade", rating: 4.7, jobs: 61, price: "60 BAM/hr", location: "Mostar" },
  { id: 109, name: "Tarik L.", category: "excavation", rating: 5.0, jobs: 28, price: "120 BAM/hr", location: "Sarajevo" },
  
  // Wood, Floors & Windows
  { id: 110, name: "Samir D.", category: "carpenter", rating: 4.9, jobs: 184, price: "55 BAM/hr", location: "Banja Luka" },
  { id: 111, name: "Adnan R.", category: "flooring", rating: 4.5, jobs: 42, price: "40 BAM/hr", location: "Ilidža" },
  { id: 112, name: "Vedad J.", category: "windows", rating: 4.8, jobs: 115, price: "50 BAM/hr", location: "Sarajevo" },
  
  // Home, Garden & Pools
  { id: 113, name: "Selma K.", category: "cleaning", rating: 5.0, jobs: 305, price: "25 BAM/hr", location: "Sarajevo" },
  { id: 114, name: "Lejla F.", category: "gardener", rating: 4.9, jobs: 76, price: "35 BAM/hr", location: "Visoko" },
  { id: 115, name: "Goran V.", category: "pools", rating: 4.7, jobs: 39, price: "65 BAM/hr", location: "Mostar" },
  
  // Auto & Transport
  { id: 116, name: "Dino M.", category: "mechanic", rating: 4.8, jobs: 220, price: "50 BAM/hr", location: "Tuzla" },
  { id: 117, name: "Hasan C.", category: "transport", rating: 4.6, jobs: 410, price: "80 BAM/hr", location: "Sarajevo" },
  
  // Specialized (Security, Solar, Renovation, Fencing, Upholstery)
  { id: 118, name: "Armin Z.", category: "security", rating: 4.9, jobs: 88, price: "60 BAM/hr", location: "Sarajevo" },
  { id: 119, name: "Enes P.", category: "solar", rating: 5.0, jobs: 22, price: "90 BAM/hr", location: "Mostar" },
  { id: 120, name: "Majstor A.", category: "renovation", rating: 4.8, jobs: 156, price: "100 BAM/hr", location: "Sarajevo" },
  { id: 121, name: "Mirza S.", category: "fencing", rating: 4.7, jobs: 45, price: "55 BAM/hr", location: "Zenica" },
  { id: 122, name: "Emina S.", category: "upholstery", rating: 4.9, jobs: 67, price: "40 BAM/hr", location: "Sarajevo" }
];

export default function CategoryPage() {
  const params = useParams(); 
  const id = params?.id as string || ""; 

  // FILTER DATA
  const filteredProviders = mockProviders.filter(
    (provider) => provider.category === id
  );

  // Clean up the ID for the title (e.g. "it_support" -> "it support")
  const displayTitle = id ? id.replace('_', ' ') : '';

  return (
    <div className="page-gradient flex flex-col min-h-screen font-sans dark:text-white">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto px-6 py-16 w-full">
        {/* HEADER SECTION */}
        <div className="mb-12">
          <Link href="/services" className="text-sm font-bold uppercase hover:underline mb-4 inline-block border-2 border-black px-4 py-2 rounded-xl bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            ← Back to Categories
          </Link>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mt-4">
            {displayTitle} <span className="text-[#EF9D39]">Pros</span>
          </h1>
          <p className="font-bold text-gray-500 uppercase tracking-widest text-sm mt-2">
            Showing {filteredProviders.length} verified professionals
          </p>
        </div>

        {/* PROVIDERS LIST */}
        <div className="space-y-6">
          {filteredProviders.length > 0 ? (
            filteredProviders.map((pro) => (
              <div 
                key={pro.id} 
                className="bg-white border-[4px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Profile Info */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-[#FFE8D6] border-[3px] border-black rounded-xl flex items-center justify-center font-black text-3xl uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {pro.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">{pro.name}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm font-bold text-gray-600">
                      <span className="flex items-center gap-1 text-[#EF9D39]"><Star size={16} className="fill-current" /> {pro.rating}</span>
                      <span className="flex items-center gap-1"><MapPin size={16} /> {pro.location}</span>
                      <span>{pro.jobs} Jobs</span>
                    </div>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                  <span className="font-black text-xl bg-gray-100 border-2 border-black px-4 py-1 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{pro.price}</span>
                  <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#EF9D39] hover:text-black border-2 border-black transition-colors">
                    View Profile <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border-[4px] border-black p-12 rounded-2xl text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-2xl font-black uppercase mb-2">No pros found</h3>
              <p className="font-bold text-gray-500">We don't have any professionals in this category yet.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}