"use client";

import React from 'react';
import Header from '@/components/header';
import ChatClient from '../../components/ai-repair/ChatClient';
import Footer from '@/components/footer';

export default function AiRepairPage() {
    const brandColor = "#EF9D39";

    return (
        <div className="page-gradient flex flex-col min-h-screen bg-white dark:bg-[#0f0f0f] text-black dark:text-white">
            <Header />

            <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">

                {/* NASLOV SEKCIJA */}
                <div className="text-center mb-10 p-8 rounded-[24px] border-[1.5px] bg-white border-black dark:bg-[#141414] dark:border-[#222] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 text-black dark:text-[#f0f0f0]">
                        <span style={{ color: brandColor }}>AI</span> REPAIR ASSISTANT
                    </h1>
                    <p className="text-[10px] font-bold uppercase text-gray-400 dark:text-[#444]" style={{ letterSpacing: '0.3em' }}>
                        Describe the issue and get guidance, suggested fixes, or next steps.
                    </p>
                </div>

                {/* CHAT CONTAINER */}
                <section className="relative">
                    <div className="rounded-[24px] overflow-hidden border-[1.5px] border-black dark:border-[#222] bg-white dark:bg-[#141414] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
                        <ChatClient />
                    </div>
                </section>

                {/* FOOTER INFO */}
                <div className="mt-8 text-center flex items-center justify-center gap-2">
                    <span
                        style={{
                            display: 'inline-block',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: brandColor,
                        }}
                    />
                    <p className="text-[9px] font-black uppercase text-gray-400 dark:text-[#333]" style={{ letterSpacing: '0.15em' }}>
                        Powered by GetItFixed AI • Always consult a professional for dangerous repairs
                    </p>
                    <span
                        style={{
                            display: 'inline-block',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: brandColor,
                        }}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}