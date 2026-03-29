"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import api from "../../../../../lib/axios";
import { Calendar as CalendarIcon, FileText, Send, Loader2 } from "lucide-react";

// --- DATEPICKER ---
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../../datepicker-custom.css";

function BookingFormContent() {
  const params = useParams() as { username: string };
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const username = params.username;
  const handymanIdFromUrl = searchParams ? searchParams.get("handyman_id") : null;
  const serviceTypeFromUrl = searchParams ? searchParams.get("service_type") : null;
  const handymanNameFromUrl = searchParams ? searchParams.get("handyman_name") : null;

  // scheduled_time je sada Date objekat umjesto stringa radi DatePickera
  const [formData, setFormData] = useState({
    service_type: serviceTypeFromUrl || "General",
    description: "",
    scheduled_time: new Date(), 
    handyman_id: handymanIdFromUrl || "", 
    handyman_name: handymanNameFromUrl || "",
  });

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      handyman_id: handymanIdFromUrl || "",
      service_type: serviceTypeFromUrl || prev.service_type || "General",
      handyman_name: handymanNameFromUrl || prev.handyman_name,
    }));
  }, [handymanIdFromUrl, serviceTypeFromUrl, handymanNameFromUrl]);

  const isDirectBooking = Boolean(formData.handyman_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/api/bookings/create/", {
        service_type: formData.service_type,
        description: formData.description,
        // Šaljemo ISO string u backend
        scheduled_time: formData.scheduled_time.toISOString(),
        handyman_id: formData.handyman_id || null,
      });

      console.log("Booking created:", response.data);
      router.push(`/${username}/requests`);
    } catch (err: unknown) {
      alert("Booking Error: Failed to create request.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="flex-grow max-w-3xl mx-auto p-6 py-12 w-full">
      <div className="bg-white dark:bg-zinc-900 border-2 border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[32px]">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 text-black dark:text-white text-center">
          Create New <span className="text-[#EF9D39]">Booking</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* EXPERT INFO BOX */}
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
              <FileText className="absolute left-4 top-4 text-gray-400" size={20} />
              <textarea
                required
                placeholder="Explain what needs to be fixed..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-black p-4 pl-12 rounded-xl font-bold min-h-[150px] outline-none focus:ring-2 focus:ring-[#EF9D39] dark:text-white"
              />
            </div>
          </div>

          {/* PREFERRED ARRIVAL TIME - NOVI DATEPICKER */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest mb-2 block text-gray-500 dark:text-zinc-400">
              Preferred visit date and time
            </label>
            <div className="relative brutalist-datepicker">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
              <DatePicker
                selected={formData.scheduled_time}
                onChange={(date: any) => setFormData({ ...formData, scheduled_time: date || new Date() })}
                showTimeSelect
                timeIntervals={5}
                // "HH:mm" prebacuje prikaz u inputu na 24h (npr. 15:00)
                dateFormat="dd.MM.yyyy HH:mm" 
                // "HH:mm" unutar timeFormat-a prebacuje samu listu vremena na 24h
                timeFormat="HH:mm"
                // Naslov iznad vremena
                timeCaption="Time"
                minDate={new Date()}
                popperPlacement="bottom-start"
                portalId="root-portal"
                className="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-black p-4 pl-12 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#EF9D39] dark:text-white"
              />
            </div>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
              This will be sent as your requested appointment time.
            </p>
          </div>

          {isDirectBooking && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 rounded-xl flex items-center gap-3">
              <div className="bg-yellow-400 p-2 rounded-lg text-black font-black text-xs">PRO</div>
              <p className="text-xs font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-tight">
                Direct request sent to this expert. Status will stay waiting until they respond.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border-[3px] border-black bg-white text-black py-5 rounded-[20px] font-black uppercase text-xs tracking-[0.2em] shadow-[8px_8px_0px_0px_#000] transition-all flex items-center justify-center gap-2 hover:translate-x-1 hover:translate-y-1 hover:bg-[#EF9D39] hover:shadow-none active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
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
      <Suspense fallback={<div className="flex-grow flex items-center justify-center font-black uppercase">Loading Form...</div>}>
        <BookingFormContent />
      </Suspense>
      <Footer />
    </div>
  );
}