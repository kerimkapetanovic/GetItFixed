"use client";

import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function TermsPage() {
    const softGradient = "linear-gradient(135deg, #FFE8D6 0%, #FFD4B3 100%)";
    const brandColor = "#EF9D39";

    const sections = [
        {
            title: "1. Acceptance of Terms",
            content: "By accessing or using GetItFixed you agree to be bound by these Terms of Service. If you do not agree, please do not use our services."
        },
        {
            title: "2. Provider Responsibilities",
            list: [
                "Provide truthful profile details and valid qualifications",
                "Deliver services professionally and in a timely manner",
                "Comply with all local laws and licensing requirements"
            ]
        },
        {
            title: "3. Payments & Fees",
            content: "Payment terms are set between clients and providers. GetItFixed may collect a platform fee when the backend is implemented. Currently, this is a frontend prototype."
        },
        {
            title: "4. Cancellations & Refunds",
            content: "Cancellation policies should be agreed between the provider and client at booking time."
        },
        {
            title: "5. User Conduct",
            list: [
                "No abusive or illegal behavior",
                "Respect other users' property and privacy",
                "No fraudulent activity"
            ]
        },
        {
            title: "6. Liability",
            content: "GetItFixed is a platform connecting clients and providers. We are not responsible for the actions of providers or the quality of services delivered."
        }
    ];

    return (
        <div className="flex flex-col min-h-screen font-sans" style={{ background: softGradient }}>
            <Header />

            <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
                
                {/* 1. HERO SECTION - Compact Style */}
                <div className="bg-white border-[3px] border-black p-8 md:p-12 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-12 text-center">
                    {/* Italic uklonjen ovdje */}
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-none text-black">
                        TERMS <span style={{ color: brandColor }}>OF SERVICE</span>
                    </h1>
                    {/* Povećan "PLEASE READ CAREFULLY" */}
                    <p className="inline-block bg-black text-white px-8 py-3 font-black uppercase tracking-[0.2em] text-[12px] rounded-xl shadow-[4px_4px_0px_0px_rgba(239,157,57,0.5)]">
                        PLEASE READ CAREFULLY
                    </p>
                </div>

                {/* 2. TERMS CONTENT - Smaller fonts & tighter spacing */}
                <div className="space-y-5">
                    {sections.map((s, i) => (
                        <div key={i} className="bg-white border-[3px] border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="font-black uppercase text-lg mb-3 tracking-tight">{s.title}</h3>
                            
                            {s.content && (
                                <p className="text-[13px] font-medium text-gray-600 leading-relaxed">
                                    {s.content}
                                </p>
                            )}
                            
                            {s.list && (
                                <ul className="mt-2 space-y-2">
                                    {s.list.map((li, idx) => (
                                        <li key={idx} className="text-[12px] font-bold text-gray-700 flex items-start">
                                            <span className="mr-2 text-[#EF9D39]">•</span>
                                            {li}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>

                {/* BOTTOM TIMESTAMP */}
                <div className="mt-12 flex flex-col items-center">
                    <div className="h-1 w-12 bg-black mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                        Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}