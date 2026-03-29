"use client";

import React, { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Link from 'next/link';
import { Star, MapPin, ArrowUpRight } from 'lucide-react';

export default function StoriesPage() {
    const brandColor = "#EF9D39";
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    const stories = [
        {
            id: 1,
            name: "Sarah Johnson",
            location: "Mostar",
            rating: 5,
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            quote: "GetItFixed found me the perfect plumber within hours. The work was professional!",
            before: "Leaky pipes",
            after: "Fixed in one day"
        },
        {
            id: 2,
            name: "Ahmed Ali",
            location: "Sarajevo",
            rating: 5,
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
            quote: "Best service ever! The electrician was friendly and knew exactly what to do.",
            before: "No outlets",
            after: "Full rewiring"
        },
        {
            id: 3,
            name: "Maria Santos",
            location: "Trebinje",
            rating: 5,
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
            quote: "Professional, punctual, and the quality is amazing. Highly recommend!",
            before: "Old walls",
            after: "Fresh paint"
        }
    ];

    return (
        <div className="page-gradient flex flex-col min-h-screen text-black">
            <Header />

            <main className="flex-grow max-w-3xl mx-auto px-6 py-12 w-full">
                
                {/* NASLOV SEKCIJA SA BIJELIM BOXOM */}
                <div 
                    className="text-center mb-10 p-8 border-[3px] border-black bg-white force-light-surface-text shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                    style={{ borderRadius: '30px' }}
                >
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
                        SUCCESS <span style={{ color: brandColor }}>STORIES</span>
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
                        Real stories from happy customers
                    </p>
                </div>

                {/* CONTAINER ZA CHAT - Bijeli box */}
                <div 
                    className="relative border-[3px] border-black p-6 md:p-10 bg-white force-light-surface-text shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                    style={{ borderRadius: '30px' }}
                >
                    <div className="space-y-8">
                        {stories.map((story, index) => {
                            const isLeft = index % 2 === 0;
                            const isHovered = hoveredId === story.id;
                            
                            return (
                                <div
                                    key={story.id}
                                    className={`flex ${isLeft ? 'justify-start' : 'justify-end'} relative w-full`}
                                >
                                    <div
                                        onMouseEnter={() => setHoveredId(story.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        className={`w-full max-w-md border-[3px] border-black p-5 relative transition-all duration-200 bg-white force-light-surface-text`}
                                        style={{ 
                                            borderRadius: '24px',
                                            boxShadow: isHovered ? '4px 4px 0px 0px #000' : '6px 6px 0px 0px #000',
                                            transform: isHovered ? 'translate(2px, 2px)' : 'none',
                                            backgroundColor: isHovered ? '#FAFAFA' : '#FFF'
                                        }}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <img 
                                                src={story.image} 
                                                alt={story.name}
                                                className="w-10 h-10 rounded-full border-2 border-black flex-shrink-0"
                                            />
                                            <div>
                                                <h3 className="font-black text-xs uppercase tracking-tight">{story.name}</h3>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                                    <MapPin size={10} /> {story.location}
                                                </div>
                                            </div>
                                            <div className="ml-auto flex gap-0.5">
                                                {[...Array(story.rating)].map((_, i) => (
                                                    <Star key={i} size={12} fill={brandColor} stroke={brandColor} />
                                                ))}
                                            </div>
                                        </div>

                                        <p className="text-sm font-medium text-gray-700 mb-4 leading-snug">
                                            "{story.quote}"
                                        </p>

                                        <div className="flex gap-6 pt-3 border-t-[1px] border-gray-100">
                                            <div>
                                                <span className="block text-[9px] font-black text-gray-400 uppercase">Before</span>
                                                <span className="text-xs font-bold">{story.before}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[9px] font-black text-gray-400 uppercase">After</span>
                                                <span className="text-xs font-bold" style={{ color: brandColor }}>{story.after}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA DUGME - POVEĆANO */}
                <div className="mt-10 flex flex-col items-center">
                    <p className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-8 dark:text-white">
                        Ready to share your own story?
                    </p>
                    <Link
                        href="/login"
                        style={{ borderRadius: "20px" }}
                        className="flex items-center gap-6 bg-white border-[4px] border-black px-10 py-5 font-black uppercase text-xs tracking-[0.2em] shadow-[10px_10px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-[#EF9D39] transition-all group"
                    >
                        <span>Share Your Experience</span>
                        <div className="bg-black p-2 rounded-full group-hover:bg-white transition-colors">
                            <ArrowUpRight size={18} className="text-white group-hover:text-black transition-transform group-hover:rotate-45" />
                        </div>
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}