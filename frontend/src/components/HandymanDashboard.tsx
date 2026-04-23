"use client";

import React, { useEffect, useState } from "react";
import api from "../../lib/axios";
import { Clock, Briefcase, CheckCircle, Loader2, CalendarIcon, X, Send, Timer, ArrowUpRight } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../app/datepicker-custom.css";
import { BookingDetail } from "@/types/booking";
import { JobTimer } from "@/components/JobTimer";
import { useParams } from "next/navigation";

import Link from "next/link";

// --- POMOĆNA KOMPONENTA ZA TAJMER ---


export default function HandymanDashboard() {
  const params = useParams() as { username: string };
  const username = params.username;
  const [acceptOpenFor, setAcceptOpenFor] = useState<number | null>(null);
  const [jobs, setJobs] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [isCalendarOpenFor, setIsCalendarOpenFor] = useState<number | null>(null);
  const [counterValues, setCounterValues] = useState<
    Record<number, { proposedTime: Date | null; message: string; duration: number }>
  >({});
  const [counterOpenFor, setCounterOpenFor] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string>("");

  const updateJobValue = (jobId: number, field: string, value: any) => {
    setCounterValues((prev) => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        [field]: value,
      },
    }));
  };

  const formatDateTime = (value: string | Date | null) => {
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
    updateJobValue(jobId, "proposedTime", date);
  };

  const handleAcceptJob = async (jobId: number) => {
    const duration = counterValues[jobId]?.duration;
    if (!duration || duration <= 0) {
      setActionError("Please specify duration in minutes before accepting.");
      return;
    }

    try {
      setActionError("");
      setActionLoadingId(jobId);
      const job = jobs.find((item) => item.id === jobId);
      if (!job) return;

      const payload = { action: "accept", duration_minutes: duration };

      if (job.handyman_name) {
        await api.post(`/api/bookings/${jobId}/handyman-action/`, payload);
      } else {
        await api.post(`/api/bookings/accept/${jobId}/`, { duration_minutes: duration });
      }

      setAcceptOpenFor(null);
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

  const handleExpire = async (jobId: number) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, status: "cancelled" } : job
      )
    );

    try {
      console.log(`Job #${jobId} has officially expired.`);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleCounterJob = async (jobId: number) => {
    const value = counterValues[jobId];
    if (!value?.proposedTime) {
      setActionError("Please select a counter date and time first.");
      return;
    }

    // NOVA PROVJERA: Trajanje mora postojati i biti veće od 0
    if (!value?.duration || value.duration <= 0) {
      setActionError("Please specify the estimated duration for the counter offer.");
      return;
    }

    if (!value?.message || value.message.trim() === "") {
      setActionError("Please include a message for the client with your counter offer.");
      return;
    }

    try {
      setActionError("");
      setActionLoadingId(jobId);
      await api.post(`/api/bookings/${jobId}/handyman-action/`, {
        action: "counter",
        proposed_time: value.proposedTime.toISOString(),
        duration_minutes: value.duration,
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
  const cancelledJobs = jobs.filter((j) => j.status === "cancelled" || j.status === "declined");

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 mt-10 p-4 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2 text-black dark:text-white">
          <Clock className="text-[#EF9D39]" strokeWidth={3} /> Available Requests
        </h2>
        {actionError && <p className="mb-4 text-sm font-black uppercase text-red-500">{actionError}</p>}

        <div className="grid gap-4">
          {pendingJobs.length > 0 ? (
            pendingJobs.map((job) => (
              <div
                key={job.id}
                className={`relative bg-white dark:bg-zinc-800 border-[3px] p-5 rounded-2xl transition-all ${job.is_urgent
                  ? "border-red-600 shadow-[8px_8px_0px_0px_#dc2626] bg-red-50/30"
                  : "border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                  }`}
              >
                {/* HITNI BEDŽ */}
                {job.is_urgent && (
                  <div className="absolute -top-3 -right-3 bg-red-600 text-white px-3 py-1 rounded-lg font-black uppercase text-[10px] border-2 border-black animate-bounce shadow-[3px_3px_0px_0px_#000]">
                    Urgent +50% BAM
                  </div>
                )}

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  {/* LIJEVA STRANA: INFO O POSLU */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="bg-black text-[#EF9D39] px-2 py-0.5 rounded-md font-black text-[12px] tracking-widest uppercase">
                        #{job.ticket_id}
                      </span>
                      <JobTimer expiresAt={job.expires_at}
                        onExpire={() => handleExpire(job.id)} />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-[#EF9D39]">
                        🔧 {job.service_type}
                      </span>
                      <h3 className="font-black text-lg uppercase leading-tight dark:text-white">
                        {job.client_name}
                      </h3>
                      <p className="text-sm font-bold text-gray-500">{job.description}</p>
                    </div>

                    {job.client_proposed_time && (
                      <p className="text-xs font-black uppercase text-blue-500">
                        Client requested: {formatDateTime(job.client_proposed_time)}
                      </p>
                    )}
                  </div>

                  {/* DESNA STRANA: AKCIJE ILI STATUS */}
                  <div className="flex flex-wrap gap-2 md:justify-end md:w-[40%]">

                    <div className="flex justify-end mt-4">
                      <Link
                        href={`/${username}/dashboard/${job.id}`}
                        className="group flex items-center gap-4 border-[3px] border-black bg-white px-6 py-3 font-black uppercase text-xs tracking-[0.2em] shadow-[8px_8px_0px_0px_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-[#EF9D39] hover:shadow-none"
                        style={{ borderRadius: "20px" }}
                      >
                        <span className="text-black">View Details</span>
                        <span className="flex items-center justify-center rounded-full bg-black p-1.5 transition-colors group-hover:bg-white">
                          <ArrowUpRight
                            size={16}
                            className="text-white transition-transform group-hover:rotate-45 group-hover:text-black"
                          />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="italic text-gray-400">No pending requests.</p>
          )}
        </div>
      </div>

      {/* --- MY ACTIVE JOBS --- */}
      <div>
        <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2 text-black dark:text-white">
          <Briefcase className="text-blue-500" strokeWidth={3} /> My Active Jobs
        </h2>
        <div className="grid gap-4">
          {acceptedJobs.length > 0 ? (
            acceptedJobs.map((job) => (
              <div key={job.id} className="bg-white dark:bg-zinc-800 border-[3px] border-blue-500 p-5 rounded-2xl flex justify-between items-center shadow-[5px_5px_0px_0px_#3b82f6]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-500 text-white px-2 py-0.5 rounded-md font-black text-[10px] uppercase">
                      #{job.ticket_id}
                    </span>
                    <span className="text-[10px] font-black uppercase text-blue-500">
                      🔧 {job.service_type}
                    </span>
                  </div>
                  <h3 className="font-black text-lg uppercase dark:text-white leading-tight">{job.client_name}</h3>
                  <p className="text-sm font-bold text-gray-500 line-clamp-1">{job.description}</p>
                  <p className="text-xs font-black uppercase text-blue-600 flex items-center gap-1">
                    <Timer size={12} /> {formatDateTime(job.scheduled_time)}
                  </p>
                </div>

                {/* Desna strana: Confirmed + View Details */}
                <div className="flex flex-col items-center gap-3 shrink-0 ml-4">
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle className="text-blue-500" size={28} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase text-blue-500">Confirmed</span>
                  </div>
                  <Link
                    href={`/${username}/dashboard/${job.id}`}
                    className="group flex items-center gap-2 border-[3px] border-black bg-white px-4 py-2 font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_#3b82f6] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-blue-500 hover:shadow-none rounded-[20px]"
                  >
                    <span className="text-black group-hover:text-white">View Details</span>
                    <span className="flex items-center justify-center rounded-full bg-black p-1 transition-colors group-hover:bg-white">
                      <ArrowUpRight size={12} className="text-white transition-transform group-hover:rotate-45 group-hover:text-black" />
                    </span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="italic text-gray-400 font-bold uppercase text-xs">No active jobs yet.</p>
          )}
        </div>
      </div>

      {/* --- REJECTED / DENIED JOBS --- */}
      <div className="opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
        <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <X className="text-red-500" strokeWidth={3} /> Rejected Requests
        </h2>
        <div className="grid gap-3">
          {cancelledJobs.length > 0 ? (
            cancelledJobs.map((job) => (
              <div key={job.id} className="bg-gray-50 dark:bg-zinc-900 border-[3px] border-gray-300 p-4 rounded-2xl flex justify-between items-center border-dashed">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-black text-[10px] uppercase">
                      #{job.ticket_id}
                    </span>
                  </div>
                  <h3 className="font-black text-md uppercase text-gray-500">
                    {job.client_name}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    🔧 {job.service_type}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase bg-red-100 text-red-600 px-2 py-1 rounded-md border border-red-200">
                    {job.status === "cancelled" ? "Expired" : "Declined"}                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="italic text-gray-400 font-bold uppercase text-xs">No rejected history.</p>
          )}
        </div>
      </div>
    </div>
  );
}