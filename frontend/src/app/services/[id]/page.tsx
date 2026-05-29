"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Star, MapPin, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

// Make sure this points to your custom Axios setup!
// If it gives a red line, adjust it like you did on the other pages (e.g., "../../../lib/axios")
import api from "../../../../lib/axios";

// 1. Define what a Handyman looks like (TypeScript)
interface Handyman {
  id: number;
  first_name?: string;
  last_name?: string;
  name: string;
  category: string;
  rating: string;
  jobs: number;
  price: string;
  location: string;
}

export default function CategoryPage() {
  const params = useParams();
  const id = (params?.id as string) || "";

  const [providers, setProviders] = useState<Handyman[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. FETCH DATA FROM DJANGO
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        // Fetch from accounts endpoint (handyman users filtered by service_type).
        const response = await api.get(
          `/api/accounts/handymen/?service_type=${encodeURIComponent(id)}`,
        );
        setProviders(response.data);
      } catch (error) {
        console.error("Error fetching handymen:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProviders();
  }, [id]);

  const displayTitle = id ? id.replace("_", " ") : "";
  const displayTitlePretty = displayTitle
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="page-gradient flex flex-col min-h-screen font-sans dark:text-white bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="flex-grow max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="mb-12 flex flex-col items-center">
          <div className="w-full mb-10">
            <Link
              href="/services"
              className="text-sm font-bold uppercase border-2 border-black px-4 py-2 rounded-xl bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all inline-block"
            >
              ← Back to Categories
            </Link>
          </div>
          <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-zinc-700 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[30px] p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              {displayTitlePretty} <span className="text-[#EF9D39]">Pros</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-[0.3em] mt-2">
              Select a verified expert for your project
            </p>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#EF9D39]" size={48} />
          </div>
        ) : (
          <div className="space-y-6">
            {providers.length > 0 ? (
              providers.map((pro) =>
                (() => {
                  const fullName =
                    `${pro.first_name || ""} ${pro.last_name || ""}`.trim() ||
                    pro.name;
                  return (
                    <div
                      key={pro.id}
                      className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-zinc-700 p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-[#FFE8D6] text-black border-[3px] border-black rounded-xl flex items-center justify-center font-black text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          {fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-lg md:text-xl font-black text-black dark:text-white uppercase">
                            {fullName}
                          </h2>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs font-bold text-gray-600 dark:text-zinc-400">
                            <span className="flex items-center gap-1 text-[#EF9D39]">
                              <Star size={16} className="fill-current" />{" "}
                              {pro.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={16} /> {pro.location}
                            </span>
                            <span>{pro.jobs} Jobs</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <span className="font-black text-lg text-black bg-gray-100 border-2 border-black px-3.5 py-1 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {pro.price}
                        </span>
                        <Link
                          href={`/expert/${pro.id}`}
                          className="bg-black text-white px-5 py-2.5 rounded-xl font-black uppercase text-[11px] hover:bg-[#EF9D39] hover:text-black border-2 border-black transition-colors flex items-center gap-1"
                        >
                          View Profile <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  );
                })(),
              )
            ) : (
              <div className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-zinc-700 p-12 rounded-2xl text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-2xl font-black text-black dark:text-white uppercase mb-2">
                  No pros found
                </h3>
                <p className="font-bold text-gray-500 dark:text-zinc-400">
                  We are currently expanding our network. Check back soon for
                  new experts in this category!
                </p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
