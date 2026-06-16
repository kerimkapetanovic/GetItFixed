"use client";

import React from 'react';
import { Mail, Phone, MessageSquare, MapPin, ArrowRight, ArrowUpRight } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Link from 'next/link';

const PremiumButton = ({ href, text, icon: Icon, isExternal = false }: { href: string, text: string, icon: any, isExternal?: boolean }) => (
    <Link
      href={href}
      style={{ borderRadius: "16px" }}
      className="flex items-center justify-center gap-3 bg-black dark:bg-[#EF9D39] border-[3px] border-black dark:border-[#EF9D39] px-6 py-4 font-black uppercase text-[11px] tracking-[0.1em] shadow-[5px_5px_0px_0px_#000] dark:shadow-none hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-[#EF9D39] dark:hover:bg-white transition-all group w-full"
    >
      <span className="text-white dark:text-black group-hover:text-black">{text}</span>
      <div className="bg-white dark:bg-black p-1 rounded-full group-hover:bg-black dark:group-hover:bg-white transition-colors flex items-center justify-center">
        <Icon 
          size={14} 
          className={`text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-transform ${isExternal ? 'group-hover:rotate-45' : 'group-hover:translate-x-1'}`} 
        />
      </div>
    </Link>
);

export default function ContactPage() {
    const brandColor = "#EF9D39";
    const cardRadius = { borderRadius: '24px' };

    return (
        <div className="page-gradient flex flex-col min-h-screen text-black dark:text-white selection:bg-black selection:text-white font-sans">
            <Header />

            <main className="flex-grow max-w-5xl mx-auto px-6 py-12 w-full">
                
                {/* NASLOV SEKCIJA */}
                <div 
                    className="text-center mb-12 p-8 border-[3px] border-black dark:border-[#222] bg-white dark:bg-[#141414] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-none max-w-3xl mx-auto"
                    style={{ borderRadius: '30px' }}
                >
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 text-black dark:text-[#f0f0f0]">
                        Get in <span style={{ color: brandColor }}>Touch</span>
                    </h1>
                    <p className="text-gray-400 dark:text-[#555] font-bold uppercase text-[10px] tracking-[0.2em]">
                        We usually respond in less than 24 hours.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    
                    <div className="space-y-6">
                        {/* EMAIL KARTICA */}
                        <div 
                            style={cardRadius}
                            className="bg-white dark:bg-[#141414] border-[3px] border-black dark:border-[#222] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-none"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-gray-50 dark:bg-[#1e1e1e] border-2 border-black dark:border-[#333] rounded-xl">
                                    <Mail size={24} strokeWidth={2.5} className="text-black dark:text-[#f0f0f0]" />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase text-lg leading-tight text-black dark:text-[#f0f0f0]">Email Us</h3>
                                    <p className="text-xs font-bold text-gray-400 dark:text-[#555]">getitfixed@gmail.com</p>
                                </div>
                            </div>
                            <div className="w-full">
                                <PremiumButton 
                                    href="mailto:getitfixed@gmail.com?subject=Support%20Request"
                                    text="Send Email" 
                                    icon={ArrowUpRight} 
                                    isExternal={true}
                                />                     
                            </div>       
                        </div>

                        {/* PHONE KARTICA */}
                        <div 
                            style={cardRadius}
                            className="bg-white dark:bg-[#141414] border-[3px] border-black dark:border-[#222] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-none"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-gray-50 dark:bg-[#1e1e1e] border-2 border-black dark:border-[#333] rounded-xl">
                                    <Phone size={24} strokeWidth={2.5} className="text-black dark:text-[#f0f0f0]" />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase text-lg leading-tight text-black dark:text-[#f0f0f0]">Call Support</h3>
                                    <p className="text-xs font-bold text-gray-400 dark:text-[#555]">Mon - Fri, 09:00 - 17:00</p>
                                </div>
                            </div>
                            <div className="w-full">
                                <PremiumButton 
                                    href="tel:+38761123456"
                                    text="+387 61 123 456" 
                                    icon={ArrowUpRight} 
                                    isExternal={true}
                                />
                            </div>
                        </div>
                    </div>

                    {/* DESNA STRANA - LIVE CHAT */}
                    <div 
                        style={{
                            ...cardRadius,
                            background: "linear-gradient(135deg, #EF9D39 0%, #FFD25A 100%)"
                        }}
                        className="border-[3px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-none min-h-[420px] flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]">
                                <MessageSquare size={32} />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter leading-[0.9] mb-4 text-black">
                                Live Chat <br />Coming Soon!
                            </h2>
                            <p className="font-bold text-black/80 text-sm leading-relaxed mb-6">
                                We're working on a real-time chat to connect you with our team and pros even faster. 
                                For now, our AI Assistant is available 24/7.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2 font-black uppercase text-[10px] border-b-2 border-black pb-1 w-fit cursor-pointer hover:gap-4 transition-all text-black">
                           <MapPin size={14} /> Sarajevo, BiH
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}