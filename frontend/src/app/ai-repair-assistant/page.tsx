"use client";

import React from 'react';
import Header from '@/components/header';
import ChatClient from '../../components/ai-repair/ChatClient';
import Footer from '@/components/footer';

export default function AiRepairPage() {
    const brandColor = "#EF9D39";

    return (
        <div className="page-gradient flex flex-col min-h-screen dark:text-white">
            <Header />
            
            <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
                
                {/* NASLOV SEKCIJA SA BIJELIM BOXOM */}
                <div 
                    className="text-center mb-10 p-8 border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                    style={{ borderRadius: '30px' }}
                >
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
                        <span style={{ color: brandColor }}>AI</span> REPAIR ASSISTANT
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
                        Describe the issue and get guidance, suggested fixes, or next steps.
                    </p>
                </div>

                {/* CHAT CONTAINER - Sada prati isti stil kao Stories i Services */}
                <section className="relative">
                    <div 
                        className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden" 
                        style={{ borderRadius: '32px' }}
                    >
                        {/* 
                            Napomena: ChatClient bi unutar sebe trebao imati 
                            transparentnu pozadinu ili pratiti ovaj stil 
                        */}
                        <ChatClient />
                    </div>
                </section>

                {/* DODATNI INFO ISPOD CHATA */}
                <div className="mt-8 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        Powered by GetItFixed AI • Always consult a professional for dangerous repairs
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}