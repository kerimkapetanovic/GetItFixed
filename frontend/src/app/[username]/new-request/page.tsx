"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import api from "../../../../lib/axios";
import { Star, MapPin, Wrench, Loader2 } from "lucide-react";
import Link from "next/link"; // IMPORT LINK
import { useParams } from "next/navigation"; // IMPORT USEPARAMS

interface Handyman {
  id: number;
  first_name: string;
  last_name: string;
  service_type: string;
  rating: string;
  location: string;
  hourly_rate: string;
}

export default function NewRequestPage() {
  const params = useParams() as { username: string };
  const username = params.username;

  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHandymen = async () => {
      try {
        const response = await api.get("/api/accounts/handymen/");
        setHandymen(response.data);
      } catch (err) {
        console.error("Error fetching experts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHandymen();
  }, []);

  const cardStyle = { borderRadius: "24px" };

  return (
    <div className="page-gradient min-h-screen dark:text-white bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Header />
      <main className="flex-grow max-w-6xl mx-auto p-6 py-12 w-full">
        {/* Banner Section */}
        <div
          className="bg-white dark:bg-zinc-900 border-2 border-black p-10 text-center mb-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          style={{ borderRadius: "40px" }}
        >
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white">
            Find Your <span className="text-[#EF9D39]">Expert</span>
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 font-bold text-xs mt-2 uppercase tracking-widest">
            Select a professional to get started
          </p>
        </div>

        {/* Handyman Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
            <div className="col-span-full flex flex-col items-center py-20">
              <Loader2 className="animate-spin text-[#EF9D39] mb-4" size={48} />
              <p className="font-black uppercase tracking-widest text-sm text-black dark:text-white">
                Searching for pros...
              </p>
            </div>
          ) : handymen.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900 border-2 border-dashed border-gray-300 rounded-3xl">
              <p className="font-bold text-gray-500 dark:text-zinc-400 uppercase">
                No handymen available at the moment.
              </p>
            </div>
          ) : (
            handymen.map((pro) => (
              <div
                key={pro.id}
                style={cardStyle}
                className="bg-white dark:bg-zinc-900 border-[3px] border-black p-6 text-gray-900 dark:text-zinc-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-6">
                  {/* Initials Circle */}
                  <div className="w-16 h-16 bg-black text-white dark:bg-[#EF9D39] dark:text-black rounded-xl flex items-center justify-center font-black text-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                    {(pro.first_name?.[0] || "") + (pro.last_name?.[0] || "")}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase text-black dark:text-white">
                      {pro.first_name} {pro.last_name}
                    </h2>
                    <p className="text-[#EF9D39] font-black text-xs uppercase flex items-center gap-1">
                      <Star size={14} className="fill-current" />{" "}
                      {pro.rating || "5.0"} • {pro.service_type}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="border-2 border-black p-3 rounded-xl flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 text-black dark:text-white">
                    <MapPin size={18} className="text-[#EF9D39]" />
                    <span className="font-bold text-xs md:text-sm uppercase truncate">
                      {pro.location || "Sarajevo"}
                    </span>
                  </div>
                  <div className="border-2 border-black p-3 rounded-xl flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 text-black dark:text-white">
                    <Wrench size={18} className="text-[#EF9D39]" />
                    <span className="font-bold text-xs md:text-sm uppercase">
                      {pro.hourly_rate || "30"} KM/H
                    </span>
                  </div>
                </div>

                {/* WRAPPED BUTTON WITH LINK */}
                <Link
                  href={`/${username}/new-request/create?handyman_id=${pro.id}`}
                >
                  <button className="w-full bg-[#EF9D39] text-black border-2 border-black py-4 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-95 transition-all">
                    Book This Expert
                  </button>
                </Link>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
