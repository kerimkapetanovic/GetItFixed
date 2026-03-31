"use client";

import React, { useState, useEffect } from "react";
import api from "../../../../lib/axios";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths 
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, X, Clock, User, MessageSquare,Ticket, Wrench, CalendarCheck } from "lucide-react";

import { BookingDetail } from "@/types/booking";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<BookingDetail | null>(null);


  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/api/bookings/dashboard/");
        setBookings(res.data);
      } catch (err) {
        console.error("Greška pri dohvatanju podataka:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "--:--";
    return format(new Date(dateStr), "HH:mm");
  };
  const handymanName = bookings.length > 0 
  ? bookings[0].handyman_name || "Unknown Expert" 
  : "Loading...";

  const renderHeader = () => (
    <div className="flex items-center mb-6 bg-white dark:bg-zinc-900 border-[3px] border-black p-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
      <button 
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} 
        className="p-2 border-2 border-black rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-[3px_3px_0px_0px_#000] active:shadow-none bg-white dark:bg-zinc-900 z-10"
      >
        <ChevronLeft size={24} className="dark:text-white" />
      </button>

      <div className="flex-grow flex flex-col items-center justify-center text-center">
  {/* Container za ikonu i mjesec */}
  <div className="flex items-center gap-3">
    <CalendarCheck size={32} className="text-black dark:text-white shrink-0" strokeWidth={3} />
    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter dark:text-white">
      {format(currentMonth, "MMMM yyyy")}
    </h2>
  </div>
        <span className="text-[14px] font-black text-[#EF9D39] uppercase tracking-[0.3em] mt-1">
          Master Schedule: {handymanName}
        </span>
      </div>

      <button 
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} 
        className="p-2 border-2 border-black rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-[3px_3px_0px_0px_#000] active:shadow-none bg-white dark:bg-zinc-900 z-10"
      >
        <ChevronRight size={24} className="dark:text-white" />
      </button>
    </div>
  );

  return (
    <div className="page-gradient bg-[#EF9D39] flex flex-col min-h-screen text-black dark:text-white selection:bg-black selection:text-white font-sans">
      <Header />
      
      <main className="flex-grow max-w-6xl w-full mx-auto p-4 mt-4 mb-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[50vh]"><Loader2 className="animate-spin text-[#EF9D39]" size={40} /></div>
        ) : (
          <>
            {renderHeader()}
            
            <div className="grid grid-cols-7 mb-2 px-2 text-center font-black uppercase text-[10px] text-gray-400">
              {/* Promijenjen redoslijed labela: Mon prvi */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 border-[3px] border-black rounded-2xl overflow-hidden bg-black gap-[2px] shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]">
              {eachDayOfInterval({ 
                // Postavljeno weekStartsOn: 1 za ponedjeljak
                start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }), 
                end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }) 
              }).map((day, idx) => {
                const dayBookings = bookings.filter(b => isSameDay(new Date(b.scheduled_time || b.client_proposed_time || ""), day));
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <div key={idx} className={`min-h-[110px] p-2 ${isCurrentMonth ? "bg-white dark:bg-zinc-800" : "bg-zinc-50 dark:bg-zinc-900 opacity-30"}`}>
                    <span className={`text-sm font-black ${isSameDay(day, new Date()) ? "bg-[#EF9D39] px-1.5 rounded-md border-2 border-black shadow-[2px_2px_2px_0px_#000]" : "dark:text-white"}`}>
                      {format(day, "d")}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayBookings.map(b => (
                        <div 
                          key={b.id}
                          onClick={() => setSelectedJob(b)}
                          className={`text-[9px] p-1.5 border-2 border-black font-bold rounded-lg cursor-pointer shadow-[2px_2px_0px_0px_#000] dark:text-black font-bold hover:translate-y-0.5 hover:shadow-none transition-all ${b.status === 'accepted' ? 'bg-blue-300' : 'bg-orange-300'}`}
                        >
                          <div className="flex justify-between font-black border-b border-black/10 mb-0.5 text-[8px]">
                             <span>{formatTime(b.scheduled_time || b.client_proposed_time)}</span>
                             <div className="flex items-center gap-1">
                             <span className="">{b.ticket_id}</span>
                             </div>

                             <span className="uppercase text-[7px] opacity-70">Details</span>
                          </div>
                          <div className="truncate uppercase leading-tight">{b.client_name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* DETAILS MODAL OSTAJE ISTI */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border-[4px] border-black p-8 rounded-[32px] shadow-[15px_15px_0px_0px_#000] max-w-md w-full relative animate-in zoom-in-95 duration-200">
          <div className="relative mb-8 text-center">
  <span className="bg-white text-black border-black border-[2px] dark:bg-black dark:text-white dark:border-none px-6 py-2 rounded-xl font-black uppercase text-xl tracking-tighter shadow-[5px_5px_0px_0px_rgba(239,157,57,1)] inline-block">
    Request Details
  </span>
  <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#EF9D39] rounded-full border-2 border-black -z-10 animate-pulse"></div>
</div>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-4 p-3 border-2 border-black rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <User className="text-[#EF9D39] shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500">Client Name</p>
                  <p className="font-bold dark:text-white uppercase">{selectedJob.client_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 border-2 border-black rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <Ticket className="text-violet-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500">Ticket ID</p>
                  <p className="font-bold dark:text-white">{selectedJob.ticket_id}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 border-2 border-black rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <Wrench className="text-rose-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500">Service Type</p>
                  <p className="font-bold dark:text-white uppercase">{selectedJob.service_type}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 border-2 border-black rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <Clock className="text-blue-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500">Scheduled Time</p>
                  <p className="font-bold dark:text-white">{format(new Date(selectedJob.scheduled_time || selectedJob.client_proposed_time || ""), "PPP p")}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 border-2 border-black rounded-xl bg-[#FFF8EA]  dark:bg-zinc-800">
                <MessageSquare className="text-green-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500">Issue Description</p>
                  <p className="text-sm font-bold dark:text-white">{selectedJob.description}</p>
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedJob(null)} className="cursor-pointer w-full mt-8 bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-[5px_5px_0px_0px_#EF9D39] active:translate-y-1 active:shadow-none transition-all">Close</button>
          </div>
        </div>
      )}

      {/* --- DODAJ OVU SEKCIJU ODMAH ISPOD ZATVARANJA </main> TAGA --- */}

<section className="max-w-6xl w-full mx-auto px-4 mb-10">
  <div className="bg-white dark:bg-zinc-900 border-[3px] border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-black dark:text-white mb-4 flex items-center gap-2">
      <span className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse"></span>
      Status Legend
    </h3>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* WAITING */}
      <div className="flex items-center gap-3 p-2 border-2 border-black rounded-xl bg-orange-300 shadow-[3px_3px_0px_0px_#000]">
        <div className="w-4 h-4 rounded-full border-2 border-black bg-white"></div>
        <span className="text-[10px] font-black uppercase text-black">Waiting</span>
      </div>

      {/* ACCEPTED */}
      <div className="flex items-center gap-3 p-2 border-2 border-black rounded-xl bg-blue-300 shadow-[3px_3px_0px_0px_#000]">
        <div className="w-4 h-4 rounded-full border-2 border-black bg-white"></div>
        <span className="text-[10px] font-black uppercase text-black">Accepted</span>
      </div>

      {/* IN PROGRESS */}
      <div className="flex items-center gap-3 p-2 border-2 border-black rounded-xl bg-violet-400 shadow-[3px_3px_0px_0px_#000]">
        <div className="w-4 h-4 rounded-full border-2 border-black bg-white"></div>
        <span className="text-[10px] font-black uppercase text-black">In Progress</span>
      </div>

      {/* COMPLETED */}
      <div className="flex items-center gap-3 p-2 border-2 border-black rounded-xl bg-green-400 shadow-[3px_3px_0px_0px_#000]">
        <div className="w-4 h-4 rounded-full border-2 border-black bg-white"></div>
        <span className="text-[10px] font-black uppercase text-black">Completed</span>
      </div>
    </div>
  </div>
</section>

<Footer />


      <Footer />
    </div>
  );
}