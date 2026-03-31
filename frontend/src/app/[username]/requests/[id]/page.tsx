"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
// Make sure this path points correctly to your custom axios file!
import api from "../../../../../lib/axios";
import { Loader2 } from "lucide-react";
import { BookingDetail } from "@/types/booking"; // Uvezi svoj centralni tip

function formatDateTime(value: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString();
}

function getStatusInfo(booking: BookingDetail) {
  if (booking.status === "cancelled" || booking.negotiation_status === "declined") {
    return {
      label: "Cancelled",
      badgeClass: "bg-red-300 text-black",
      helperText: "Request closed after decline.",
    };
  }
  if (booking.status === "accepted" || booking.negotiation_status === "agreed") {
    return {
      label: "Accepted",
      badgeClass: "bg-blue-300 text-black",
      helperText: "Appointment confirmed with expert.",
    };
  }
  if (booking.negotiation_status === "awaiting_client") {
    return {
      label: "Expert Countered",
      badgeClass: "bg-purple-300 text-black",
      helperText: "Expert proposed a new time. Choose your response.",
    };
  }
  return {
    label: "Waiting for Response",
    badgeClass: "bg-yellow-300 text-black",
    helperText: "Waiting for expert to accept or counter your request.",
  };
}

function getBackendErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) {
      return response.data.error;
    }
  }
  return "Failed to submit your response.";
}

export default function RequestDetailsPage() {
  const params = useParams() as { id: string; username: string };
  const bookingId = params.id;
  const username = params.username;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [counterTime, setCounterTime] = useState("");
  const [counterMessage, setCounterMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const toUtcIso = (localDateTime: string) => {
    const parsed = new Date(localDateTime);
    return Number.isNaN(parsed.getTime()) ? localDateTime : parsed.toISOString();
  };

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

  const submitClientAction = async (action: "accept" | "decline" | "counter") => {
    if (!booking) return;
    setActionError("");
    setActionSuccess("");

    if (action === "counter" && !counterTime) {
      setActionError("Please select a new date and time before sending counter.");
      return;
    }

    try {
      setActionLoading(true);
      const payload =
        action === "counter"
          ? {
              action,
              proposed_time: toUtcIso(counterTime),
              message: counterMessage,
            }
          : { action };
      const response = await api.post(
        `/api/bookings/${booking.id}/client-action/`,
        payload,
      );
      setBooking(response.data);
      setActionSuccess(
        action === "accept"
          ? "Counter accepted and appointment confirmed."
          : action === "decline"
            ? "Request declined and closed."
            : "Your counter proposal was sent.",
      );
      if (action === "counter") {
        setCounterTime("");
        setCounterMessage("");
      }
    } catch (error: unknown) {
      setActionError(getBackendErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

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
          {(() => {
            const statusInfo = getStatusInfo(booking);
            return (
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-3xl md:text-5xl w-[100%] font-black text-gray-900 dark:text-white uppercase tracking-tighter">
             #{booking.ticket_id}
            </h1>
            <span
              className={` text-center w-[80%] px-4 py-2 border-2 border-black font-black text-sm uppercase rounded-full ${statusInfo.badgeClass}`}
            >
              {statusInfo.label}
            </span>
          </div>
            );
          })()}

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 border-2 border-black rounded-xl">
              <p className="text-xs font-black uppercase tracking-widest text-[#EF9D39] dark:text-zinc-400 mb-1">
                Current state
              </p>
              <p className="font-bold text-black dark:text-white">
                {getStatusInfo(booking).helperText}
              </p>
            </div>


          <div>
              <label className="text-xs font-black text-[#EF9D39] uppercase tracking-widest block mb-2">
                Assigned Handyman
              </label>
              <div className="text-xl font-bold uppercase">
                {booking.handyman_name || "No Handyman assigned yet"}
              </div>
            </div>



            <div>
              <label className="text-xs font-black text-[#EF9D39] uppercase tracking-widest block mb-2">
                Service Type
              </label>
              <div className="text-xl font-bold uppercase">
                {booking.service_type}
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-[#EF9D39] uppercase tracking-widest block mb-2">
                Description
              </label>
              <div className="p-4 bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-xl font-bold">
                {booking.description}
              </div>
            </div>

            <div className="p-5 border-2 border-black rounded-xl bg-white dark:bg-zinc-900">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-3">
                Scheduling timeline
              </p>
              <div className="space-y-2 text-sm font-bold">
                <p>
                  Your proposed time:{" "}
                  <span className="text-[#EF9D39]">
                    {formatDateTime(booking.client_proposed_time || booking.scheduled_time)}
                  </span>
                </p>
                {booking.client_counter_message && (
                  <p>
                    Your message:{" "}
                    <span className="text-[#EF9D39]">
                      {booking.client_counter_message}
                    </span>
                  </p>
                )}
                <p>
                  Expert counter time:{" "}
                  <span className="text-[#EF9D39]">
                    {formatDateTime(booking.handyman_proposed_time)}
                  </span>
                </p>
                {booking.handyman_counter_message && (
                  <p>
                    Expert message:{" "}
                    <span className="text-[#EF9D39]">
                      {booking.handyman_counter_message}
                    </span>
                  </p>
                )}
                <p>
                  Final confirmed time:{" "}
                  <span className="text-[#EF9D39]">
                    {formatDateTime(
                      booking.status === "accepted" || booking.negotiation_status === "agreed"
                        ? booking.scheduled_time
                        : null,
                    )}
                  </span>
                </p>
              </div>
            </div>

            {booking.negotiation_status === "awaiting_client" &&
              booking.status !== "cancelled" && (
                <div className="p-6 bg-[#FFF8EA] dark:bg-zinc-800/60 border-2 border-black rounded-xl space-y-4">
                  <h3 className="font-black uppercase tracking-tight text-lg text-black dark:text-white">
                    Expert sent a counter-offer
                  </h3>
                  <p className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                    Review the proposed time above. You can accept it, decline this
                    request, or send a new time.
                  </p>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest mb-2 block text-gray-500 dark:text-zinc-400">
                      Your counter time (optional unless countering)
                    </label>
                    <input
                      type="datetime-local"
                      value={counterTime}
                      onChange={(e) => setCounterTime(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border-2 border-black p-3 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest mb-2 block text-gray-500 dark:text-zinc-400">
                      Message to expert (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={counterMessage}
                      onChange={(e) => setCounterMessage(e.target.value)}
                      placeholder="Could you do a little earlier/later?"
                      className="w-full bg-white dark:bg-zinc-900 border-2 border-black p-3 rounded-xl font-bold"
                    />
                  </div>

                  {actionError && (
                    <p className="text-sm font-black text-red-600">{actionError}</p>
                  )}
                  {actionSuccess && (
                    <p className="text-sm font-black text-green-700 dark:text-green-400">
                      {actionSuccess}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      disabled={actionLoading}
                      onClick={() => submitClientAction("accept")}
                      className="border-2 border-black bg-[#EF9D39] text-black py-3 rounded-xl font-black uppercase text-xs tracking-wider hover:translate-y-0.5 transition-all disabled:opacity-60"
                    >
                      {actionLoading ? <Loader2 className="mx-auto animate-spin" size={16} /> : "Accept"}
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => submitClientAction("decline")}
                      className="border-2 border-black bg-white dark:bg-zinc-900 text-black dark:text-white py-3 rounded-xl font-black uppercase text-xs tracking-wider hover:translate-y-0.5 transition-all disabled:opacity-60"
                    >
                      Decline
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => submitClientAction("counter")}
                      className="border-2 border-black bg-black text-white py-3 rounded-xl font-black uppercase text-xs tracking-wider hover:translate-y-0.5 transition-all disabled:opacity-60"
                    >
                      Send Counter
                    </button>
                  </div>
                </div>
              )}

            {/* Handyman Contact Card */}
            {(booking.status === "accepted" || booking.negotiation_status === "agreed") && (
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