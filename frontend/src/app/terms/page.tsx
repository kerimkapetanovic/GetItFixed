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
      content: "Payment terms are set between clients and providers. GetItFixed may collect a platform fee or processing fee when the backend is implemented. For now, this site is a frontend prototype."
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
      content: "GetItFixed is a platform connecting clients and providers. We are not responsible for the actions of providers or the quality of services delivered. This is a frontend prototype."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans" style={{ background: softGradient }}>
      <Header />

      {/* Changed max-w-6xl to max-w-5xl */}
      <main className="flex-grow max-w-5xl mx-auto px-6 py-16 w-full">
        
        {/* 1. HERO SECTION (Updated to match Help Center search box style) */}
        <div className="bg-white border-[4px] border-black p-10 md:p-16 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6">
            TERMS <span style={{ color: brandColor }}>OF SERVICE</span>
          </h1>
          <p className="inline-block bg-black text-white px-8 py-3 font-bold uppercase tracking-widest text-sm rounded-xl">
            PLEASE READ CAREFULLY
          </p>
        </div>

        {/* 2. TERMS CONTENT (Updated to match FAQ styling) */}
        <div className="space-y-6">
          {sections.map((s, i) => (
            <div key={i} className="bg-white border-[4px] border-black p-8 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black uppercase text-xl mb-4">{s.title}</h3>
              
              {s.content && (
                <p className="font-medium text-gray-700 leading-relaxed">
                  {s.content}
                </p>
              )}
              
              {s.list && (
                <ul className="list-disc list-inside font-medium text-gray-700 leading-relaxed mt-2 space-y-2">
                  {s.list.map((li, idx) => <li key={idx}>{li}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}