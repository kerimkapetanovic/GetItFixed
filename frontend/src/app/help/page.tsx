"use client";

import React, { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Search, X, Ticket, Send } from 'lucide-react';

export default function HelpCenter() {
    const softGradient = "linear-gradient(135deg, #FFE8D6 0%, #FFD4B3 100%)";
    const brandColor = "#EF9D39";

    // Modal States
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

    // Quick Actions with target IDs and Modal triggers
    const quickActions = [
        { icon: "🔧", label: "Repairs", targetId: "repairs" },
        { icon: "📱", label: "Devices", targetId: "devices" },
        { icon: "💳", label: "Payments", targetId: "payments" },
        { icon: "🚚", label: "Status", action: () => setIsTrackingModalOpen(true) }
    ];

    // FAQs with matching IDs for smooth scrolling
    const faqs = [
        { id: "status", q: "How do I track my repair status?", a: "You can track your device by entering your order ID in the tracking tab located in your profile dashboard, or by using the Status button above." },
        { id: "repairs", q: "How long does a typical repair take?", a: "Most screen and battery replacements are done within 24 hours. Complex motherboard repairs may take 3-5 business days." },
        { id: "devices", q: "What devices do you fix?", a: "We specialize in smartphones, laptops, and gaming consoles. If it has a power button, we can likely fix it!" },
        { id: "warranty", q: "Is there a warranty on repairs?", a: "Yes! All GetItFixed repairs come with a standard 6-month warranty on parts and labor." },
        { id: "payments", q: "How do payments and pricing work?", a: "We accept all major credit cards and cash. Our escrow system ensures your payment is held securely until you are 100% satisfied with the repair." }
    ];

    // Smooth Scroll Helper
    const scrollToFaq = (id?: string) => {
        if (!id) return;
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Form Submit Handler
    const handleTicketSubmit = (e: React.FormEvent) => {
        e.preventDefault(); 
        alert("Ticket submitted successfully! (This will be connected to the Django API in Phase 4)");
        setIsTicketModalOpen(false); 
    };

    return (
        <div className="flex flex-col min-h-screen font-sans relative" style={{ background: softGradient }}>
            <Header />

            <main className="flex-grow max-w-5xl mx-auto px-6 py-16 w-full">
                
                {/* 1. SEARCH HERO */}
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

                {/* 2. QUICK ACTION BUBBLES */}
                <div className="flex flex-wrap justify-center gap-6 mb-20">
                    {quickActions.map((item, i) => (
                        <button 
                            key={i} 
                            onClick={item.action ? item.action : () => scrollToFaq(item.targetId)} 
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 rounded-2xl group-hover:bg-[#EF9D39] transition-all" />
                            <div className="relative bg-white border-[3px] border-black px-8 py-4 rounded-2xl font-black uppercase flex items-center gap-3 transition-transform group-hover:-translate-y-1">
                                <span className="text-2xl">{item.icon}</span>
                                {item.label}
                            </div>
                        </button>
                    ))}
                </div>

                {/* 3. FAQ ACCORDION */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-black uppercase mb-8 ml-2">Common Questions</h2>
                    {faqs.map((faq, idx) => (
                        <details id={faq.id} key={idx} className="group relative scroll-mt-24">
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

                {/* 4. EMERGENCY BANNER */}
                <div className="mt-24 bg-black text-white p-1 rounded-[40px] rotate-[-1deg] hover:rotate-0 transition-transform cursor-pointer">
                    <div className="border-2 border-dashed border-white/30 rounded-[38px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-2xl font-black uppercase">Still stuck?</h3>
                            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Our technicians are standing by.</p>
                        </div>
                        <button 
                            onClick={() => setIsTicketModalOpen(true)}
                            className="bg-[#EF9D39] text-black px-10 py-4 rounded-2xl font-black uppercase text-sm border-2 border-white hover:scale-105 transition-transform"
                        >
                            Open a Ticket
                        </button>
                    </div>
                </div>
            </main>

            <Footer />

            {/* --- TRACKING MODAL OVERLAY --- */}
            {isTrackingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-white border-[4px] border-black rounded-[32px] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setIsTrackingModalOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-[#EF9D39] border-2 border-black rounded-full transition-colors"
                        >
                            <X size={20} className="text-black" />
                        </button>
                        <div className="text-center mb-8 mt-4">
                            <div className="w-16 h-16 bg-[#EF9D39] border-[4px] border-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <Search size={32} className="text-black" />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Track Job</h2>
                            <p className="font-bold text-gray-500 uppercase text-xs mt-2 tracking-widest">Enter your 6-digit Job ID</p>
                        </div>
                        <div className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="e.g. #GFX-8492" 
                                className="w-full p-4 border-[4px] border-black rounded-xl font-black uppercase text-center text-lg outline-none focus:ring-4 focus:ring-[#EF9D39]/30 transition-all placeholder:text-gray-300"
                            />
                            <button 
                                onClick={() => alert("Backend integration needed to fetch status! (Phase 4)")}
                                className="w-full bg-black text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#EF9D39] hover:text-black border-4 border-black transition-colors"
                            >
                                Locate Repair
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SUPPORT TICKET FORM MODAL --- */}
            {isTicketModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="relative w-full max-w-lg bg-white border-[4px] border-black rounded-[32px] p-6 md:p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200 my-8">
                        
                        <button 
                            onClick={() => setIsTicketModalOpen(false)}
                            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-gray-100 hover:bg-[#EF9D39] border-2 border-black rounded-full transition-colors"
                        >
                            <X size={20} className="text-black" />
                        </button>

                        <div className="text-center mb-6 mt-2">
                            <div className="w-14 h-14 bg-black border-[3px] border-black rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[4px_4px_0px_0px_rgba(239,157,57,1)]">
                                <Ticket size={28} className="text-white" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Support Ticket</h2>
                            <p className="font-bold text-gray-500 uppercase text-[10px] md:text-xs mt-1 tracking-widest">We will reply within 24 hours</p>
                        </div>

                        <form onSubmit={handleTicketSubmit} className="space-y-4 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-black uppercase text-[10px] md:text-xs mb-1 md:mb-2 tracking-widest">Full Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="John Doe" 
                                        className="w-full p-3 md:p-4 border-[3px] md:border-[4px] border-black rounded-xl font-bold outline-none focus:ring-4 focus:ring-[#EF9D39]/30 transition-all placeholder:text-gray-300 text-sm md:text-base"
                                    />
                                </div>
                                <div>
                                    <label className="block font-black uppercase text-[10px] md:text-xs mb-1 md:mb-2 tracking-widest">Email Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        placeholder="john@example.com" 
                                        className="w-full p-3 md:p-4 border-[3px] md:border-[4px] border-black rounded-xl font-bold outline-none focus:ring-4 focus:ring-[#EF9D39]/30 transition-all placeholder:text-gray-300 text-sm md:text-base"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-black uppercase text-[10px] md:text-xs mb-1 md:mb-2 tracking-widest">Issue Category</label>
                                <select className="w-full p-3 md:p-4 border-[3px] md:border-[4px] border-black rounded-xl font-bold outline-none focus:ring-4 focus:ring-[#EF9D39]/30 transition-all bg-white cursor-pointer text-sm md:text-base">
                                    <option>Payment Issue</option>
                                    <option>Report a Provider</option>
                                    <option>Technical Bug</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-black uppercase text-[10px] md:text-xs mb-1 md:mb-2 tracking-widest">Description</label>
                                <textarea 
                                    required
                                    rows={3}
                                    placeholder="Please describe your problem in detail..." 
                                    className="w-full p-3 md:p-4 border-[3px] md:border-[4px] border-black rounded-xl font-bold outline-none focus:ring-4 focus:ring-[#EF9D39]/30 transition-all placeholder:text-gray-300 resize-none text-sm md:text-base"
                                ></textarea>
                            </div>

                            <button 
                                type="submit"
                                className="w-full flex items-center justify-center gap-3 bg-[#EF9D39] text-black p-3 md:p-4 rounded-xl font-black uppercase tracking-widest hover:bg-black hover:text-white border-[3px] md:border-[4px] border-black transition-colors text-sm md:text-base mt-2"
                            >
                                Submit Ticket
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}