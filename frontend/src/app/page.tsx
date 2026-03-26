"use client";

import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';
import { 
  Search, 
  Zap, 
  ShieldCheck, 
  PenTool, 
  ArrowUpRight,
  CheckCircle2, 
  MapPin,
  Droplets,
  Lightbulb,
  PaintBucket,
  Wrench,
  ClipboardList,
  Users
} from "lucide-react";

type PremiumButtonProps = {
  href: string;
  text: string;
  icon: React.ElementType;
  isExternal?: boolean;
};

function PremiumButton({ href, text, icon: Icon, isExternal = false }: PremiumButtonProps) {
  return (
    <Link
      href={href}
      style={{ borderRadius: "20px" }}
      className="flex items-center gap-6 bg-white dark:bg-zinc-900 border-[3px] border-black px-10 py-5 font-black uppercase text-xs tracking-[0.2em] shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-[#EF9D39] dark:hover:bg-[#EF9D39] transition-all group"
    >
      <span>{text}</span>
      <div className="bg-black p-1.5 rounded-full group-hover:bg-white transition-colors">
        <Icon
          size={18}
          className={`text-white group-hover:text-black transition-transform ${isExternal ? 'group-hover:rotate-45' : 'group-hover:translate-x-1'}`}
        />
      </div>
    </Link>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const brandColor = "#EF9D39";
  const commonRadius = "24px";
  const smallRadius = "14px";

  return (
    <div className="page-gradient flex flex-col min-h-screen text-black dark:text-white selection:bg-black selection:text-white font-sans">
      <Header />
      
      <main className="flex-grow">
        
        {/* 1. HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div 
                className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-600 px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-[10px] uppercase tracking-[0.2em]"
                style={{ borderRadius: "100px" }}
              >
                <MapPin size={12} style={{ color: brandColor }} />
                <span>{t('home.verified')}</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-[0.9]">
                {t('home.heroTitleStart')} <span style={{ color: brandColor }}>{t('home.heroTitleAccent')}</span> <br />
                {t('home.heroTitleEnd')}
              </h1>

              <p className="text-lg font-bold text-gray-400 max-w-lg leading-relaxed italic  mx-auto lg:mx-0">
                {t('home.heroDescription')}
              </p>

              <div 
                className="w-full max-w-xl mx-auto lg:mx-0 flex flex-col md:flex-row shadow-[8px_8px_0px_0px_#000] border-[3px] border-black overflow-hidden bg-white dark:bg-zinc-900" 
                style={{ borderRadius: "20px" }}
              >
                <div className="flex-1 flex items-center px-6 py-4">
                  <Search className="mr-3 text-gray-300" size={20} />
                  <input 
                    type="text" 
                    placeholder={t('home.searchPlaceholder')} 
              className="w-full outline-none font-bold uppercase text-xs placeholder:text-gray-300 dark:placeholder:text-zinc-500 bg-transparent dark:text-white" 
                  />
                </div>
                <button 
                  style={{ backgroundColor: brandColor }} 
                  className="text-black px-8 py-4 font-black uppercase border-l-[3px] border-black hover:bg-black hover:text-white transition-all tracking-widest text-xs"
                >
                  {t('home.findHelp')}
                </button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: brandColor }}></div>
              <div className="relative bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl border-[3px] border-black p-8 shadow-[15px_15px_0px_0px_#000]" style={{ borderRadius: "40px" }}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black uppercase italic tracking-tighter text-xl">{t('home.recentFixes')}</h3>
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { service: t('home.plumbing'), name: 'Amel K.', status: t('home.completed') },
                    { service: t('home.electrical'), name: 'Mirza S.', status: t('home.onTheWay') }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-white dark:bg-zinc-800 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]" style={{ borderRadius: "20px" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black flex items-center justify-center text-white" style={{ borderRadius: "12px" }}>
                          <CheckCircle2 size={18} style={{ color: brandColor }} />
                        </div>
                        <div>
                          <p className="font-black text-xs uppercase">{item.service}</p>
                          <p className="text-[10px] font-bold text-gray-400">{item.name}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase bg-gray-100 px-3 py-1 rounded-full">{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. TRUST BADGES */}
        <section className="max-w-7xl mx-auto px-6 pb-24 text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Zap />, title: t('home.fastResponse'), desc: t('home.fastResponseDesc') },
              { icon: <ShieldCheck />, title: t('home.verifiedPros'), desc: t('home.verifiedProsDesc') },
              { icon: <PenTool />, title: t('home.fixedPrices'), desc: t('home.fixedPricesDesc') },
            ].map((badge, i) => (
              <div key={i} className="group border-[3px] border-black p-8 bg-white dark:bg-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all" style={{ borderRadius: "25px" }}>
                <div className="mb-4 scale-110 flex justify-center md:justify-start" style={{ color: brandColor }}>{badge.icon}</div>
                <h4 className="font-black uppercase text-lg mb-2 italic">{badge.title}</h4>
                <p className="text-xs font-bold text-gray-400 leading-relaxed">{badge.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. POPULAR SERVICES */}
        <section className="bg-white dark:bg-zinc-900 border-y-[3px] border-black dark:border-zinc-700 py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-4xl font-black uppercase tracking-tighter italic">{t('home.popularServices')}</h2>
              <p className="font-bold text-gray-400 uppercase text-xs mt-2 tracking-widest">{t('home.mostRequested')}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {[
                // Added the 'id' property so the Link knows where to go
                { id: "plumbing", name: t('home.plumbing'), icon: <Droplets />, color: "bg-blue-50" },
                { id: "electrical", name: t('home.electrical'), icon: <Lightbulb />, color: "bg-orange-50" },
                { id: "painting", name: t('home.painting'), icon: <PaintBucket />, color: "bg-green-50" },
                { id: "handyman", name: t('home.handyman'), icon: <Wrench />, color: "bg-gray-50" },
              ].map((service) => (
                <Link 
                  href={`/services/${service.id}`} // Changed this from a div to a Link!
                  key={service.name} 
                  style={{ borderRadius: commonRadius }} 
                  className="group block cursor-pointer border-[3px] border-black p-8 bg-[#FDFBF9] dark:bg-zinc-800 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[5px] hover:translate-y-[5px] transition-all text-center"
                >
                  <div style={{ borderRadius: smallRadius }} className={`w-16 h-16 ${service.color} border-2 border-black mx-auto mb-4 flex items-center justify-center group-hover:bg-white transition-colors`}>
                    <div style={{ color: 'black' }}>{service.icon}</div>
                  </div>
                  <span className="font-black uppercase text-xs tracking-widest">{service.name}</span>
                </Link>
              ))}
            </div>

            <div className="flex justify-center">
                <PremiumButton 
                  href="/services" 
                  text={t('home.checkAllServices')} 
                  icon={ArrowUpRight} 
                  isExternal={true} 
                />
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS */}
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">{t('home.howItWorks')}</h2>
          <p className="font-bold text-gray-400 uppercase text-xs mb-16 tracking-widest">{t('home.threeSteps')}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            {[
              { step: "01", title: t('home.step1Title'), desc: t('home.step1Desc'), icon: <ClipboardList size={32} /> },
              { step: "02", title: t('home.step2Title'), desc: t('home.step2Desc'), icon: <Users size={32} /> },
              { step: "03", title: t('home.step3Title'), desc: t('home.step3Desc'), icon: <CheckCircle2 size={32} /> },
            ].map((item, i) => (
              <div key={i} style={{ borderRadius: "30px" }} className="group flex flex-col items-center p-10 border-[3px] border-black bg-white dark:bg-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(239,157,57,0.2)] transition-all hover:bg-[#FDFBF9] dark:hover:bg-zinc-800">
                <div style={{ borderRadius: "18px" }} className="w-16 h-16 bg-black text-white border-2 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#EF9D39]">
                  {item.icon}
                </div>
                <span className="font-black text-[10px] uppercase mb-2 text-gray-400 tracking-[0.3em]">{t('home.stepLabel')} {item.step}</span>
                <h4 className="font-black uppercase text-xl mb-3 tracking-tight italic">{item.title}</h4>
                <p className="text-sm font-bold text-gray-400 normal-case leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="w-full flex justify-center pt-8">
            <PremiumButton 
              href="/how-it-works" 
              text={t('home.learnMore')} 
              icon={ArrowUpRight} 
              isExternal={true} 
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}