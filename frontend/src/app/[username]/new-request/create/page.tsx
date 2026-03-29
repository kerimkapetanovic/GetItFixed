"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import api from "../../../../../lib/axios";
import { Calendar, FileText, Send, Loader2 } from "lucide-react";

function BookingFormContent() {
  const params = useParams() as { username: string };
  const searchParams = useSearchParams();
  const router = useRouter();

  const username = params.username;
  const handymanIdFromUrl = searchParams
    ? searchParams.get("handyman_id")
    : null;
  const serviceTypeFromUrl = searchParams
    ? searchParams.get("service_type")
    : null;
  const handymanNameFromUrl = searchParams
    ? searchParams.get("handyman_name")
    : null;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_type: serviceTypeFromUrl || "General",
    description: "",
    scheduled_time: "",
    handyman_id: "", // Start empty
    handyman_name: handymanNameFromUrl || "",
  });
  const isDirectBooking = Boolean(formData.handyman_id);
  const toUtcIso = (localDateTime: string) => {
    const parsed = new Date(localDateTime);
    return Number.isNaN(parsed.getTime()) ? localDateTime : parsed.toISOString();
  };
  const getErrorMessage = (error: unknown) => {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: unknown }).response === "object"
    ) {
      const response = (error as { response?: { data?: unknown } }).response;
      if (response?.data) {
        return JSON.stringify(response.data);
      }
    }
    return "Server error";
  };

  // Sync URL parameter to state when the component mounts
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      handyman_id: handymanIdFromUrl || "",
      service_type: serviceTypeFromUrl || prev.service_type || "General",
      handyman_name: handymanNameFromUrl || prev.handyman_name,
    }));
  }, [handymanIdFromUrl, serviceTypeFromUrl, handymanNameFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // We send 'handyman_id' which your backend view is now programmed to catch
      const response = await api.post("/api/bookings/create/", {
        service_type: formData.service_type,
        description: formData.description,
        scheduled_time: toUtcIso(formData.scheduled_time),
        handyman_id: formData.handyman_id || null,
      });

      console.log("Booking created:", response.data);
      router.push(`/${username}/requests`);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error("Booking failed details:", message);
      alert("Booking Error: " + message);
    } finally {
      setLoading(false);
    }
  };
      const getMinDateTime = () => {
          const now = new Date();
          now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
          return now.toISOString().slice(0, 16);
    };

  return (
    <main className="flex-grow max-w-3xl mx-auto p-6 py-12 w-full">
      <div className="bg-white dark:bg-zinc-900 border-2 border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[32px]">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 text-black dark:text-white text-center">
          Create New <span className="text-[#EF9D39]">Booking</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-[#FFF8EA] dark:bg-zinc-800/60 border-2 border-black rounded-xl">
            <p className="text-xs font-black uppercase tracking-widest mb-1 text-gray-500 dark:text-zinc-400">
              Selected expert
            </p>
            <p className="text-lg font-black uppercase text-black dark:text-white">
              {formData.handyman_name || `Expert #${formData.handyman_id || "-"}`}
            </p>
            <p className="mt-1 text-sm font-bold uppercase text-[#EF9D39]">
              Service: {formData.service_type}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest mb-2 block text-gray-500 dark:text-zinc-400">
              Problem Description
            </label>
            <div className="relative text-gray-900 dark:text-zinc-100">
              <FileText
                className="absolute left-4 top-4 text-gray-400"
                size={20}
              />
              <textarea
                required
                placeholder="Explain what needs to be fixed..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-black p-4 pl-12 rounded-xl font-bold min-h-[150px] outline-none focus:ring-2 focus:ring-[#EF9D39] dark:text-white"
              />
            </div>
          </div>

          {/* Preferred arrival time */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest mb-2 block text-gray-500 dark:text-zinc-400">
              Preferred visit date and time
            </label>
            <div className="relative text-gray-900 dark:text-zinc-100">
              <Calendar
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 "
                size={20}
              />
              <input
                required
                type="datetime-local"
                min={getMinDateTime()}
                value={formData.scheduled_time}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_time: e.target.value })
                }
                className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-black p-4 pl-12 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#EF9D39] dark:text-white"
              />
            </div>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
              This will be sent as your requested appointment time.
            </p>
          </div>

          {isDirectBooking && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 rounded-xl flex items-center gap-3">
              <div className="bg-yellow-400 p-2 rounded-lg text-black font-black">PRO</div>
              <p className="text-sm font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-tight">
                Direct request sent to this expert. Status will stay waiting until they respond.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full border-[3px] border-black bg-white text-black py-5 rounded-[20px] font-black uppercase text-xs tracking-[0.2em] shadow-[8px_8px_0px_0px_#000] transition-all flex items-center justify-center gap-2 hover:translate-x-1 hover:translate-y-1 hover:bg-[#EF9D39] hover:shadow-none active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:bg-white disabled:hover:shadow-[8px_8px_0px_0px_#000]"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
            Confirm Booking
          </button>
        </form>
      </div>
    </main>
  );
}

export default function NewBookingPage() {
  return (
    <div className="page-gradient min-h-screen dark:text-white bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Header />
      <Suspense
        fallback={
          <div className="flex-grow flex items-center justify-center font-black uppercase">
            Loading Form...
          </div>
        }
      >
        <BookingFormContent />
      </Suspense>
      <Footer />
    </div>
  );
}
