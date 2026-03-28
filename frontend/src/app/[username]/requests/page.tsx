"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import api from "../../../../lib/axios";

// Define the shape of our data
interface BookingRequest {
  id: number;
  service_type: string;
  description: string;
  status: string;
}

export default function MyRequestsPage() {
  const params = useParams() as { username: string };
  const username = params.username;

  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        // Fetching the live data from our new endpoint!
        const response = await api.get("/api/bookings/my-requests/");
        setRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRequests();
  }, []);

  const cardStyle = { borderRadius: "24px" };

  return (
    <div className="page-gradient flex flex-col min-h-screen dark:text-white bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-grow flex flex-col items-center p-6 py-12 w-full max-w-3xl mx-auto">
        <div
          className="w-full bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-10 text-center"
          style={cardStyle}
        >
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            My Requests
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 font-bold text-xs mt-2 uppercase tracking-widest">
            Track your repairs and handymen
          </p>
        </div>

        <div className="w-full space-y-6">
          {loading ? (
            <div className="text-center font-bold animate-pulse uppercase">
              Loading your requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center font-bold text-gray-500 dark:text-zinc-400 uppercase">
              You haven't posted any jobs yet.
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                style={cardStyle}
                className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 text-gray-900 dark:text-zinc-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-yellow-500 font-black text-xs uppercase tracking-widest flex items-center gap-1 mb-1">
                      🔧 {req.service_type}
                    </span>
                    <h2 className="text-2xl font-black uppercase line-clamp-1">
                      {req.description}
                    </h2>
                  </div>

                  {/* Dynamic Status Badge */}
                  <span
                    className={`px-4 py-1 border-2 border-black font-black text-xs uppercase rounded-full ${
                      req.status === "pending"
                        ? "bg-yellow-300 text-black"
                        : req.status === "accepted"
                          ? "bg-blue-300 text-black"
                          : "bg-green-400 text-black"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-xl mb-4 bg-gray-50 dark:bg-zinc-800/50">
                  <p className="text-sm font-bold text-gray-600 dark:text-zinc-300">
                    {req.status === "pending"
                      ? "Waiting for handymen to accept..."
                      : req.status === "accepted"
                        ? "A handyman has accepted this job!"
                        : "Job completed."}
                  </p>
                </div>

                <div className="flex justify-end mt-4">
                  {/* Wrap the button in a Next.js Link */}
                  <Link href={`/${username}/requests/${req.id}`}>
                    <button className="bg-[linear-gradient(90deg,#EF9D39_10%,#FFD25A_90%)] border-2 border-black font-black text-xs uppercase px-6 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
