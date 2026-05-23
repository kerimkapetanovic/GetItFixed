"use client";

import React, { useEffect, useState } from "react";
import api from "../../lib/axios";
import { Clock, Briefcase, CheckCircle, Loader2, CalendarIcon, X, Send, Timer, ArrowUpRight, AlertCircle } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../app/datepicker-custom.css";
import { BookingDetail } from "@/types/booking";
import { JobTimer } from "@/components/JobTimer";
import { useParams } from "next/navigation";

import Link from "next/link";

type DashboardFilterId = "all" | "available" | "active" | "rejected";

const DASHBOARD_FILTERS: {
  id: DashboardFilterId;
  label: string;
  badgeClass?: string;
}[] = [
  { id: "all", label: "All" },
  { id: "available", label: "Available Requests", badgeClass: "bg-[#EF9D39] text-black" },
  { id: "active", label: "My Active Jobs", badgeClass: "bg-blue-400 text-black" },
  { id: "rejected", label: "Rejected Requests", badgeClass: "bg-red-400 text-black" },
];

function isRejectedJob(job: BookingDetail) {
  return job.status === "cancelled" || job.negotiation_status === "declined";
}

function isAvailableJob(job: BookingDetail) {
  return job.status === "pending" && !isRejectedJob(job);
}

function isAwaitingClientOffer(job: BookingDetail) {
  return job.negotiation_status === "awaiting_client" && !isRejectedJob(job);
}

function isActiveJob(job: BookingDetail) {
  return (
    [
      "accepted",
      "in_progress",
      "visit_completed",
      "visit_fee_pending",
      "visit_fee_paid",
      "quote_pending_client",
      "funds_locked",
      "handyman_done",
      "not_completed",
      "awaiting_payment",
      "paid",
      "closed",
      "completed",
    ].includes(job.status) && !isRejectedJob(job)
  );
}

function getJobCategory(job: BookingDetail): Exclude<DashboardFilterId, "all"> {
  if (isRejectedJob(job)) return "rejected";
  if (isAvailableJob(job)) return "available";
  if (isActiveJob(job)) return "active";
  return "rejected";
}

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
  const [activeFilter, setActiveFilter] = useState<DashboardFilterId>("all");

  const updateJobValue = (jobId: number, field: string, value: unknown) => {
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
    try {
      const res = await api.post(`/api/bookings/${jobId}/expire/`);
      const updated = res.data.booking ?? res.data;
      setJobs((prevJobs) =>
        prevJobs.map((job) => (job.id === jobId ? { ...job, ...updated } : job))
      );
      if (res.data.result === "declined") {
        await fetchJobs();
      }
    } catch (error) {
      console.error("Expire failed:", error);
      await fetchJobs();
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

  const pendingJobs = jobs.filter(isAvailableJob);
  const acceptedJobs = jobs.filter(isActiveJob);
  const rejectedJobs = jobs.filter(isRejectedJob);

  const filterCounts = DASHBOARD_FILTERS.reduce(
    (acc, filter) => {
      if (filter.id === "all") {
        acc.all = jobs.length;
      } else {
        acc[filter.id] = jobs.filter((j) => getJobCategory(j) === filter.id).length;
      }
      return acc;
    },
    {} as Record<DashboardFilterId, number>
  );

  const showAvailable = activeFilter === "all" || activeFilter === "available";
  const showActive = activeFilter === "all" || activeFilter === "active";
  const showRejected = activeFilter === "all" || activeFilter === "rejected";

  const cardStyle = { borderRadius: "24px" };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 mt-10 p-4 max-w-6xl mx-auto">
      {jobs.length > 0 && (
        <div
          className="w-full bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4"
          style={cardStyle}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DASHBOARD_FILTERS.map((filter) => {
              const isActive = activeFilter === filter.id;
              const count = filterCounts[filter.id];
              const colorClass =
                filter.id === "all"
                  ? isActive
                    ? "bg-[#EF9D39] text-black"
                    : "bg-zinc-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                  : filter.badgeClass ?? "";

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`w-full px-2 py-2 border-2 border-black font-black text-[10px] uppercase rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-[1.02] ${colorClass} ${
                    isActive
                      ? "ring-2 ring-black ring-offset-2 ring-offset-white dark:ring-offset-zinc-900"
                      : "opacity-90"
                  }`}
                >
                  <span className="block leading-tight">{filter.label}</span>
                  <span className="block text-[9px] opacity-90">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showAvailable && (
      <div>
        <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2 text-black dark:text-white">
          <Clock className="text-[#EF9D39]" strokeWidth={3} /> Available Requests
        </h2>
        {actionError && <p className="mb-4 text-sm font-black uppercase text-red-500">{actionError}</p>}

        <div className="grid gap-4">
          {pendingJobs.length > 0 ? (
            pendingJobs.map((job) => {
              const awaitingClient = isAwaitingClientOffer(job);
              return (
              <div
                key={job.id}
                className={`relative bg-white dark:bg-zinc-800 border-[3px] p-5 rounded-2xl transition-all ${
                  job.is_urgent && !awaitingClient
                    ? "border-red-600 shadow-[8px_8px_0px_0px_#dc2626] bg-red-50/30"
                    : awaitingClient
                      ? "border-purple-500 shadow-[5px_5px_0px_0px_#a855f7]"
                      : "border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                {job.is_urgent && !awaitingClient && (
                  <div className="absolute -top-3 -right-3 bg-red-600 text-white px-3 py-1 rounded-lg font-black uppercase text-[10px] border-2 border-black animate-bounce shadow-[3px_3px_0px_0px_#000]">
                    Urgent +50% BAM
                  </div>
                )}

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-black text-[12px] tracking-widest uppercase ${
                          awaitingClient
                            ? "bg-purple-500 text-white"
                            : "bg-black text-[#EF9D39]"
                        }`}
                      >
                        #{job.ticket_id}
                      </span>
                      <JobTimer expiresAt={job.expires_at}
                        onExpire={() => handleExpire(job.id)} />
                    </div>

                    <div className="flex flex-col">
                      <span
                        className={`text-[10px] font-black uppercase ${
                          awaitingClient ? "text-purple-500" : "text-[#EF9D39]"
                        }`}
                      >
                        🔧 {job.service_type}
                      </span>
                      <h3 className="font-black text-lg uppercase leading-tight dark:text-white">
                        {job.client_name}
                      </h3>
                      <p className="text-sm font-bold text-gray-500">{job.description}</p>
                    </div>

                    {awaitingClient ? (
                      <p className="text-xs font-black uppercase text-purple-500">
                        Offer sent — waiting for client to confirm
                      </p>
                    ) : (
                      job.client_proposed_time && (
                        <p className="text-xs font-black uppercase text-blue-500">
                          Client requested: {formatDateTime(job.client_proposed_time)}
                        </p>
                      )
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 md:justify-end md:w-[40%]">
                    {awaitingClient && (
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <AlertCircle className="text-purple-500" size={28} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase text-purple-500">
                          Awaiting Client
                        </span>
                      </div>
                    )}
                    <Link
                      href={`/${username}/dashboard/${job.id}`}
                      className={`group flex items-center gap-4 border-[3px] border-black bg-white px-6 py-3 font-black uppercase text-xs tracking-[0.2em] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                        awaitingClient
                          ? "shadow-[8px_8px_0px_0px_#a855f7] hover:bg-purple-400"
                          : "shadow-[8px_8px_0px_0px_#000] hover:bg-[#EF9D39]"
                      }`}
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
            );
            })
          ) : (
            <p className="italic text-gray-400">No pending requests.</p>
          )}
        </div>
      </div>
      )}

      {showActive && (
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
                    <span className="text-[10px] font-black uppercase text-blue-500">
                      {job.status === "accepted"
                        ? "Confirmed"
                        : job.status === "in_progress"
                          ? "In Progress"
                          : job.status === "visit_completed"
                            ? "Visit Completed"
                            : job.status === "visit_fee_pending"
                              ? "Visit Fee Pending"
                              : job.status === "visit_fee_paid"
                                ? "Visit Fee Paid"
                                : job.status === "quote_pending_client"
                                  ? "Quote Pending Client"
                                  : job.status === "funds_locked"
                                    ? "Funds Locked"
                          : job.status === "handyman_done"
                            ? "Awaiting Client"
                            : job.status === "awaiting_payment"
                              ? "Awaiting Payment"
                              : job.status === "paid"
                                ? "Paid"
                                : job.status === "closed"
                                  ? "Closed"
                                  : job.status === "not_completed"
                                    ? "Not Completed"
                                    : "Active"}
                    </span>
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
      )}

      {showRejected && (
      <div className="opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
        <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <X className="text-red-500" strokeWidth={3} /> Rejected Requests
        </h2>
        <div className="grid gap-3">
          {rejectedJobs.length > 0 ? (
            rejectedJobs.map((job) => (
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
                    {job.status === "cancelled" && job.negotiation_status !== "declined"
                      ? "Expired"
                      : "Declined"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="italic text-gray-400 font-bold uppercase text-xs">No rejected history.</p>
          )}
        </div>
      </div>
      )}

      {activeFilter !== "all" &&
        ((activeFilter === "available" && pendingJobs.length === 0) ||
          (activeFilter === "active" && acceptedJobs.length === 0) ||
          (activeFilter === "rejected" && rejectedJobs.length === 0)) && (
          <p className="text-center font-bold text-gray-500 dark:text-zinc-400 uppercase text-sm py-8">
            No requests in this category.
          </p>
        )}
    </div>
  );
}