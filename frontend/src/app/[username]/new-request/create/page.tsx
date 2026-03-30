"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import api from "../../../../../lib/axios";
import { Calendar as CalendarIcon, FileText, Send, Loader2, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../../datepicker-custom.css";

function BookingFormContent() {
  const params = useParams() as { username: string };
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const username = params.username;
  const handymanIdFromUrl = searchParams ? searchParams.get("handyman_id") : null;
  const serviceTypeFromUrl = searchParams ? searchParams.get("service_type") : null;
  const handymanNameFromUrl = searchParams ? searchParams.get("handyman_name") : null;

  const [formData, setFormData] = useState({
    service_type: serviceTypeFromUrl || "General",
    description: "",
    // POSTAVLJENO NA NULL - Da ne bude ništa izabrano po defaultu
    scheduled_time: null as Date | null, 
    handyman_id: handymanIdFromUrl || "", 
    handyman_name: handymanNameFromUrl || "",
  });

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDACIJA: Provjera da li je izabran datum
    if (!formData.scheduled_time) {
      alert("Please select a preferred visit time before confirming.");
      setIsCalendarOpen(true); // Otvori mu kalendar automatski ako je zaboravio
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/bookings/create/", {
        service_type: formData.service_type,
        description: formData.description,
        scheduled_time: formData.scheduled_time.toISOString(),
        handyman_id: formData.handyman_id || null,
      });
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

          {/* DATE PICKER TRIGGER */}
          <div>
            <label className="text-xs font-black uppercase mb-2 block text-gray-500">Preferred visit time</label>
            <div 
              onClick={() => setIsCalendarOpen(true)}
                                      className="relative cursor-pointer w-full bg-white dark:bg-zinc-800 border-2 p-4 pl-12 rounded-xl font-bold border-black"

            >
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              {formData.scheduled_time 
                ? formData.scheduled_time.toLocaleString('de-DE', { hour12: false }) 
                : "CLICK TO SELECT DATE & TIME"
              }
            </div>
          </div>

          {/* MODAL POPUP */}
          {isCalendarOpen && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in h-full fade-in duration-200">
              <div className="bg-white dark:bg-zinc-900 border-4 border-black rounded-[40px] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] p-10 max-w-2xl w-full relative flex flex-col items-center">
                
                <button 
                  type="button" // Eksplicitno type="button" da ne trigeruje submit
                  onClick={() => setIsCalendarOpen(false)}
                  className="absolute top-6 right-6 p-2 bg-black text-white rounded-full hover:bg-[#EF9D39] hover:text-black transition-all"
                >
                  <X size={24} />
                </button>

                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black uppercase dark:text-white tracking-tighter">Pick a term for {formData.handyman_name}</h2>
                  <p className="text-[#EF9D39] font-black uppercase tracking-[0.2em] text-sm">Choose your termin</p>
                </div>

                <div className="flex justify-center w-full overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl border-2 border-black/10 dark:border-white/10 p-4">
                  <DatePicker
                    selected={formData.scheduled_time}
                    onChange={(date: Date | null) => {
                      setFormData({ ...formData, scheduled_time: date });
                    }}
                    inline
                    showTimeSelect
                    timeIntervals={5}
                    timeFormat="HH:mm"
                    dateFormat="dd.MM.yyyy HH:mm"
                    minDate={new Date()}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full border-[3px] border-black bg-white text-black py-5 rounded-[20px] font-black uppercase text-xs tracking-[0.2em] shadow-[8px_8px_0px_0px_#000] transition-all flex items-center justify-center gap-2 hover:bg-[#EF9D39] hover:shadow-none active:scale-[0.98]"
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
      <Suspense fallback={<div>Loading...</div>}>
        <BookingFormContent />
      </Suspense>
      <Footer />
    </div>
  );
}