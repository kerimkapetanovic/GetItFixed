"use client";

import React, { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function HelpCenter() {
    const softGradient = "linear-gradient(135deg, #FFE8D6 0%, #FFD4B3 100%)";
    const brandColor = "#EF9D39";

    // Common categories for quick access
    const quickActions = [
        { icon: "🔧", label: "Repairs" },
        { icon: "📱", label: "Devices" },
        { icon: "💳", label: "Payments" },
        { icon: "🚚", label: "Status" }
    ];

    const faqs = [
        { q: "How do I track my repair status?", a: "You can track your device by entering your order ID in the tracking tab located in your profile dashboard." },
        { q: "What devices do you fix?", a: "We specialize in smartphones, laptops, and gaming consoles. If it has a power button, we can likely fix it!" },
        { q: "How long does a typical repair take?", a: "Most screen and battery replacements are done within 24 hours. Complex motherboard repairs may take 3-5 business days." },
        { q: "Is there a warranty on repairs?", a: "Yes! All GetItFixed repairs come with a standard 6-month warranty on parts and labor." }
    ];

    return (
        <div className="flex flex-col min-h-screen font-sans" style={{ background: softGradient }}>
            <Header />

            <main className="flex-grow max-w-5xl mx-auto px-6 py-16 w-full">
                
                {/* 1. SEARCH HERO - Different from Privacy Header */}
                <div className="bg-white border-[4px] border-black p-10 md:p-16 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-16 text-center">
                    <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6">
                        How can we <span style={{ color: brandColor }}>Help?</span>
                    </h1>
                    <div className="relative max-w-2xl mx-auto">
                        <input 
                            type="text" 
                            placeholder="Search for a problem..." 
                            className="w-full p-5 border-[4px] border-black rounded-2xl font-bold text-lg outline-none focus:ring-4 focus:ring-[#EF9D39]/30 transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-black text-white px-4 py-2 rounded-xl font-black cursor-pointer hover:bg-[#EF9D39] transition-colors">
                            GO
                        </div>
                    </div>
                </div>

                {/* 2. QUICK ACTION BUBBLES - Something new! */}
                <div className="flex flex-wrap justify-center gap-6 mb-20">
                    {quickActions.map((action, i) => (
                        <button key={i} className="group relative">
                            <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 rounded-2xl group-hover:bg-[#EF9D39] transition-all" />
                            <div className="relative bg-white border-[3px] border-black px-8 py-4 rounded-2xl font-black uppercase flex items-center gap-3 transition-transform group-hover:-translate-y-1">
                                <span className="text-2xl">{action.icon}</span>
                                {action.label}
                            </div>
                        </button>
                    ))}
                </div>

                {/* 3. FAQ ACCORDION - Structured and clean */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-black uppercase mb-8 ml-2">Common Questions</h2>
                    {faqs.map((faq, idx) => (
                        <details key={idx} className="group relative">
                            <summary className="list-none cursor-pointer relative z-10 bg-white border-[4px] border-black p-6 rounded-2xl font-black text-xl flex justify-between items-center transition-all group-open:mb-2 hover:bg-[#FFF9F4]">
                                {faq.q}
                                <span className="text-3xl transition-transform group-open:rotate-45">+</span>
                            </summary>
                            <div className="bg-white border-[4px] border-black p-8 rounded-2xl mt-[-10px] pt-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <p className="font-medium text-gray-700 leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        </details>
                    ))}
                </div>

                {/* 4. EMERGENCY BANNER - Visual variety */}
                <div className="mt-24 bg-black text-white p-1 rounded-[40px] rotate-[-1deg] hover:rotate-0 transition-transform cursor-pointer">
                    <div className="border-2 border-dashed border-white/30 rounded-[38px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-2xl font-black uppercase">Still stuck?</h3>
                            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Our technicians are standing by.</p>
                        </div>
                        <button className="bg-[#EF9D39] text-black px-10 py-4 rounded-2xl font-black uppercase text-sm border-2 border-white hover:scale-105 transition-transform">
                            Open a Ticket
                        </button>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}