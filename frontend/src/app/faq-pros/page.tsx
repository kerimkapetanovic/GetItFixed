"use client";

import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Link from 'next/link';

export default function ProviderFaqPage() {
  const brandColor = "#EF9D39";

  const faqs = [
    { q: "How do I join as a provider?", a: <>Click <Link href="/register?role=pro"><span className="underline font-black text-black hover:text-[#EF9D39] transition-colors">Join as a Pro</span></Link> and complete your profile — add your specialties and contact info.</> },
    { q: "Do I need insurance or certifications?", a: "Depending on your service and local regulations you may need licenses or insurance. Always ensure you comply with local laws." },
    { q: "How do I set my prices?", a: "Currently this frontend uses dummy data. In production you will be able to set hourly or fixed prices per service on your provider profile." },
    { q: "How do I get reviews?", a: "Clients can leave reviews after a job is completed. Provide excellent service and request feedback from clients." },
    { q: "Can I cancel a booking?", a: "Cancellation policies will be defined in the booking flow. For now, treat bookings as draft/demo in this frontend." },
    { q: "How do I manage availability?", a: "The final backend will include availability features; for the frontend prototype we focus on UI and flows." }
  ];

  return (
    <div className="page-gradient flex flex-col min-h-screen font-sans text-black">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
        
        {/* 1. HERO SECTION - Usklađen sa TermsPage */}
        <div className="bg-white force-light-surface-text border-[3px] border-black p-8 md:p-12 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-none text-black">
            PROVIDER <span style={{ color: brandColor }}>FAQ</span>
          </h1>
          <p className="inline-block bg-black text-white px-8 py-3 font-black uppercase tracking-[0.2em] text-[12px] rounded-xl shadow-[4px_4px_0px_0px_rgba(239,157,57,0.5)]">
            FOR PROFESSIONALS
          </p>
        </div>

        {/* 2. FAQ CARDS - Smanjeni boxovi i fontovi */}
        <div className="space-y-5">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white force-light-surface-text border-[3px] border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black uppercase text-lg mb-3 tracking-tight">{f.q}</h3>
              <div className="text-[13px] font-medium text-gray-600 leading-relaxed">
                {f.a}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM TIMESTAMP / FOOTER NOTE */}
        <div className="mt-12 flex flex-col items-center">
          <div className="h-1 w-12 bg-black mb-3" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">
            Need more help? Contact us at getitfixed@gmail.com
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}