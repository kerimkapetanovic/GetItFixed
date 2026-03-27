"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import api from "../../../../../lib/axios";
import { Wrench, Calendar, FileText, Send, Loader2 } from "lucide-react";

function BookingFormContent() {
  const params = useParams() as { username: string };
  const searchParams = useSearchParams();
  const router = useRouter();

  const username = params.username;
  const handymanIdFromUrl = searchParams
    ? searchParams.get("handyman_id")
    : null;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_type: "Plumbing",
    description: "",
    scheduled_time: "",
    handyman_id: "", // Start empty
  });

  // Sync URL parameter to state when the component mounts
  useEffect(() => {
    if (handymanIdFromUrl) {
      setFormData((prev) => ({ ...prev, handyman_id: handymanIdFromUrl }));
    }
  }, [handymanIdFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // We send 'handyman_id' which your backend view is now programmed to catch
      const response = await api.post("/api/bookings/create/", {
        service_type: formData.service_type,
        description: formData.description,
        handyman_id: formData.handyman_id || null,
      });

      console.log("Booking created:", response.data);
      router.push(`/${username}/requests`);
    } catch (err: any) {
      console.error("Booking failed details:", err.response?.data);
      // Alerting the specific error from Django helps debugging a lot!
      alert(
        "Booking Error: " +
          JSON.stringify(err.response?.data || "Server error"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow max-w-3xl mx-auto p-6 py-12 w-full">
      <div className="bg-white dark:bg-zinc-900 border-2 border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[32px]">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 text-black dark:text-white">
          Create New <span className="text-[#EF9D39]">Booking</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Type */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest mb-2 block text-gray-500">
              Service Needed
            </label>
            <div className="relative text-black">
              <Wrench
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={formData.service_type}
                onChange={(e) =>
                  setFormData({ ...formData, service_type: e.target.value })
                }
                className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-black p-4 pl-12 rounded-xl font-bold appearance-none outline-none focus:ring-2 focus:ring-[#EF9D39] dark:text-white"
              >
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Mechanic">Mechanic</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Carpentry">Carpentry</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest mb-2 block text-gray-500">
              Problem Description
            </label>
            <div className="relative text-black">
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

          {/* Handyman Badge - Shows if we're booking someone specific */}
          {formData.handyman_id && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-yellow-400 p-2 rounded-lg text-black font-black">
                PRO
              </div>
              <p className="text-sm font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-tight">
                Direct booking for Expert ID: #{formData.handyman_id}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#EF9D39] text-black border-2 border-black py-5 rounded-2xl font-black uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
