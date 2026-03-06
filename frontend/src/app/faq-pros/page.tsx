"use client";

import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Link from 'next/link';

export default function ProviderFaqPage() {
  const softGradient = "linear-gradient(135deg, #FFE8D6 0%, #FFD4B3 100%)";
  const brandColor = "#EF9D39";

  const faqs = [
    { q: "How do I join as a provider?", a: <>Click <Link href="/register?role=pro"><span className="underline font-bold text-black hover:text-[#EF9D39] transition-colors">Join as a Pro</span></Link> and complete your profile — add your specialties and contact info.</> },
    { q: "Do I need insurance or certifications?", a: "Depending on your service and local regulations you may need licenses or insurance. Always ensure you comply with local laws." },
    { q: "How do I set my prices?", a: "Currently this frontend uses dummy data. In production you will be able to set hourly or fixed prices per service on your provider profile." },
    { q: "How do I get reviews?", a: "Clients can leave reviews after a job is completed. Provide excellent service and request feedback from clients." },
    { q: "Can I cancel a booking?", a: "Cancellation policies will be defined in the booking flow. For now, treat bookings as draft/demo in this frontend." },
    { q: "How do I manage availability?", a: "The final backend will include availability features; for the frontend prototype we focus on UI and flows." }
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans" style={{ background: softGradient }}>
      <Header />

      {/* MATCHED WIDTH: Changed max-w-6xl to max-w-5xl */}
      <main className="flex-grow max-w-5xl mx-auto px-6 py-16 w-full">
        
        {/* 1. HERO SECTION (Upgraded to the thick-bordered box style) */}
        <div className="bg-white border-[4px] border-black p-10 md:p-16 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6">
            PROVIDER <span style={{ color: brandColor }}>FAQ</span>
          </h1>
          <p className="inline-block bg-black text-white px-8 py-3 font-bold uppercase tracking-widest text-sm rounded-xl">
            FOR PROFESSIONALS
          </p>
        </div>

        {/* 2. FAQ CARDS (Upgraded borders, padding, and text sizing) */}
        <div className="space-y-6">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white border-[4px] border-black p-8 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black uppercase text-xl mb-4">{f.q}</h3>
              <p className="font-medium text-gray-700 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}