"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
// Make sure this path points correctly to your custom axios file!
import api from "../../../../../lib/axios";
import { Loader2,Check,X, AlertCircle, PlayCircle, Timer, CheckCircle2, Calendar as CalendarIcon, Send } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../../datepicker-custom.css";
import { addMinutes } from "date-fns";
import { BookingDetail } from "@/types/booking"; // Uvezi svoj centralni tip

export const formatDateTime = (value: string | Date | null) => {
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

 export function getStatusInfo(booking: BookingDetail) {
  // 1. CANCELLED / DECLINED
  if (booking.status === "cancelled" || booking.negotiation_status === "declined") {
    return {
      label: "Cancelled",
      badgeClass: "bg-red-400 text-black",
      helperText: "Request closed after decline.",
      icon: <X className="text-red-400 shrink-0" size={18} strokeWidth={3} />
    };
  }

  // 2. ACCEPTED / AGREED
  if (booking.status === "accepted" || booking.negotiation_status === "agreed") {
    return {
      label: "Accepted",
      badgeClass: "bg-blue-400 text-black",
      helperText: "Appointment confirmed with handyman.",
      icon: <Check className="text-blue-400 shrink-0" size={18} strokeWidth={3} />
    };
  }

  // 3. EXPERT COUNTERED (Awaiting Client)
  if (booking.negotiation_status === "awaiting_client") {
    return {
      label: "Expert Countered",
      badgeClass: "bg-purple-400 text-black",
      helperText: "Expert proposed a new time. Choose your response.",
      icon: <AlertCircle className="text-purple-400 shrink-0" size={18} strokeWidth={3} />
    };
  }

  // 4. IN PROGRESS (Dodaj ovaj status ako ga imaš u bazi)
  if (booking.status === "in_progress") {
    return {
      label: "In Progress",
      badgeClass: "bg-violet-400 text-black",
      helperText: "Expert is currently working on your request.",
      icon: <PlayCircle className="text-violet-400 shrink-0" size={18} strokeWidth={3} />
    };
  }

  // 5. COMPLETED (Dodaj ovaj status)
  if (booking.status === "completed") {
    return {
      label: "Completed",
      badgeClass: "bg-green-400 text-black",
      helperText: "Job finished! Thank you for using our service.",
      icon: <CheckCircle2 className="text-green-400 shrink-0" size={18} strokeWidth={3} />
    };
  }

  // DEFAULT: WAITING FOR RESPONSE
  return {
    label: "Waiting",
    badgeClass: "bg-yellow-400 text-black",
    helperText: "Waiting for expert to accept or counter your request.",
    icon: <Timer className="text-yellow-400 shrink-0" size={18} strokeWidth={3} />
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
const calculateTimeLeft = (expiresAt: string | null) => {
  if (!expiresAt) return 0;
  const expiryTime = new Date(expiresAt).getTime();
  const now = new Date().getTime();
  const difference = expiryTime - now;

  return difference <= 0 ? 0 : difference;
};

const formatMs = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
};


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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [busySlots, setBusySlots] = useState<{start: Date, end: Date}[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const toUtcIso = (localDateTime: string) => {
    const parsed = new Date(localDateTime);
    return Number.isNaN(parsed.getTime()) ? localDateTime : parsed.toISOString();
  };

  

  const filterPassedTime = (time: Date) => {
    const currentDate = new Date();
    if (time < currentDate) return false;

    return !busySlots.some(slot => {
      const checkTime = time.getTime();
      const startTime = new Date(slot.start).getTime();
      const endTime = new Date(slot.end).getTime();
      return checkTime >= startTime && checkTime <= endTime;
    });
  };
  useEffect(() => {
    // Ako nema bookinga ili je posao već prihvaćen/završen, ne treba nam tajmer
    if (!booking || booking.status === 'accepted' || booking.status === 'completed') {
       setTimeLeft(0);
       return;
    }

    const updateTimer = () => {
      const remaining = calculateTimeLeft(booking.expires_at);
      setTimeLeft(remaining);
      
      // Ako tajmer upravo istekne, osvježi podatke da se prikaže "Expired" status
      if (remaining === 0 && booking.expires_at) {
         // fetchBookingDetails(); // Opcionalno: tvoja funkcija za refresh
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [booking]);

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

  useEffect(() => {
    if (booking?.handyman_id) {
      api.get(`/api/bookings/busy-slots/${booking.handyman_id}/`)
        .then(res => {
          const slots = res.data.map((slot: any) => ({
            start: new Date(slot.scheduled_time),
            end: addMinutes(new Date(slot.scheduled_time), (slot.duration_minutes || 60) + 25),
          }));
          setBusySlots(slots);
        })
        .catch(err => console.error("Error fetching busy slots", err));
    }
  }, [booking?.handyman_id]);

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
              <div className="flex items-center justify-between gap-4 p-3 border-2 border-black rounded-xl bg-white dark:bg-zinc-800 ">
  <p className="font-bold text-sm text-black dark:text-white leading-tight">
    {getStatusInfo(booking).helperText}
  </p>
  <div className="shrink-0 p-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg border-2 border-black">
    {getStatusInfo(booking).icon}
  </div>
</div>
            </div>


          <div>
              <label className="text-xs font-black text-[#EF9D39] uppercase tracking-widest block mb-2">
                Handyman
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
                    minutes
                  </p>
                )}
                <p>
                  Expert counter time:{" "}
                  <span className="text-[#EF9D39]">
                    {formatDateTime(booking.handyman_proposed_time)}
                  </span>
                </p>
                
                <p>
                  Estimate time:{" "}
                  <span className="text-[#EF9D39]">
                    {(booking.duration_minutes)} minutes
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

            {/* Timer sekcija */}
{timeLeft > 0 && booking.status !== "accepted" && booking.status !== "completed" && (
  <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-500 rounded-2xl flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Timer className="text-orange-500 animate-pulse" size={24} />
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">
          Response Deadline
        </p>
        <p className="text-xl font-black text-black dark:text-white tabular-nums">
          {formatMs(timeLeft)}
        </p>
      </div>
    </div>
    {timeLeft < 15 * 60 * 1000 && ( // Ako je manje od 15 min
      <span className="text-[10px] bg-red-500 text-white px-2 py-1 rounded font-black uppercase animate-bounce">
        Expiring soon!
      </span>
    )}
  </div>
)}

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
                    <label className="text-xs font-black uppercase mb-2 block text-gray-500">Your counter time</label>
                    <div 
                      onClick={() => setIsCalendarOpen(true)}
                      className="relative cursor-pointer w-full bg-white dark:bg-zinc-800 border-2 p-4 pl-12 rounded-xl font-bold border-black"
                    >
                      <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      {counterTime 
                        ? new Date(counterTime).toLocaleString('de-DE', { hour12: false }) 
                        : "CLICK TO SELECT DATE & TIME"
                      }
                    </div>
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

                  {isCalendarOpen && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in h-full fade-in duration-200">
              <div className="bg-white dark:bg-zinc-900 border-4 border-black rounded-[40px] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] p-10 max-w-2xl w-full relative flex flex-col items-center">
                
                <button 
                  type="button" // Eksplicitno type="button" da ne trigeruje submit
                  onClick={() => setIsCalendarOpen(false)}
                  className="absolute top-6 right-6 p-2 bg-black text-white rounded-full hover:bg-[#EF9D39] hover:text-black transition-all"
                >
                  <X size={24} />
                </button>

                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black uppercase dark:text-white tracking-tighter">Pick a new time</h2>
                  <p className="text-[#EF9D39] font-black uppercase tracking-[0.2em] text-sm">Counter to expert's offer</p>
                </div>

                <div className="flex justify-center w-full overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl border-2 border-black/10 dark:border-white/10 pt-4">
                  <DatePicker
                    selected={counterTime ? new Date(counterTime) : null}
                    onChange={(date: Date | null) => {
                      setCounterTime(date ? date.toISOString() : "");
                    }}
                    inline
                    showTimeSelect
                    timeIntervals={5}
                    timeFormat="HH:mm"
                    dateFormat="dd.MM.yyyy HH:mm"
                    minDate={new Date()}
                    filterTime={filterPassedTime}
                    calendarClassName="popup-brutalist-calendar-final"
                    nextMonthButtonLabel=">"
                    previousMonthButtonLabel="<"
                  />
                </div>

                <button 
                  type="button" // Eksplicitno type="button"
                  onClick={() => setIsCalendarOpen(false)}
                  className="mt-10 bg-[#EF9D39] border-4 border-black px-16 py-4 rounded-2xl font-black uppercase text-lg shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  Confirm Choice
                </button>
              </div>
            </div>
          )}



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
                   <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-gray-100">
                    <div className="bg-yellow-100 p-2 rounded-lg border-2 border-yellow-300">
                      📞
                    </div>
                    <span className="font-bold text-gray-800 text-sm">
                      {booking.handyman_phone || "Contact info unavailable"}
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