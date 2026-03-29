"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import api from "../../../../lib/axios";
import { ArrowUpRight } from "lucide-react";

// Define the shape of our data
interface BookingRequest {
  id: number;
  service_type: string;
  description: string;
  status: string;
  negotiation_status: string;
  scheduled_time: string | null;
  client_proposed_time: string | null;
  handyman_proposed_time: string | null;
  handyman_counter_message: string | null;
}

function formatDateTime(value: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString();
}

function getRequestState(request: BookingRequest) {
  if (request.status === "cancelled" || request.negotiation_status === "declined") {
    return {
      label: "Cancelled",
      badgeClass: "bg-red-300 text-black",
      message: "This request was closed after a declined negotiation.",
    };
  }

  if (request.status === "accepted" || request.negotiation_status === "agreed") {
    return {
      label: "Accepted",
      badgeClass: "bg-blue-300 text-black",
      message: "Expert accepted the request. Appointment is confirmed.",
    };
  }

  if (request.negotiation_status === "awaiting_client") {
    return {
      label: "Expert Countered",
      badgeClass: "bg-purple-300 text-black",
      message: "Expert proposed a different time and is waiting for your response.",
    };
  }

  return {
    label: "Waiting for Response",
    badgeClass: "bg-yellow-300 text-black",
    message: "Request sent. Waiting for expert to accept or counter.",
  };
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
            My <span className="text-[#EF9D39]">Requests</span>
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
              You have not posted any jobs yet.
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                style={cardStyle}
                className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 text-gray-900 dark:text-zinc-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6"
              >
                {(() => {
                  const requestState = getRequestState(req);
                  const latestProposal =
                    req.handyman_proposed_time ||
                    req.client_proposed_time ||
                    req.scheduled_time;
                  return (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-yellow-500 font-black text-xs uppercase tracking-widest flex items-center gap-1 mb-1">
                            🔧 {req.service_type}
                          </span>
                          <h2 className="text-2xl font-black uppercase line-clamp-1">
                            {req.description}
                          </h2>
                        </div>

                        <span
                          className={`px-4 py-1 border-2 border-black font-black text-xs uppercase rounded-full ${requestState.badgeClass}`}
                        >
                          {requestState.label}
                        </span>
                      </div>

                      <div className="p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-xl mb-4 bg-gray-50 dark:bg-zinc-800/50 space-y-2">
                        <p className="text-sm font-bold text-gray-600 dark:text-zinc-300">
                          {requestState.message}
                        </p>
                        <p className="text-xs font-black uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                          Latest proposed time: {formatDateTime(latestProposal)}
                        </p>
                        {req.handyman_counter_message &&
                          req.negotiation_status === "awaiting_client" && (
                            <p className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                              Expert note: {req.handyman_counter_message}
                            </p>
                          )}
                      </div>
                    </>
                  );
                })()}

                <div className="flex justify-end mt-4">
                  <Link
                    href={`/${username}/requests/${req.id}`}
                    className="group flex items-center gap-4 border-[3px] border-black bg-white px-6 py-3 font-black uppercase text-xs tracking-[0.2em] shadow-[8px_8px_0px_0px_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-[#EF9D39] hover:shadow-none"
                    style={{ borderRadius: "20px" }}
                  >
                    <span className="text-black">View Details</span>
                    <span className="flex items-center justify-center rounded-full bg-black p-1.5 transition-colors group-hover:bg-white">
                      <ArrowUpRight
                        size={16}
                        className="text-white transition-transform group-hover:rotate-45 group-hover:text-black"
                      />
                    </span>
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
