"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
// Make sure this path points correctly to your custom axios file!
import api from "../../../../../lib/axios";

interface BookingDetail {
  id: number;
  service_type: string;
  description: string;
  status: string;
  scheduled_time: string | null;
  handyman_name: string | null;
  handyman_email: string | null;
}

export default function RequestDetailsPage() {
  const params = useParams() as { id: string; username: string };
  const bookingId = params.id;
  const username = params.username;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // This is the correct endpoint for fetching a single job!
        const response = await api.get(`/api/bookings/${bookingId}/`);
        setBooking(response.data);
      } catch (error) {
        console.error("Failed to fetch booking details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) fetchBookingDetails();
  }, [bookingId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-black uppercase text-xl dark:text-white">
        Loading Details...
      </div>
    );
  if (!booking)
    return (
      <div className="min-h-screen flex items-center justify-center font-black uppercase text-xl text-red-500">
        Job not found
      </div>
    );

  return (
    <div className="page-gradient flex flex-col min-h-screen dark:text-white bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-grow flex flex-col items-center p-6 py-12 w-full max-w-3xl mx-auto">
        <div className="w-full mb-6">
          <Link
            href={`/${username}/requests`}
            className="font-bold text-sm uppercase text-gray-500 hover:text-black dark:hover:text-white transition-colors"
          >
            ← Back to My Requests
          </Link>
        </div>

        <div className="w-full bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 rounded-[32px]">
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              Job #{booking.id}
            </h1>
            <span
              className={`px-4 py-2 border-2 border-black font-black text-sm uppercase rounded-full ${
                booking.status === "pending"
                  ? "bg-yellow-300 text-black"
                  : booking.status === "accepted"
                    ? "bg-blue-300 text-black"
                    : "bg-green-400 text-black"
              }`}
            >
              {booking.status}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">
                Service Type
              </label>
              <div className="text-xl font-bold uppercase">
                {booking.service_type}
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">
                Description
              </label>
              <div className="p-4 bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-xl font-bold">
                {booking.description}
              </div>
            </div>

            {/* Handyman Contact Card */}
            {booking.status === "accepted" && (
              <div className="p-6 bg-[linear-gradient(90deg,#EF9D39_10%,#FFD25A_90%)] border-2 border-black rounded-xl mt-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-black text-black uppercase tracking-tight text-xl mb-4">
                  Handyman Assigned!
                </h3>

                <div className="bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">
                    Your Expert
                  </p>
                  <p className="font-black text-black text-2xl uppercase mb-2">
                    {booking.handyman_name || "Professional"}
                  </p>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-gray-100">
                    <div className="bg-yellow-100 p-2 rounded-lg border-2 border-yellow-300">
                      ✉️
                    </div>
                    <span className="font-bold text-gray-800 text-sm">
                      {booking.handyman_email || "Contact info unavailable"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
