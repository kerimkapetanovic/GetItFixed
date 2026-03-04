"use client";

import React, { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Star, MapPin, ArrowUpRight } from 'lucide-react';

export default function StoriesPage() {
    const softGradient = "linear-gradient(135deg, #FFE8D6 0%, #FFD4B3 100%)";
    const brandColor = "#EF9D39";
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [clickedId, setClickedId] = useState<number | null>(null);

    const stories = [
        {
            id: 1,
            name: "Sarah Johnson",
            location: "Mostar",
            service: "Plumbing",
            rating: 5,
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            quote: "GetItFixed found me the perfect plumber within hours. The work was professional and affordable!",
            before: "Leaky pipes everywhere",
            after: "Fixed in one day"
        },
        {
            id: 2,
            name: "Ahmed Ali",
            location: "Sarajevo",
            service: "Electrical",
            rating: 5,
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
            quote: "Best service ever! The electrician was friendly and knew exactly what to do.",
            before: "No working outlets",
            after: "Full rewiring completed"
        },
        {
            id: 3,
            name: "Maria Santos",
            location: "Trebinje",
            service: "Painting",
            rating: 5,
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
            quote: "Professional, punctual, and the quality is amazing. Highly recommend!",
            before: "Old, damaged walls",
            after: "Beautiful fresh paint"
        },
        {
            id: 4,
            name: "John Smith",
            location: "Banja Luka",
            service: "Carpentry",
            rating: 5,
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
            quote: "Amazing craftsmanship! The carpenter exceeded all expectations.",
            before: "Broken furniture",
            after: "Like new!"
        },
        {
            id: 5,
            name: "Emma Wilson",
            location: "Zenica",
            service: "Cleaning",
            rating: 5,
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
            quote: "Professional team, attention to detail, and fair prices!",
            before: "Very dirty home",
            after: "Spotless and fresh"
        }
    ];

    const getBackgroundColor = (id: number) => {
        if (clickedId === id) {
            return '#F5F5F5'; // Light gray when clicked
        }
        if (hoveredId === id) {
            return '#f5e6c4'; // Slightly darker when hovered
        }
        return '#FFFFFF'; // White by default
    };

    const getBoxShadow = (id: number) => {
        if (clickedId === id || hoveredId === id) {
            return '4px 4px 0px 0px rgba(0, 0, 0, 0.15)'; // Pressed effect
        }
        return '8px 8px 0px 0px rgba(0, 0, 0, 0.15)'; // Normal shadow
    };

    return (
        <div 
            className="flex flex-col min-h-screen" 
            style={{ background: softGradient }}
        >
            <Header />

            <main className="flex-grow max-w-5xl mx-auto px-6 py-12 w-full">
                {/* HEADER SECTION WITH BORDER */}
                <div 
                    className="text-center mb-12 p-10 border-[4px] border-black"
                    style={{ borderRadius: '40px', backgroundColor: '#FFFFFF' }}
                >
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-2">
                        SUCCESS <span style={{ color: brandColor }}>STORIES</span>
                    </h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mt-4">
                        REAL STORIES FROM OUR HAPPY CUSTOMERS
                    </p>
                </div>

                {/* CHAT-STYLE STORIES CONTAINER */}
                <div 
                    className="relative border-[4px] border-black p-8 md:p-12"
                    style={{ borderRadius: '40px', backgroundColor: '#FFFFFF' }}
                >
                    <div className="space-y-12">
                        {stories.map((story, index) => {
                            const isLeft = index % 2 === 0;
                            
                            return (
                                <div
                                    key={story.id}
                                    className={`flex ${isLeft ? 'justify-start' : 'justify-end'} relative`}
                                >
                                    {/* ARROW POINTER */}
                                    {isLeft && (
                                        <div
                                            className="absolute -left-6 top-8 transition-all duration-200"
                                            style={{
                                                width: '0',
                                                height: '0',
                                                borderTop: '12px solid transparent',
                                                borderBottom: '12px solid transparent',
                                                borderRight: '20px solid black',
                                                zIndex: 5
                                            }}
                                        />
                                    )}
                                    {!isLeft && (
                                        <div
                                            className="absolute -right-6 top-8 transition-all duration-200"
                                            style={{
                                                width: '0',
                                                height: '0',
                                                borderTop: '12px solid transparent',
                                                borderBottom: '12px solid transparent',
                                                borderLeft: '20px solid black',
                                                zIndex: 5
                                            }}
                                        />
                                    )}

                                    {/* MESSAGE BUBBLE - SMALLER WIDTH */}
                                    <div
                                        onMouseEnter={() => setHoveredId(story.id)}
                                        onMouseLeave={() => {
                                            setHoveredId(null);
                                            setClickedId(null);
                                        }}
                                        onClick={() => setClickedId(story.id)}
                                        className={`w-full max-w-lg ${isLeft ? 'md:mr-12' : 'md:ml-12'} border-[4px] border-black p-7 relative cursor-pointer transition-all duration-200`}
                                        style={{ 
                                            backgroundColor: getBackgroundColor(story.id),
                                            borderRadius: '32px',
                                            boxShadow: getBoxShadow(story.id),
                                            zIndex: 10,
                                            transform: (clickedId === story.id || hoveredId === story.id) ? 'translate(4px, 4px)' : 'translate(0, 0)'
                                        }}
                                    >
                                        {/* AVATAR & NAME */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <img 
                                                src={story.image} 
                                                alt={story.name}
                                                className="w-14 h-14 rounded-full border-[3px] border-black flex-shrink-0"
                                            />
                                            <div>
                                                <h3 className="font-black text-sm uppercase tracking-wider">{story.name}</h3>
                                                <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                                    <MapPin size={12} />
                                                    {story.location}
                                                </div>
                                            </div>
                                        </div>

                                        {/* RATING */}
                                        <div className="flex gap-1 mb-3">
                                            {[...Array(story.rating)].map((_, i) => (
                                                <Star key={i} size={16} fill={brandColor} stroke={brandColor} />
                                            ))}
                                        </div>

                                        {/* QUOTE */}
                                        <p className="text-sm font-bold text-gray-700 mb-4 italic leading-relaxed">
                                            "{story.quote}"
                                        </p>

                                        {/* BEFORE & AFTER */}
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-gray-200">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-500 uppercase mb-1 tracking-wider">Before</p>
                                                <p className="text-sm font-bold text-gray-700">{story.before}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-500 uppercase mb-1 tracking-wider">After</p>
                                                <p className="text-sm font-bold" style={{ color: brandColor }}>{story.after}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA SECTION */}
                <div className="text-center mt-16">
                    <p className="text-gray-600 font-bold mb-6 text-lg">Ready to get your own success story?</p>
                    <a
                        href="/login"
                        style={{ borderRadius: '12px' }}
                        className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 font-black uppercase tracking-widest text-sm hover:bg-orange-400 hover:text-black transition-all border-2 border-black shadow-[6px_6px_0px_0px_rgba(239,157,57,1)]"
                    >
                        Start Your Request <ArrowUpRight size={16} />
                    </a>
                </div>
            </main>

            <Footer />
        </div>
    );
}