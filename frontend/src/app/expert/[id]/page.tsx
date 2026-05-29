"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  Star,
  MapPin,
  Briefcase,
  ChevronLeft,
  Loader2,
  Calendar,
} from "lucide-react";
import api from "../../../../lib/axios";

// 1. Definišemo interfejse kako bismo znali šta očekujemo od backenda
interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  client_name: string;
}

interface HandymanProfile {
  id: number;
  name: string;
  category: string;
  location: string;
  price: string;
  rating: string;
  jobs: number;
  avatar_url?: string;
  email?: string;
}

export default function ExpertProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [expert, setExpert] = useState<HandymanProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 2. Vučemo podatke
  useEffect(() => {
    const fetchExpertData = async () => {
      try {
        setLoading(true);
        // a) Vučemo osnovne podatke o majstoru
        const expertRes = await api.get(`/api/accounts/handymen/`);
        const foundExpert = expertRes.data.find(
          (e: any) => e.id.toString() === id,
        );

        if (foundExpert) {
          setExpert(foundExpert);
        } else {
          setError("Expert not found.");
        }

        // b) Vučemo recenzije za ovog majstora
        const reviewsRes = await api.get(`/api/bookings/expert/${id}/reviews/`);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error("Error fetching expert details:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExpertData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-[#EF9D39]" size={48} />
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
        <h2 className="text-2xl font-black uppercase">
          {error || "Expert not found"}
        </h2>
        <button
          onClick={() => router.back()}
          className="mt-4 underline font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Formatiranje datuma
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="page-gradient flex flex-col min-h-screen font-sans dark:text-white bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
        {/* BACK DUGME */}
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-sm font-bold uppercase border-2 border-black px-4 py-2 rounded-xl bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all w-fit"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {/* GLAVNI KARTON MAJSTORA */}
        <div className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-zinc-700 rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Avatar */}
            <div className="w-32 h-32 bg-[#FFE8D6] text-black border-[4px] border-black rounded-2xl flex items-center justify-center font-black text-5xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
              {expert.avatar_url ? (
                <img
                  src={expert.avatar_url}
                  alt={expert.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                (expert.name || expert.email || "X").charAt(0).toUpperCase()
              )}
            </div>

            {/* Info */}
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-black dark:text-white uppercase tracking-tight">
                    {expert.name}
                  </h1>
                  <p className="text-[#EF9D39] font-black uppercase text-sm tracking-widest mt-1 mb-4">
                    {expert.category.replace("_", " ")}
                  </p>
                </div>
                <div className="bg-gray-100 border-2 border-black px-4 py-2 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-black text-xl text-black">
                    {expert.price}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center gap-2 bg-yellow-100 border-2 border-black px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Star size={18} className="text-yellow-600 fill-yellow-600" />
                  <span className="font-black text-black">
                    {expert.rating} Rating
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-blue-100 border-2 border-black px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Briefcase size={18} className="text-blue-600" />
                  <span className="font-black text-black">
                    {expert.jobs} Jobs Done
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-stone-100 border-2 border-black px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <MapPin size={18} className="text-stone-600" />
                  <span className="font-black text-black">
                    {expert.location}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t-[3px] border-dashed border-gray-200">
            <button
              onClick={() => {
                // Uzimamo username trenutno ulogovanog klijenta iz localStorage
                const currentUsername =
                  typeof window !== "undefined"
                    ? localStorage.getItem("username") || "client"
                    : "client";
                // Pravimo URL sa parametrima za ovog majstora
                const bookingUrl = `/${currentUsername}/new-request/create?handyman_id=${expert.id}&service_type=${expert.category}&handyman_name=${encodeURIComponent(expert.name)}`;
                // Preusmjeravamo na formu
                router.push(bookingUrl);
              }}
              className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-lg hover:bg-[#EF9D39] hover:text-black border-[3px] border-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            >
              Request Service from {expert.name.split(" ")[0] || "Expert"}
            </button>
          </div>
        </div>

        {/* RECENZIJE SEKCIJA */}
        <div>
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
            Client Reviews{" "}
            <span className="text-gray-400 text-lg">({reviews.length})</span>
          </h2>

          {reviews.length === 0 ? (
            <div className="bg-white border-[3px] border-black border-dashed rounded-2xl p-8 text-center text-gray-500 font-bold">
              This expert doesn't have any reviews yet. Be the first to book
              them!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white dark:bg-zinc-900 border-[3px] border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-black uppercase text-lg">
                        {review.client_name}
                      </h4>
                      <div className="flex items-center gap-1 text-[#EF9D39] mt-1">
                        {/* Crtamo broj zvjezdica koliko je klijent ostavio */}
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < review.rating
                                ? "fill-current"
                                : "text-gray-300 fill-transparent"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs font-bold uppercase">
                      <Calendar size={14} />
                      {formatDate(review.created_at)}
                    </div>
                  </div>
                  <p className="text-gray-700 font-medium">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
