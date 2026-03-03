"use client";

import React from 'react';
import { Mail, Phone, MessageSquare, MapPin, Send, ArrowRight } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function ContactPage() {
    const brandColor = "#EF9D39";
    const softGradient = "linear-gradient(135deg, #FDFBF9 0%, #F5EFE6 100%)";
    const cardRadius = { borderRadius: '24px' };
    const buttonRadius = { borderRadius: '12px' };

    return (
        <div 
            className="flex flex-col min-h-screen text-black selection:bg-black selection:text-white font-sans" 
            style={{ background: softGradient }}
        >
            <Header />

            <main className="flex-grow max-w-5xl mx-auto px-6 py-10 w-full">
                
                {/* NASLOV SEKCIJA */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
                        Get in <span style={{ color: brandColor }}>Touch</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                        We usually respond in less than 24 hours.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    
                    <div className="space-y-6">
                        {/* EMAIL KARTICA - Izbačena plava, dodat brandColor stil */}
                        <div 
                            style={cardRadius}
                            className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group"
                        >
                            <div className="flex items-center gap-4 mb-5">
                                <div className="p-3 bg-gray-50 border-2 border-black rounded-xl group-hover:bg-[#EF9D39]/10 transition-colors">
                                    <Mail size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase text-lg leading-tight">Email Us</h3>
                                    <p className="text-xs font-bold text-gray-400">getitfixed@gmail.com</p>
                                </div>
                            </div>
                            
                            <a 
                                href="mailto:getitfixed@gmail.com?subject=Support%20Request"
                                style={buttonRadius}
                                className="w-full bg-black text-white py-3.5 flex items-center justify-center gap-2 font-black uppercase tracking-wider text-xs hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_#EF9D39] active:translate-y-1"
                            >
                                Send Email <Send size={14} />
                            </a>
                        </div>

                        {/* PHONE KARTICA - Izbačena zelena, usklađen stil */}
                        <div 
                            style={cardRadius}
                            className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group"
                        >
                            <div className="flex items-center gap-4 mb-5">
                                <div className="p-3 bg-gray-50 border-2 border-black rounded-xl group-hover:bg-[#EF9D39]/10 transition-colors">
                                    <Phone size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase text-lg leading-tight">Call Support</h3>
                                    <p className="text-xs font-bold text-gray-400">Mon - Fri, 09:00 - 17:00</p>
                                </div>
                            </div>

                            <a 
                                href="tel:+38761123456"
                                style={buttonRadius}
                                className="w-full bg-white border-2 border-black py-3.5 flex items-center justify-center gap-2 font-black uppercase tracking-wider text-xs hover:bg-orange-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1"
                            >
                                +387 61 123 456 <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>

                    {/* DESNA STRANA - LIVE CHAT SA LINEAR GRADIENTOM */}
                    <div 
                        style={{
                            ...cardRadius,
                            background: "linear-gradient(135deg, #EF9D39 0%, #FFD25A 100%)"
                        }}
                        className="border-[3px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[380px] flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]">
                                <MessageSquare size={32} />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter leading-[0.9] mb-4">
                                Live Chat <br />Coming Soon!
                            </h2>
                            <p className="font-bold text-black/80 text-sm leading-relaxed mb-6">
                                We're working on a real-time chat to connect you with our team and pros even faster. 
                                For now, our AI Assistant is available 24/7.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2 font-black uppercase text-[10px] border-b-2 border-black pb-1 w-fit cursor-pointer hover:gap-4 transition-all">
                           <MapPin size={14} /> Sarajevo, BiH
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}