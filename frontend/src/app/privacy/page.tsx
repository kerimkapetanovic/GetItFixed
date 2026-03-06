"use client";

import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function PrivacyPage() {
    const softGradient = "linear-gradient(135deg, #FFE8D6 0%, #FFD4B3 100%)";
    const brandColor = "#EF9D39";

    const sections = [
        { 
            title: "1. Introduction", 
            content: "GetItFixed (\"we,\" \"us,\" or \"our\") is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your info when you use our platform." 
        },
        { 
            title: "2. Information Collected", 
            list: [
                "Personal: Name, email, phone, location", 
                "Services: History of requested repairs", 
                "Usage: Interactions with our website", 
                "Technical: IP address and browser type"
            ] 
        },
        { 
            title: "3. How We Use Data", 
            list: [
                "To maintain and provide our services", 
                "To process secure transactions", 
                "To send important service updates", 
                "To improve user experience & support"
            ] 
        },
        { 
            title: "4. Data Security", 
            content: "We use professional-grade technical measures to protect your data. While no system is 100% secure, we prioritize your safety above all else." 
        },
        { 
            title: "5. Your Rights", 
            list: [
                "Right to access your personal data", 
                "Right to correct inaccurate info", 
                "Right to request data deletion", 
                "Right to withdraw consent at any time"
            ] 
        },
        { 
            title: "6. Contact Us", 
            content: "Have questions about your privacy? Our team is available to clarify any protocols regarding your personal information." 
        }
    ];

    return (
        <div className="flex flex-col min-h-screen font-sans" style={{ background: softGradient }}>
            <Header />

            <main className="flex-grow max-w-5xl mx-auto px-6 py-12 w-full">
                
                {/* HERO SECTION - Smanjen i kompaktniji */}
                <div className="relative mb-16 mt-6">
                    <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 rounded-[32px]" />
                    <div className="relative bg-white border-[3px] border-black p-10 text-center rounded-[32px]">
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-black">
                            PRIVACY <span style={{ color: brandColor }} className="italic">POLICY</span>
                        </h1>
                        <div className="mt-4 inline-block bg-black text-white px-5 py-2 font-black uppercase tracking-widest text-[10px]">
                            YOUR DATA IS SAFE WITH US
                        </div>
                    </div>
                </div>

                {/* GRID CONTENT - Manji fontovi i kompaktnije kartice */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sections.map((section, idx) => (
                        <div key={idx} className="group relative">
                            <div className="absolute inset-0 bg-black translate-x-1.5 translate-y-1.5 rounded-[24px] transition-all duration-300 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:bg-[#EF9D39]" />
                            
                            <div className="relative h-full bg-white border-[3px] border-black p-6 rounded-[24px] flex flex-col">
                                <span className="text-2xl font-black opacity-10 absolute right-5 top-4">0{idx + 1}</span>
                                <h2 className="text-lg font-black uppercase mb-3 pr-8 leading-tight">
                                    {section.title}
                                </h2>
                                
                                {section.content && (
                                    <p className="text-[13px] leading-relaxed font-medium text-gray-600 flex-grow">
                                        {section.content}
                                    </p>
                                )}
                                
                                {section.list && (
                                    <ul className="space-y-2.5 mt-1">
                                        {section.list.map((item, i) => (
                                            <li key={i} className="text-[12px] font-bold flex items-start text-gray-700">
                                                <span 
                                                    className="w-2 h-2 mt-1 mr-2.5 rounded-full flex-shrink-0" 
                                                    style={{ backgroundColor: brandColor }} 
                                                />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* FINAL CONTACT CALLOUT - Ažurirani podaci */}
                <div className="mt-16 relative">
                    <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 rounded-[32px]" />
                    <div className="relative bg-white border-[3px] border-black p-8 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-black uppercase tracking-tight">Need Clarity?</h2>
                            <p className="font-bold text-gray-400 uppercase tracking-widest text-[10px] mt-1">
                                We are happy to explain our protocols.
                            </p>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-1">
                            <a 
                                href="mailto:getitfixed@gmail.com" 
                                className="text-lg font-black  decoration-4 transition-colors hover:text-[#EF9D39]"
                                style={{ textDecorationColor: brandColor }}
                            >
                                getitfixed@gmail.com
                            </a>
                            <a href="tel:+38761123456" className="font-black text-base text-black hover:text-[#EF9D39]" style={{ textDecorationColor: brandColor }}>+387 61 123 456</a>
                        </div>
                    </div>
                </div>

                {/* BOTTOM TIMESTAMP */}
                <div className="mt-12 flex flex-col items-center">
                    <div className="h-1 w-12 bg-black mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                        Last Modified: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}