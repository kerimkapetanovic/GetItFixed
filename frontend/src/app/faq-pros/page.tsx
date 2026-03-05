"use client";

import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Link from 'next/link';

export default function ProviderFaqPage() {
  const softGradient = "linear-gradient(135deg, #FFE8D6 0%, #FFD4B3 100%)";
  const brandColor = "#EF9D39";

  const faqs = [
    { q: "How do I join as a provider?", a: <>Click <Link href="/register?role=pro"><span className="underline">Join as a Pro</span></Link> and complete your profile — add your specialties and contact info.</> },
    { q: "Do I need insurance or certifications?", a: "Depending on your service and local regulations you may need licenses or insurance. Always ensure you comply with local laws." },
    { q: "How do I set my prices?", a: "Currently this frontend uses dummy data. In production you will be able to set hourly or fixed prices per service on your provider profile." },
    { q: "How do I get reviews?", a: "Clients can leave reviews after a job is completed. Provide excellent service and request feedback from clients." },
    { q: "Can I cancel a booking?", a: "Cancellation policies will be defined in the booking flow. For now, treat bookings as draft/demo in this frontend." },
    { q: "How do I manage availability?", a: "The final backend will include availability features; for the frontend prototype we focus on UI and flows." }
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans" style={{ background: softGradient }}>
      <Header />

      <main className="flex-grow max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
            PROVIDER <span style={{ color: brandColor }}>FAQ</span>
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Common questions for professionals</p>
        </div>

        <div className="grid gap-6">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white border-2 border-black p-6 rounded-[16px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black uppercase text-sm mb-2">{f.q}</h3>
              <p className="text-sm text-gray-700">{f.a}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}