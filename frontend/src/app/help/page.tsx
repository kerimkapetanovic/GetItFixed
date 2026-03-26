"use client";

import React, { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Search, X, Ticket, Send } from 'lucide-react';

export default function HelpCenter() {
    const brandColor = "#EF9D39";

    // Modal States
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

    const quickActions = [
        { icon: "🔧", label: "Repairs", targetId: "repairs" },
        { icon: "📱", label: "Devices", targetId: "devices" },
        { icon: "💳", label: "Payments", targetId: "payments" },
        { icon: "🚚", label: "Status", action: () => setIsTrackingModalOpen(true) }
    ];

    const faqs = [
        { id: "status", q: "How do I track my repair status?", a: "You can track your device by entering your order ID in the tracking tab located in your profile dashboard, or by using the Status button above." },
        { id: "repairs", q: "How long does a typical repair take?", a: "Most screen and battery replacements are done within 24 hours. Complex motherboard repairs may take 3-5 business days." },
        { id: "devices", q: "What devices do you fix?", a: "We specialize in smartphones, laptops, and gaming consoles. If it has a power button, we can likely fix it!" },
        { id: "warranty", q: "Is there a warranty on repairs?", a: "Yes! All GetItFixed repairs come with a standard 6-month warranty on parts and labor." },
        { id: "payments", q: "How do payments and pricing work?", a: "We accept all major credit cards and cash. Our escrow system ensures your payment is held securely until you are 100% satisfied with the repair." }
    ];

    const scrollToFaq = (id?: string) => {
        if (!id) return;
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleTicketSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Ticket submitted successfully! Our team will contact you soon.");
        setIsTicketModalOpen(false);
    };

    return (
        <div className="page-gradient flex flex-col min-h-screen font-sans relative dark:text-white">
            <Header />

            <main className="flex-grow max-w-3xl mx-auto px-6 py-12 w-full">
                
                {/* 1. SEARCH BOX HERO */}
                <div 
                    className="text-center mb-10 p-8 border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                    style={{ borderRadius: '30px' }}
                >
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-black">
                        How can we <span style={{ color: brandColor }}>Help?</span>
                    </h1>
                    <div className="relative max-w-md mx-auto">
                        <input 
                            type="text" 
                            placeholder="Search problems..." 
                            className="w-full p-3 border-[3px] border-black rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#EF9D39]/30 transition-all placeholder:text-gray-400"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white px-3 py-1 rounded-lg font-black text-[10px] cursor-pointer hover:bg-[#EF9D39] hover:text-black transition-colors">
                            GO
                        </div>
                    </div>
                </div>

                {/* 2. QUICK ACTIONS */}
                <div className="flex flex-wrap justify-center gap-4 mb-14">
                    {quickActions.map((item, i) => (
                        <button 
                            key={i} 
                            onClick={item.action ? item.action : () => scrollToFaq(item.targetId)} 
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-black translate-x-1.5 translate-y-1.5 rounded-xl group-hover:bg-[#EF9D39] transition-all" />
                            <div className="relative bg-white border-[3px] border-black px-6 py-3.5 rounded-xl font-black uppercase text-[12px] tracking-wider flex items-center gap-3 transition-transform group-hover:-translate-y-0.5">
                                <span className="text-xl">{item.icon}</span>
                                {item.label}
                            </div>
                        </button>
                    ))}
                </div>

                {/* 3. FAQ ACCORDION */}
                <div className="space-y-5">
                    <h2 className="text-2xl font-black uppercase mb-6 ml-2 tracking-tight">Common Questions</h2>
                    {faqs.map((faq, idx) => (
                        <details id={faq.id} key={idx} className="group relative scroll-mt-24">
                            <summary className="list-none cursor-pointer relative z-10 bg-white border-[3px] border-black p-6 rounded-2xl font-black text-base flex justify-between items-center transition-all group-open:mb-2 hover:bg-[#FFF9F4]">
                                {faq.q}
                                <span className="text-2xl transition-transform group-open:rotate-45 text-[#EF9D39]">+</span>
                            </summary>
                            <div className="bg-white border-[3px] border-black p-7 rounded-2xl mt-[-10px] pt-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <p className="text-sm font-bold text-gray-600 leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        </details>
                    ))}
                </div>

                {/* 4. EMERGENCY BANNER */}
                <div className="mt-20 bg-black text-white p-1 rounded-[32px] rotate-[-0.5deg] hover:rotate-0 transition-transform cursor-pointer shadow-[8px_8px_0px_0px_rgba(239,157,57,0.3)]">
                    <div className="border-[2px] border-dashed border-white/40 rounded-[28px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-black uppercase tracking-tight">Still stuck?</h3>
                            <p className="text-gray-400 font-bold uppercase text-[11px] tracking-[0.2em] mt-1">Our technicians are standing by.</p>
                        </div>
                        <button 
                            onClick={() => setIsTicketModalOpen(true)}
                            className="bg-[#EF9D39] text-black px-10 py-4 rounded-2xl font-black uppercase text-[12px] tracking-widest border-2 border-white hover:bg-white hover:scale-105 transition-all"
                        >
                            Open a Ticket
                        </button>
                    </div>
                </div>
            </main>

            <Footer />

            {/* --- TRACKING MODAL --- */}
            {isTrackingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm bg-white border-[3px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" style={{ borderRadius: '28px' }}>
                        <button onClick={() => setIsTrackingModalOpen(false)} className="absolute top-5 right-5 p-1.5 bg-gray-100 border-2 border-black rounded-full hover:bg-[#EF9D39] transition-colors">
                            <X size={18} />
                        </button>
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 bg-[#EF9D39] border-[3px] border-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_0px_#000]">
                                <Search size={26} />
                            </div>
                            <h2 className="text-2xl font-black uppercase">Track Job</h2>
                            <p className="font-bold text-gray-400 uppercase text-[9px] tracking-widest mt-1">Enter your 6-digit repair ID</p>
                        </div>
                        <div className="space-y-3">
                            <input type="text" placeholder="#GFX-0000" className="w-full p-4 border-[3px] border-black rounded-xl font-black text-center text-base uppercase outline-none focus:ring-4 focus:ring-[#EF9D39]/20 transition-all placeholder:text-gray-400" />
                            <button className="w-full bg-black text-white p-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#EF9D39] hover:text-black border-2 border-black transition-all">Locate Repair</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SUPPORT TICKET FORM MODAL --- */}
            {isTicketModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="relative w-full max-w-lg bg-white border-[3px] border-black p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] my-8" style={{ borderRadius: '28px' }}>
                        <button onClick={() => setIsTicketModalOpen(false)} className="absolute top-4 right-4 p-1.5 bg-gray-100 border-2 border-black rounded-full hover:bg-[#EF9D39] transition-colors">
                            <X size={18} />
                        </button>
                        <div className="text-center mb-6 mt-2">
                            <div className="w-14 h-14 bg-black border-[3px] border-black rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[4px_4px_0px_0px_#EF9D39]">
                                <Ticket size={28} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Support Ticket</h2>
                            <p className="font-bold text-gray-500 uppercase text-[10px] mt-1 tracking-widest">We will reply within 24 hours</p>
                        </div>
                        <form onSubmit={handleTicketSubmit} className="space-y-4 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-black uppercase text-[10px] mb-1.5 tracking-widest ml-1">Full Name</label>
                                    <input required type="text" placeholder="John Doe" className="w-full p-3 border-[3px] border-black rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#EF9D39]/30 transition-all placeholder:text-gray-400" />
                                </div>
                                <div>
                                    <label className="block font-black uppercase text-[10px] mb-1.5 tracking-widest ml-1">Email Address</label>
                                    <input required type="email" placeholder="john@example.com" className="w-full p-3 border-[3px] border-black rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#EF9D39]/30 transition-all placeholder:text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block font-black uppercase text-[10px] mb-1.5 tracking-widest ml-1">Issue Category</label>
                                <select className="w-full p-3 border-[3px] border-black rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#EF9D39]/30 transition-all bg-white cursor-pointer">
                                    <option>Payment Issue</option>
                                    <option>Report a Provider</option>
                                    <option>Technical Bug</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-black uppercase text-[10px] mb-1.5 tracking-widest ml-1">Description</label>
                                <textarea required rows={3} placeholder="Please describe your problem..." className="w-full p-3 border-[3px] border-black rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#EF9D39]/30 transition-all placeholder:text-gray-400 resize-none"></textarea>
                            </div>
                            <button type="submit" className="w-full flex items-center justify-center gap-3 bg-[#EF9D39] text-black p-4 rounded-xl font-black uppercase tracking-widest hover:bg-black hover:text-white border-[3px] border-black transition-all text-xs mt-2">
                                Submit Ticket <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}