"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import api from "../../../../lib/axios";
import { ArrowUpRight } from "lucide-react";

import { BookingDetail } from "@/types/booking"; // Uvezi svoj centralni tip
import { JobTimer } from "@/components/JobTimer";

const formatDateTime = (value: string | Date | null) => {
  if (!value) return "Not set";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date).replace(",", "");
};

function getRequestState(request: BookingDetail) {
  if (request.status === "cancelled" || request.negotiation_status === "declined") {
    return {
      label: "Cancelled",
      badgeClass: "bg-red-400 text-black",
      message: "This request was closed after a declined negotiation.",
    };
  }

  if (request.status === "in_progress") {
    return {
      label: "In Progress",
      badgeClass: "bg-violet-400 text-black",
      message: "Handyman is currently working on your request.",
    };
  }

  if (request.status === "visit_fee_paid") {
    return {
      label: "Visit Fee Paid",
      badgeClass: "bg-sky-300 text-black",
      message: "Initial visit fee step is done. Continue-job decision is active.",
    };
  }

  if (request.status === "quote_pending_client") {
    return {
      label: "Quote Pending",
      badgeClass: "bg-indigo-300 text-black",
      message: "Handyman sent an itemized quote. Open details to accept or reject.",
    };
  }

  if (request.status === "funds_locked") {
    return {
      label: "Funds Locked",
      badgeClass: "bg-cyan-300 text-black",
      message: "Quote accepted and funds are reserved in escrow.",
    };
  }

  if (request.status === "handyman_done") {
    return {
      label: "Awaiting Confirmation",
      badgeClass: "bg-purple-400 text-black",
      message: "Handyman marked the job as finished. Confirm completion in request details.",
    };
  }

  if (request.status === "not_completed") {
    return {
      label: "Not Completed",
      badgeClass: "bg-red-400 text-black",
      message: "You marked this job as not completed. Follow-up with handyman is required.",
    };
  }

  if (request.status === "completed") {
    return {
      label: "Completed",
      badgeClass: "bg-green-400 text-black",
      message: "Job completed! Thank you for using our service.",
    };
  }

  if (request.status === "accepted" || request.negotiation_status === "agreed") {
    return {
      label: "Accepted",
      badgeClass: "bg-blue-400 text-black",
      message: "You confirmed the expert's offer. Appointment is locked in.",
    };
  }

  if (request.negotiation_status === "awaiting_client") {
    return {
      label: "Expert offer",
      badgeClass: "bg-purple-400 text-black",
      message: "The expert sent time & price — open the ticket to confirm or deny.",
    };
  }

  return {
    label: "Waiting for Response",
    badgeClass: "bg-yellow-400 text-black",
    message: "Waiting for the expert to send an offer (time & price).",
  };
}

type RequestFilterId =
  | "all"
  | "waiting"
  | "expert_offer"
  | "accepted"
  | "completed"
  | "canceled";

const REQUEST_FILTERS: {
  id: RequestFilterId;
  label: string;
  badgeClass?: string;
}[] = [
  { id: "all", label: "All" },
  { id: "waiting", label: "Waiting for Response", badgeClass: "bg-yellow-400 text-black" },
  { id: "expert_offer", label: "Expert Offer", badgeClass: "bg-purple-400 text-black" },
  { id: "accepted", label: "Accepted", badgeClass: "bg-blue-400 text-black" },
  { id: "completed", label: "Completed", badgeClass: "bg-green-400 text-black" },
  { id: "canceled", label: "Canceled", badgeClass: "bg-red-400 text-black" },
];

function getRequestCategory(request: BookingDetail): Exclude<RequestFilterId, "all"> {
  if (request.status === "cancelled" || request.negotiation_status === "declined") {
    return "canceled";
  }
  if (request.status === "completed" || request.status === "closed") {
    return "completed";
  }
  if (
    request.status === "accepted" ||
    request.status === "in_progress" ||
    request.status === "visit_fee_paid" ||
    request.status === "quote_pending_client" ||
    request.status === "funds_locked" ||
    request.status === "handyman_done" ||
    request.status === "not_completed" ||
    request.status === "awaiting_payment" ||
    request.status === "paid" ||
    request.negotiation_status === "agreed"
  ) {
    return "accepted";
  }
  if (request.negotiation_status === "awaiting_client") {
    return "expert_offer";
  }
  return "waiting";
}

export default function MyRequestsPage() {
  const params = useParams() as { username: string };
  const username = params.username;

  const [requests, setRequests] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<RequestFilterId>("all");

  const filterCounts = REQUEST_FILTERS.reduce(
    (acc, filter) => {
      if (filter.id === "all") {
        acc.all = requests.length;
      } else {
        acc[filter.id] = requests.filter((r) => getRequestCategory(r) === filter.id).length;
      }
      return acc;
    },
    {} as Record<RequestFilterId, number>
  );

  const filteredRequests =
    activeFilter === "all"
      ? requests
      : requests.filter((req) => getRequestCategory(req) === activeFilter);

  const handleExpire = async (bookingId: number) => {
    try {
      // 1. Opcionalno: Pozovi backend da klijent automatski "decline-uje" jer je isteklo
      // Ako backend to već radi sam (cron job), onda samo osvježi lokalno stanje
      setRequests((prev) =>
        prev.map((req) =>
          req.id === bookingId
            ? {
              ...req,
              status: "cancelled" as BookingDetail["status"],
              negotiation_status: "declined" as BookingDetail["negotiation_status"],
            }
            : req
        )
      );

      // Ako želiš i bazu da ažuriraš odmah s frontenda:
      // await api.post(`/api/bookings/${bookingId}/negotiate/`, { action: 'decline' });
    } catch (err) {
      console.error("Error expiring booking:", err);
    }
  };

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

        {!loading && requests.length > 0 && (
          <div
            className="w-full bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 mb-8"
            style={cardStyle}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {REQUEST_FILTERS.map((filter) => {
                const isActive = activeFilter === filter.id;
                const count = filterCounts[filter.id];
                const colorClass =
                  filter.id === "all"
                    ? isActive
                      ? "bg-[#EF9D39] text-black"
                      : "bg-zinc-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                    : filter.badgeClass ?? "";

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={`w-full px-2 py-2 border-2 border-black font-black text-[10px] uppercase rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-[1.02] ${colorClass} ${
                      isActive ? "ring-2 ring-black ring-offset-2 ring-offset-white dark:ring-offset-zinc-900" : "opacity-90"
                    }`}
                  >
                    <span className="block leading-tight">{filter.label}</span>
                    <span className="block text-[9px] opacity-90">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="w-full space-y-6">
          {loading ? (
            <div className="text-center font-bold animate-pulse uppercase">
              Loading your requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center font-bold text-gray-500 dark:text-zinc-400 uppercase">
              You have not posted any jobs yet.
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center font-bold text-gray-500 dark:text-zinc-400 uppercase py-8">
              No requests in this category.
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                style={cardStyle}
                className={`bg-white dark:bg-zinc-900 border-2 p-6 transition-all text-gray-900 dark:text-zinc-100 
    ${req.is_urgent
                    ? "border-red-600 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]"
                    : "border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                  }`}
              >    {(() => {
                const requestState = getRequestState(req);
                const latestProposal =
                  req.handyman_proposed_time ||
                  req.client_proposed_time ||
                  req.scheduled_time;
                return (
                  <>
                    {/* GORNJI RED: ID, SERVICE I STATUS BADGE */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-black text-[#EF9D39] px-2 py-0.5 rounded-md font-black text-[12px] tracking-widest uppercase ">
                            #{req.ticket_id}
                          </span>

                          <span className="text-yellow-500 font-black text-[14px] uppercase tracking-widest flex items-center gap-1">
                            🔧 {req.service_type}
                          </span>
                          {/* NOVI URGENT BADGE */}
                          {req.is_urgent && (
                            <span className="bg-red-600 text-white px-2 py-0.5 rounded-md font-black text-[10px] tracking-tighter uppercase animate-bounce">
                              🚨 URGENT
                            </span>
                          )}
                          <span>
                            {req.status !== 'accepted' &&
                              req.status !== 'completed' &&
                              req.status !== 'cancelled' &&
                              req.status !== 'handyman_done' &&
                              req.status !== 'not_completed' &&
                              req.status !== 'visit_fee_paid' &&
                              req.status !== 'quote_pending_client' &&
                              req.status !== 'funds_locked' && (
                              <JobTimer
                                expiresAt={req.expires_at}
                                onExpire={() => handleExpire(req.id)}
                              />
                            )}
                          </span>

                        </div>

                        {/* IME MAJSTORA */}
                        <h3 className="text-md font-black uppercase tracking-tight text-zinc-400">
                          Handyman : <span className="text-black dark:text-white ">
                            {req.handyman_name ? req.handyman_name : "No Handymanassigned yet"}
                          </span>
                        </h3>
                      </div>

                      {/* STATUS BADGE */}
                      <span className={`px-4 py-1 border-2 border-black font-black text-[10px] uppercase rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${requestState.badgeClass}`}>
                        {requestState.label}
                      </span>
                    </div>

                    {/* OPIS KVARA (NASLOV) */}
                    <h2 className="text-2xl font-black uppercase italic mb-4 line-clamp-1 dark:text-white">
                      {req.description}
                    </h2>


                    {/* SIVA INFO KUTIJA */}
                    <div className="p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-xl mb-4 bg-gray-50 dark:bg-zinc-800/50 space-y-2">
                      <p className="text-sm font-bold text-gray-600 dark:text-zinc-300">
                        {requestState.message}
                      </p>
                      <p className="text-xs font-black uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                        Latest proposed time: {formatDateTime(latestProposal)}
                      </p>
                      {req.handyman_counter_message &&
                        req.negotiation_status === "awaiting_client" && (
                          <p className="text-xs font-bold text-gray-700 dark:text-zinc-300 border-t border-gray-200 dark:border-zinc-700 pt-2">
                            Handyman note: {req.handyman_counter_message}
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