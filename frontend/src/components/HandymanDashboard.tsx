"use client";

import React, { useEffect, useState } from "react";
import api from "../../lib/axios";
import { Clock, Briefcase, CheckCircle, Loader2, CalendarIcon, X, Send } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../app/datepicker-custom.css";

interface Booking {
  id: number;
  handyman: number | null;
  client_name: string;
  service_type: string;
  description: string;
  scheduled_time: string | null;
  client_proposed_time: string | null;
  client_counter_message: string | null;
  handyman_proposed_time: string | null;
  handyman_counter_message: string | null;
  status: string;
  negotiation_status: string;
}

export default function HandymanDashboard() {
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [isCalendarOpenFor, setIsCalendarOpenFor] = useState<number | null>(null);
  const [counterValues, setCounterValues] = useState<
    Record<number, { proposedTime: Date | null; message: string }>
  >({});
  const [counterOpenFor, setCounterOpenFor] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string>("");

  const formatDateTime = (value: string | Date | null) => {
  if (!value) return "Not set";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Invalid date";

  // Koristimo Intl.DateTimeFormat za čist dd/mm/yy HH:mm format
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Ovo uklanja AM/PM i postavlja 24h format
  }).format(date).replace(",", ""); // Uklanja zarez između datuma i vremena ako se pojavi
};

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/bookings/dashboard/");
      setJobs(response.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDateSelect = (jobId: number, date: Date | null) => {
    setCounterValues((prev) => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        proposedTime: date,
      },
    }));
  };

  const handleAcceptJob = async (jobId: number) => {
    try {
      setActionError("");
      setActionLoadingId(jobId);
      const job = jobs.find((item) => item.id === jobId);
      if (!job) return;

      if (job.handyman) {
        await api.post(`/api/bookings/${jobId}/handyman-action/`, { action: "accept" });
      } else {
        await api.post(`/api/bookings/accept/${jobId}//`);
      }
      await fetchJobs();
    } catch (error) {
      setActionError("Failed to accept job.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineJob = async (jobId: number) => {
    try {
      setActionError("");
      setActionLoadingId(jobId);
      await api.post(`/api/bookings/${jobId}/handyman-action/`, { action: "decline" });
      await fetchJobs();
    } catch (error) {
      setActionError("Failed to decline request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCounterJob = async (jobId: number) => {
    const value = counterValues[jobId];
    if (!value?.proposedTime) {
      setActionError("Please select a counter date and time first.");
      return;
    }

    try {
      setActionError("");
      setActionLoadingId(jobId);
      await api.post(`/api/bookings/${jobId}/handyman-action/`, {
        action: "counter",
        proposed_time: value.proposedTime.toISOString(),
        message: value.message || "",
      });
      setCounterOpenFor(null);
      await fetchJobs();
    } catch (error) {
      setActionError("Failed to send counter-offer.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingJobs = jobs.filter((j) => j.status === "pending");
  const acceptedJobs = jobs.filter((j) => j.status === "accepted");

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 mt-10">
      <div>
        <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
          <Clock className="text-[#EF9D39]" strokeWidth={3} /> Available Requests
        </h2>
        {actionError && <p className="mb-4 text-sm font-black uppercase text-red-500">{actionError}</p>}
        
        <div className="grid gap-4">
          {pendingJobs.length > 0 ? (
            pendingJobs.map((job) => (
              <div key={job.id} className="bg-white dark:bg-zinc-800 border-[3px] border-black p-5 rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#EF9D39]">{job.service_type}</span>
                    <h3 className="font-black text-lg uppercase leading-tight dark:text-white">{job.client_name}</h3>
                    <p className="text-sm font-bold text-gray-500">{job.description}</p>
                    {job.client_proposed_time && (
                      <p className="text-xs font-black uppercase text-blue-500">
                        Client requested: {formatDateTime(job.client_proposed_time)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <button 
                      onClick={() => handleAcceptJob(job.id)} 
                      disabled={actionLoadingId === job.id}
                      className="bg-white text-black px-5 py-2.5 rounded-[20px] font-black uppercase text-[10px] border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:bg-green-400 transition-all"
                    >
                      Accept
                    </button>
                    {job.handyman && (
                      <>
                        <button onClick={() => handleDeclineJob(job.id)} className="bg-white text-black px-5 py-2.5 rounded-[20px] font-black uppercase text-[10px] border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:bg-red-300 transition-all">Deny</button>
                        <button 
                          onClick={() => setCounterOpenFor(counterOpenFor === job.id ? null : job.id)}
                          className="bg-white text-black px-5 py-2.5 rounded-[20px] font-black uppercase text-[10px] border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#EF9D39] transition-all"
                        >
                          Counter
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {counterOpenFor === job.id && (
                  <div className="mt-4 border-2 border-black rounded-xl bg-[#FFF8EA] dark:bg-zinc-900 p-4 space-y-4">
                    <div>
                      <label className="text-xs font-black uppercase mb-2 block text-gray-500">Pick New Time</label>
                      <div 
                        onClick={() => setIsCalendarOpenFor(job.id)}
                        className="relative cursor-pointer w-full bg-white dark:bg-zinc-800 border-2 p-4 pl-12 rounded-xl font-bold border-black"
                      >
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        {counterValues[job.id]?.proposedTime ? formatDateTime(counterValues[job.id].proposedTime) : "SELECT DATE & TIME"}
                      </div>
                    </div>

                    {isCalendarOpenFor === job.id && (
                      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in h-full fade-in duration-200">
              <div className="bg-white dark:bg-zinc-900 border-4 border-black rounded-[40px] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] p-10 max-w-2xl w-full relative flex flex-col items-center">
 <button 
                  type="button" // Eksplicitno type="button" da ne trigeruje submit
                  onClick={() => setIsCalendarOpenFor(null)}
                  className="absolute top-6 right-6 p-2 bg-black text-white rounded-full hover:bg-[#EF9D39] hover:text-black transition-all"
                >
                  <X size={24} />
                </button>

                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black uppercase dark:text-white tracking-tighter">Pick a term for {job.client_name}</h2>
                  <p className="text-[#EF9D39] font-black uppercase tracking-[0.2em] text-sm">Choose your termin</p>
                </div> 
                 <div className="flex justify-center w-full overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl border-2 border-black/10 dark:border-white/10 p-4">
                                  <DatePicker
                            selected={counterValues[job.id]?.proposedTime}
                                                                onChange={(date: Date | null) => handleDateSelect(job.id, date)}

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
                  onClick={() => setIsCalendarOpenFor(null)}
                  className="mt-10 bg-[#EF9D39] border-4 border-black px-16 py-4 rounded-2xl font-black uppercase text-lg shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  Confirm Choice
                </button>
                        </div>
                      </div>
                    )}

                    <textarea
                      rows={2}
                      placeholder="Message to client..."
                      value={counterValues[job.id]?.message || ""}
                      onChange={(e) => setCounterValues(prev => ({ ...prev, [job.id]: { ...prev[job.id], message: e.target.value } }))}
                      className="w-full bg-white dark:bg-zinc-800 border-2 border-black rounded-xl p-3 font-bold"
                    />

                    <button
                      onClick={() => handleCounterJob(job.id)}
                      className="cursor-pointer w-full bg-black text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_#EF9D39]"
                    >
                      Send Counter Offer
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="italic text-gray-400">No pending requests.</p>
          )}
        </div>
      </div>

      {/* ACTIVE JOBS */}
      <div>
        <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
          <Briefcase className="text-blue-500" strokeWidth={3} /> My Active Jobs
        </h2>
        <div className="grid gap-4">
          {acceptedJobs.map((job) => (
            <div key={job.id} className="bg-blue-50 dark:bg-zinc-800 border-[3px] border-blue-500 p-5 rounded-2xl flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)]">
              <div>
                <h3 className="font-black text-lg uppercase dark:text-white">{job.client_name}</h3>
                <p className="text-sm font-bold text-blue-600">{formatDateTime(job.scheduled_time)}</p>
              </div>
              <CheckCircle className="text-blue-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}