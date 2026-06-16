"use client";

import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function TermsPage() {
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
            content: "Platform Fee and PDV Disclosure: GetItFixed charges a platform fee of 20% on the agreed service price. In addition, PDV (VAT) of 17% is applied to the amount consisting of the service price plus platform fee. By using the platform and confirming a booking, you acknowledge and accept this pricing structure. GetItFixed will always show the full breakdown (service price, platform fee, PDV, and total) before final booking confirmation.",
            list: [
                "Service price = amount agreed between Client and Provider",
                "Platform fee = 20% of service price",
                "PDV = 17% of (service price + platform fee)",
                "Total paid by Client = service price + platform fee + PDV"
            ]
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
        <div className="page-gradient flex flex-col min-h-screen font-sans text-black dark:text-white">
            <Header />

            <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
                
                {/* HERO SECTION */}
                <div className="bg-white dark:bg-[#141414] border-[3px] border-black dark:border-[#222] p-8 md:p-12 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-none mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-none text-black dark:text-[#f0f0f0]">
                        TERMS <span style={{ color: brandColor }}>OF SERVICE</span>
                    </h1>
                    <p className="inline-block bg-black dark:bg-[#EF9D39] text-white dark:text-black px-8 py-3 font-black uppercase tracking-[0.2em] text-[12px] rounded-xl shadow-[4px_4px_0px_0px_rgba(239,157,57,0.5)]">
                        PLEASE READ CAREFULLY
                    </p>
                </div>

                {/* TERMS CONTENT */}
                <div className="space-y-5">
                    {sections.map((s, i) => (
                        <div key={i} className="bg-white dark:bg-[#141414] border-[3px] border-black dark:border-[#222] p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
                            <h3 className="font-black uppercase text-lg mb-3 tracking-tight text-black dark:text-[#f0f0f0]">{s.title}</h3>
                            
                            {s.content && (
                                <p className="text-[13px] font-medium text-gray-600 dark:text-[#888] leading-relaxed">
                                    {s.content}
                                </p>
                            )}
                            
                            {s.list && (
                                <ul className="mt-2 space-y-2">
                                    {s.list.map((li, idx) => (
                                        <li key={idx} className="text-[12px] font-bold text-gray-700 dark:text-[#aaa] flex items-start">
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
                    <div className="h-1 w-12 bg-black dark:bg-[#333] mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-[#555]">
                        Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}