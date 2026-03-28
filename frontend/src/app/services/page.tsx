"use client";

import React from 'react';
import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";
import {
  Droplets, Lightbulb, PaintBucket, Wrench, ArrowRight, PlusCircle, 
  Car, Waves, Hammer, LayoutGrid, Trash2, Pickaxe, Shield, Sun, Truck, 
  Wind, Monitor, Home, Lock, Sofa, Layout,Tent, Refrigerator, Bug
} from "lucide-react";

export default function Services() {
  const commonRadius = "24px";
  const smallRadius = "12px";
  const brandColor = "#EF9D39";

  const serviceCategories = [
    { id: "plumbing", name: "Plumbing", icon: <Droplets size={24} />, color: "bg-blue-100", desc: "Leaks, pipes & emergency repairs." },
    { id: "electrical", name: "Electrical", icon: <Lightbulb size={24} />, color: "bg-yellow-100", desc: "Wiring, lighting & panel upgrades." },
    { id: "painting", name: "Painting", icon: <PaintBucket size={24} />, color: "bg-green-100", desc: "Interior & exterior wall decor." },
    { id: "mechanic", name: "Auto Mechanic", icon: <Car size={24} />, color: "bg-red-100", desc: "Vehicle diagnostics & maintenance." },
    { id: "pools", name: "Pool Services", icon: <Waves size={24} />, color: "bg-cyan-100", desc: "Cleaning & equipment maintenance." },
    { id: "carpenter", name: "Carpenter", icon: <Hammer size={24} />, color: "bg-orange-100", desc: "Custom woodwork & furniture repair." },
    { id: "tiler", name: "Ceramics & Tiling", icon: <LayoutGrid size={24} />, color: "bg-stone-100", desc: "Floor & wall tile installation." },
    { id: "cleaning", name: "Cleaning", icon: <Trash2 size={24} />, color: "bg-sky-100", desc: "Professional home & office cleaning." },
    { id: "excavation", name: "Excavation", icon: <Pickaxe size={24} />, color: "bg-amber-200", desc: "Groundwork & heavy machinery." },
    { id: "facade", name: "Facade", icon: <Home size={24} />, color: "bg-zinc-100", desc: "Insulation & exterior finishing." },
    { id: "fencing", name: "Fencing", icon: <Shield size={24} />, color: "bg-emerald-100", desc: "Gates, fences & yard security." },
    { id: "flooring", name: "Flooring", icon: <Layout size={24} />, color: "bg-orange-50", desc: "Parquet, laminate & vinyl floors." },
    { id: "renovation", name: "Renovation", icon: <PlusCircle size={24} />, color: "bg-indigo-100", desc: "Complete home makeover experts." },
    { id: "gardener", name: "Gardening", icon: <Sun size={24} />, color: "bg-lime-100", desc: "Landscaping & lawn maintenance." },
    { id: "hvac", name: "HVAC", icon: <Wind size={24} />, color: "bg-blue-50", desc: "Heating & air conditioning systems." },
    { id: "it_support", name: "IT Support", icon: <Monitor size={24} />, color: "bg-slate-100", desc: "Tech solutions & home office setup." },
    { id: "security", name: "Security", icon: <Lock size={24} />, color: "bg-red-50", desc: "Surveillance & alarm systems." },
    { id: "solar", name: "Solar Panels", icon: <Sun size={24} />, color: "bg-yellow-200", desc: "Renewable energy installations." },
    { id: "transport", name: "Transport", icon: <Truck size={24} />, color: "bg-gray-100", desc: "Moving & logistics services." },
    { id: "upholstery", name: "Upholstery", icon: <Sofa size={24} />, color: "bg-pink-100", desc: "Furniture fabric & leather repair." },
    { id: "windows", name: "Windows", icon: <Layout size={24} />, color: "bg-blue-100", desc: "Window & door installations." },
    { id: "roofing", name: "Roofing", icon: <Tent size={24} />, color: "bg-red-200", desc: "Roof leak repairs & new installations." },
    { id: "appliances", name: "Appliances", icon: <Refrigerator size={24} />, color: "bg-teal-100", desc: "Fridge, washer & oven maintenance." },
    { id: "pest_control", name: "Pest Control", icon: <Bug size={24} />, color: "bg-neutral-200", desc: "Safe removal of insects & rodents." }
  ];

  return (
    <div className="page-gradient flex flex-col min-h-screen text-black">
      <Header />
      <main className="flex-grow max-w-6xl mx-auto px-6 py-12 w-full">
        
        {/* NASLOV SEKCIJA SA BIJELIM BOXOM */}
        <div 
          className="text-center mb-12 p-8 border-[3px] border-black bg-white force-light-surface-text shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-3xl mx-auto"
          style={{ borderRadius: '30px' }}
        >
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
            OUR <span style={{ color: brandColor }}>SERVICES</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
            Select a category to find verified professionals for your project.
          </p>
        </div>

        {/* GRID USLUGA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceCategories.map((service) => (
            <div
              key={service.id}
              style={{ borderRadius: commonRadius }}
              className="group border-[3px] border-black p-5 bg-white force-light-surface-text shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  style={{ borderRadius: smallRadius }}
                  className={`w-12 h-12 ${service.color} border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                >
                  {service.icon}
                </div>
                <h2 className="text-base font-black uppercase tracking-tight leading-tight">
                  {service.name}
                </h2>
              </div>
              <p className="text-[11px] font-bold text-gray-500 mb-5 leading-relaxed">
                {service.desc}
              </p>
              <Link
                href={`/services/${service.id}`}
                style={{ borderRadius: "10px" }}
                className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#EF9D39] hover:text-black transition-all border-2 border-black w-full"
              >
                Explore <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}