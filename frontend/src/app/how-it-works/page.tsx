"use client";

import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Link from 'next/link'; 
import { ArrowUpRight } from 'lucide-react';

const steps = [
  { number: "01", title: "Find Your Service", desc: "Browse categories to find exactly what you need fixed." },
  { number: "02", title: "Check Available Pros", desc: "View profiles, ratings, and availability in your area." },
  { number: "03", title: "Describe & Arrange", desc: "Describe the issue and set a time for inspection." },
  { number: "04", title: "Payment & Materials", desc: "Transparent costs for labor and materials before work starts." },
  { number: "05", title: "Confirm & Rate", desc: "Once the job is done, confirm completion and leave a review." }
];

const PremiumButton = ({ href, text, icon: Icon, isExternal = false }: { href: string, text: string, icon: React.ElementType, isExternal?: boolean }) => (
    <Link
      href={href}
      style={{ borderRadius: "20px" }}
      className="flex items-center gap-6 bg-white border-[3px] border-black px-10 py-5 font-black uppercase text-xs tracking-[0.2em] shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-[#EF9D39] transition-all group"
    >
      <span className="text-black">{text}</span>
      <div className="bg-black p-1.5 rounded-full group-hover:bg-white transition-colors flex items-center justify-center">
        <Icon 
          size={18} 
          className={`text-white group-hover:text-black transition-transform ${isExternal ? 'group-hover:rotate-45' : 'group-hover:translate-x-1'}`} 
        />
      </div>
    </Link>
);

const HowItWorks = () => {
  const brandColor = "#EF9D39";

  return (
    <div className="page-gradient flex flex-col min-h-screen text-black">
      <Header />
      
      <main className="flex-grow max-w-3xl mx-auto px-6 py-12 w-full">
        
        {/* NASLOV SEKCIJA SA BIJELIM BOXOM - NOVO */}
        <div 
          className="text-center mb-12 p-8 border-[3px] border-black bg-white force-light-surface-text shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          style={{ borderRadius: '30px' }}
        >
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
            HOW <span style={{ color: brandColor }}>GETITFIXED</span> WORKS
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
            Step-by-step process
          </p>
        </div>

        <div className="relative">
          {steps.map((step, index) => (
            <div key={index} className="relative flex items-center gap-8 mb-6 last:mb-0">
              <div className="flex flex-col items-center flex-shrink-0 relative self-stretch">
                {index !== steps.length - 1 && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-0 h-[calc(100%+1.5rem)] border-l-[3px] border-dotted border-black dark:border-[#EF9D39] z-0"></div>
                )}
                <div 
                  className="w-10 h-10 border-[3px] border-black flex items-center justify-center text-sm font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:border-black  z-10 my-auto"
                  style={{ backgroundColor: brandColor, borderRadius: '50%' }}
                >
                  {step.number}
                </div>
              </div>

              <div 
                className="flex-grow border-[3px] border-black p-5 bg-white force-light-surface-text shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                style={{ borderRadius: '20px' }}
              >
                <h3 className="text-lg font-black uppercase tracking-tight mb-1">
                  {step.title}
                </h3>
                <p className="text-sm font-medium text-gray-500 leading-snug">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA SEKCIJA */}
        <div className="mt-20 flex justify-center">
          <PremiumButton 
            href="/login" 
            text="Start Your Request" 
            icon={ArrowUpRight} 
            isExternal={true}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;