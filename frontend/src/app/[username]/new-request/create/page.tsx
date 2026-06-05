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
import { addMinutes, isWithinInterval } from "date-fns";

function BookingFormContent() {
  const params = useParams() as { username: string };
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState("");
  const [busySlots, setBusySlots] = useState<{ start: Date, end: Date }[]>([]);

  const username = params.username;
  const handymanIdFromUrl = searchParams ? searchParams.get("handyman_id") : null;
  const serviceTypeFromUrl = searchParams ? searchParams.get("service_type") : null;
  const handymanNameFromUrl = searchParams ? searchParams.get("handyman_name") : null;

  const [formData, setFormData] = useState({
    service_type: serviceTypeFromUrl || "General",
    description: "",
    scheduled_time: null as Date | null,
    handyman_id: handymanIdFromUrl || "",
    handyman_name: handymanNameFromUrl || "",
    is_urgent: false,
    attachments: [] as File[],

  });

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.scheduled_time) {
      alert("Please select a preferred visit time before confirming.");
      setIsCalendarOpen(true);
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("service_type", formData.service_type);
      data.append("description", formData.description);
      data.append("scheduled_time", formData.scheduled_time!.toISOString());
      if (formData.handyman_id) data.append("handyman_id", formData.handyman_id);
      data.append("is_urgent", String(formData.is_urgent));
      formData.attachments.forEach((file) => data.append("attachments", file));

      const res = await api.post("/api/bookings/create/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.ticket_id) {
        setGeneratedTicket(res.data.ticket_id);
        setShowSuccess(true);
      } else {
        router.push(`/${username}/requests`);
      }
    } catch (err: unknown) {
      alert("Booking Error: Failed to create request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.handyman_id) {
      api.get(`/api/bookings/busy-slots/${formData.handyman_id}/`)
        .then(res => {
          // Pretvaramo stringove iz baze u prave JS Date objekte
          const slots = res.data.map((slot: any) => ({
            start: new Date(slot.scheduled_time),
            // Kraj je start + trajanje + buffer
            end: addMinutes(new Date(slot.scheduled_time), (slot.duration_minutes || 60) + 25), // 25 min buffer
          }));
          setBusySlots(slots);
        })
        .catch(err => console.error("Error fetching busy slots", err));
    }
  }, [formData.handyman_id]);

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

          {/* FILE UPLOAD */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest mb-2 block text-gray-500 dark:text-zinc-400">
              Photos / Videos (optional)
            </label>
            <div
              onClick={() => document.getElementById('file-upload')?.click()}
              className="relative cursor-pointer w-full bg-gray-50 dark:bg-zinc-800 border-2 border-dashed border-black p-6 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#FFF8EA] transition-all"
            >
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const MAX_SIZE = 100 * 1024 * 1024;
                const MAX_SINGLE = 50 * 1024 * 1024;

                const oversized = files.filter(f => f.size > MAX_SINGLE);
                if (oversized.length > 0) {
                  alert(`These files are too large (max 50MB per file):\n${oversized.map(f => f.name).join('\n')}`);
                  return;
                }

                const combined = [...formData.attachments, ...files];

                if (combined.length > 5) {
                  alert("Maximum 5 files allowed.");
                  return;
                }

                const totalSize = combined.reduce((sum, f) => sum + f.size, 0);
                if (totalSize > MAX_SIZE) {
                  alert("Total upload size exceeds 100MB. Please reduce the number of files.");
                  return;
                }

                setFormData({ ...formData, attachments: combined });
                e.target.value = ''; 
}}
              />
              <span className="text-3xl">📎</span>
              <p className="font-black uppercase text-sm text-gray-500">Click to attach photos or videos</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">JPG, PNG, MP4, MOV supported</p>
            </div>

            {/* Preview */}
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.attachments.map((file, idx) => (
                  <div key={idx} className="relative border-2 border-black rounded-xl overflow-hidden w-20 h-20">
                    {file.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="relative w-full h-full">
                        <video
                          src={URL.createObjectURL(file)}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-lg">▶</span>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        attachments: formData.attachments.filter((_, i) => i !== idx)
                      })}
                      className="cursor-pointer absolute top-0 right-0 bg-black text-white w-5 h-5 flex items-center justify-center text-xs"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
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
          {/* URGENT TOGGLE SECTION */}
          <div
            onClick={() => setFormData({ ...formData, is_urgent: !formData.is_urgent })}
            className={`p-4 border-2 border-black rounded-xl cursor-pointer transition-all flex items-center justify-between ${formData.is_urgent
              ? "bg-red-50 dark:bg-red-900/20 border-red-600 shadow-[4px_4px_0px_0px_#dc2626]"
              : "bg-gray-50 dark:bg-zinc-800"
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-black ${formData.is_urgent ? 'bg-red-600 text-white' : 'bg-white text-gray-400'}`}>
                <span className="font-black">!</span>
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight text-black dark:text-white">Is this urgent?</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Surcharge applies for immediate response</p>
              </div>
            </div>

            {/* Custom Slide Toggle */}
            <div className={`w-12 h-6 rounded-full border-2 border-black relative transition-colors ${formData.is_urgent ? 'bg-red-500' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white border-2 border-black rounded-full transition-all ${formData.is_urgent ? 'left-6' : 'left-0.5'}`} />
            </div>
          </div>
          {/* MODAL POPUP */}
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
                  <h2 className="text-3xl font-black uppercase dark:text-white tracking-tighter">Pick a term for {formData.handyman_name}</h2>
                  <p className="text-[#EF9D39] font-black uppercase tracking-[0.2em] text-sm">Choose your termin</p>
                </div>

                <div className="flex justify-center w-full overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl border-2 border-black/10 dark:border-white/10 pt-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full border-[3px] border-black bg-white text-black py-5 rounded-[20px] font-black uppercase text-xs tracking-[0.2em] shadow-[8px_8px_0px_0px_#000] transition-all flex items-center justify-center gap-2 hover:bg-[#EF9D39] hover:shadow-none active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            Confirm Booking
          </button>
        </form>
      </div> {/* Ovaj DIV zatvara onaj glavni beli kontejner sa senkom */}
      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 border-[4px] border-black p-10 rounded-[40px] shadow-[20px_20px_0px_0px_#EF9D39] max-w-sm w-full text-center relative animate-in zoom-in-95">

            {/* IKONA */}
            <div className="w-20 h-20 bg-[#EF9D39] border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[5px_5px_0px_0px_#000]">
              <Send className="text-black ml-1" size={32} />
            </div>

            {/* GLAVNI NASLOV SA BROJEM TIKETA */}
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4 dark:text-white leading-tight">
              Booking Sent! <br />
              <span className="text-[#EF9D39]">#{generatedTicket}</span>
            </h2>

            {/* PODNASLOV */}
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-8">
              Your request has been received. <br /> Check your dashboard for updates.
            </p>

            {/* DUGME */}
            <button
              onClick={() => router.push(`/${username}/requests`)}
              className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-tighter border-2 border-black hover:bg-zinc-800 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all"
            >
              Back to My Requests
            </button>
          </div>
        </div>
      )}
    </main> // <-- Ovo je taj tag iznad kojeg ubacuješ
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