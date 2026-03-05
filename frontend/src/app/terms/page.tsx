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

      <main className="flex-grow max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 rounded-[32px]" />
          <div className="relative bg-white border-[4px] border-black p-10 text-center rounded-[32px]">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              TERMS<br />
              <span style={{ color: brandColor }} className="italic">OF SERVICE</span>
            </h1>
            <p className="mt-6 inline-block bg-black text-white px-8 py-3 font-bold uppercase tracking-widest text-sm">
              PLEASE READ CAREFULLY
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          {sections.map((s, i) => (
            <div key={i} className="bg-white border-2 border-black p-6 rounded-[20px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black uppercase text-lg mb-3">{s.title}</h3>
              {s.content && <p className="text-sm text-gray-700">{s.content}</p>}
              {s.list && (
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
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