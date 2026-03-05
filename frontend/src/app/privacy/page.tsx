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
            content: "GetItFixed (\"we,\" \"us,\" \"our,\" or \"Company\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services." 
        },
        { 
            title: "2. Information We Collect", 
            list: [
                "Personal Data: Name, email address, phone number, location", 
                "Service Data: Information about services requested", 
                "Usage Data: How you interact with our website", 
                "Technical Data: IP address, browser type, pages visited"
            ] 
        },
        { 
            title: "3. How We Use Data", 
            list: [
                "To provide and maintain our services", 
                "To process transactions and send related info", 
                "To send marketing and promotional communications", 
                "To respond to your inquiries and support requests",
                "To improve our services and user experience"
            ] 
        },
        { 
            title: "4. Data Security", 
            content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access. However, no method of transmission over the internet is 100% secure." 
        },
        { 
            title: "5. Your Rights", 
            list: [
                "The right to access your personal data", 
                "The right to correct inaccurate data", 
                "The right to delete your data", 
                "The right to withdraw consent"
            ] 
        },
        { 
            title: "6. Contact Us", 
            content: "If you have questions about this Privacy Policy or our privacy practices, please reach out to our team directly." 
        }
    ];

    return (
        <div className="flex flex-col min-h-screen font-sans" style={{ background: softGradient }}>
            <Header />

            <main className="flex-grow max-w-6xl mx-auto px-6 py-16 w-full">
                
                {/* HERO SECTION - Neobrutalist Header */}
                <div className="relative mb-24 mt-10">
                    {/* Main Background Shadow */}
                    <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 rounded-[40px]" />
                    {/* Foreground Header Card */}
                    <div className="relative bg-white border-[4px] border-black p-12 text-center rounded-[40px]">
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                            PRIVACY<br />
                            <span style={{ color: brandColor }} className="italic">POLICY</span>
                        </h1>
                        <div className="mt-6 inline-block bg-black text-white px-8 py-3 font-bold uppercase tracking-widest text-sm">
                            YOUR DATA IS SAFE WITH US
                        </div>
                    </div>
                </div>

                {/* GRID CONTENT - Interactive Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {sections.map((section, idx) => (
                        <div key={idx} className="group relative">
                            {/* THE INTERACTIVE SHADOW: Turns Orange on Hover */}
                            <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 rounded-[30px] transition-all duration-300 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:bg-[#EF9D39]" />
                            
                            {/* THE MAIN CARD */}
                            <div className="relative h-full bg-white border-[4px] border-black p-8 rounded-[30px] flex flex-col">
                                <span className="text-4xl font-black opacity-10 absolute right-6 top-4">0{idx + 1}</span>
                                <h2 className="text-2xl font-black uppercase mb-4 pr-10 leading-tight">
                                    {section.title}
                                </h2>
                                
                                {section.content && (
                                    <p className="text-sm leading-relaxed text-gray-700 flex-grow">
                                        {section.content}
                                    </p>
                                )}
                                
                                {section.list && (
                                    <ul className="space-y-3 mt-2">
                                        {section.list.map((item, i) => (
                                            <li key={i} className="text-sm font-bold flex items-start">
                                                <span 
                                                    className="w-2.5 h-2.5 mt-1 mr-3 rounded-full flex-shrink-0" 
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

                {/* FINAL CONTACT CALLOUT */}
                <div className="mt-20 relative">
                    <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 rounded-[40px]" />
                    <div className="relative bg-white border-[4px] border-black p-10 rounded-[40px] flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-center md:text-left">
                            <h2 className="text-4xl font-black uppercase tracking-tight">Need Clarity?</h2>
                            <p className="font-bold text-gray-400 uppercase tracking-widest text-xs mt-1">
                                We are happy to explain our protocols.
                            </p>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-2">
                            <a 
                                href="mailto:contact@getitfixed.ba" 
                                className="text-xl font-black underline decoration-4 transition-colors hover:text-[#EF9D39]"
                                style={{ textDecorationColor: brandColor }}
                            >
                                contact@getitfixed.ba
                            </a>
                            <p className="font-bold text-lg text-black">+387 63 709 440</p>
                        </div>
                    </div>
                </div>

                {/* BOTTOM TIMESTAMP */}
                <div className="mt-16 flex flex-col items-center">
                    <div className="h-1 w-20 bg-black mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-gray-500">
                        Last Modified: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}