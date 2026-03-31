"use client";

import React, { useState, useEffect } from "react";
import api from "../../../../lib/axios";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths 
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, X, Clock, User, MessageSquare } from "lucide-react";

interface Booking {
  id: number;
  client_name: string;
  service_type: string;
  description: string;
  scheduled_time: string | null;
  client_proposed_time: string | null;
  status: string;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Booking | null>(null);

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

  const renderHeader = () => (
    <div className="flex items-center mb-6 bg-white dark:bg-zinc-900 border-[3px] border-black p-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
      <button 
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} 
        className="p-2 border-2 border-black rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-[3px_3px_0px_0px_#000] active:shadow-none bg-white dark:bg-zinc-900 z-10"
      >
        <ChevronLeft size={24} className="dark:text-white" />
      </button>

      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-black uppercase tracking-tighter dark:text-white">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <span className="text-[10px] font-black text-[#EF9D39] uppercase tracking-[0.3em] mt-1">
          Master Schedule
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
    <div className="flex flex-col min-h-screen bg-[#FDFDFC] dark:bg-zinc-950">
      <Header />
      
      <main className="flex-grow max-w-6xl w-full mx-auto p-4 mt-4 mb-20">
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
                    <span className={`text-sm font-black ${isSameDay(day, new Date()) ? "bg-[#EF9D39] px-1.5 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_#000]" : "dark:text-white"}`}>
                      {format(day, "d")}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayBookings.map(b => (
                        <div 
                          key={b.id}
                          onClick={() => setSelectedJob(b)}
                          className={`text-[9px] p-1.5 border-2 border-black font-bold rounded-lg cursor-pointer shadow-[2px_2px_0px_0px_#000] hover:translate-y-0.5 hover:shadow-none transition-all ${b.status === 'accepted' ? 'bg-blue-300' : 'bg-orange-300'}`}
                        >
                          <div className="flex justify-between font-black border-b border-black/10 mb-0.5 text-[8px]">
                             <span>{formatTime(b.scheduled_time || b.client_proposed_time)}</span>
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
            <button onClick={() => setSelectedJob(null)} className="absolute top-6 right-6 p-2 bg-black text-white rounded-full hover:bg-red-500 transition-colors"><X size={20}/></button>
            
            <h3 className="text-2xl font-black uppercase mb-6 pr-8 dark:text-white leading-tight italic">Request Details</h3>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-4 p-3 border-2 border-black rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <User className="text-[#EF9D39] shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500">Client Name</p>
                  <p className="font-bold dark:text-white uppercase">{selectedJob.client_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 border-2 border-black rounded-xl">
                <Clock className="text-blue-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500">Scheduled Time</p>
                  <p className="font-bold dark:text-white">{format(new Date(selectedJob.scheduled_time || selectedJob.client_proposed_time || ""), "PPP p")}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 border-2 border-black rounded-xl bg-[#FFF8EA] dark:bg-zinc-800">
                <MessageSquare className="text-green-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500">Issue Description</p>
                  <p className="text-sm font-bold dark:text-white">{selectedJob.description}</p>
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedJob(null)} className="w-full mt-8 bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-[5px_5px_0px_0px_#EF9D39] active:translate-y-1 active:shadow-none transition-all">Close</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}