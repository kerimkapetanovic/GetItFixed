"use client";

import React, { useEffect, useState } from "react";
// Import the custom api instance instead of raw axios
import api from "../../lib/axios";
import { Clock, Briefcase, CheckCircle, Loader2 } from "lucide-react";

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
  const [counterOpenFor, setCounterOpenFor] = useState<number | null>(null);
  const [counterValues, setCounterValues] = useState<
    Record<number, { proposedTime: string; message: string }>
  >({});
  const [actionError, setActionError] = useState<string>("");
  const toUtcIso = (localDateTime: string) => {
    const parsed = new Date(localDateTime);
    return Number.isNaN(parsed.getTime()) ? localDateTime : parsed.toISOString();
  };

  const formatDateTime = (value: string | null) => {
    if (!value) return "Not set";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleString();
  };

  // 1. FETCH JOBS
  const fetchJobs = async () => {
    try {
      setLoading(true);
      // Using the custom 'api' instance automatically handles cookies and the baseURL
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

  // 2. ACCEPT JOB LOGIC
  const handleAcceptJob = async (jobId: number) => {
    try {
      setActionError("");
      setActionLoadingId(jobId);
      const job = jobs.find((item) => item.id === jobId);
      if (!job) return;

      if (job.handyman) {
        await api.post(`/api/bookings/${jobId}/handyman-action/`, {
          action: "accept",
        });
      } else {
        await api.post(`/api/bookings/accept/${jobId}/`);
      }

      // Refresh the list so the job moves from 'Available' to 'Active'
      await fetchJobs();
    } catch (error) {
      console.error("Error accepting job:", error);
      setActionError("Failed to accept job. It may no longer be available.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineJob = async (jobId: number) => {
    try {
      setActionError("");
      setActionLoadingId(jobId);
      await api.post(`/api/bookings/${jobId}/handyman-action/`, {
        action: "decline",
      });
      await fetchJobs();
    } catch (error) {
      console.error("Error declining job:", error);
      setActionError("Failed to decline this request.");
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
        proposed_time: toUtcIso(value.proposedTime),
        message: value.message || "",
      });
      setCounterOpenFor(null);
      await fetchJobs();
    } catch (error) {
      console.error("Error sending counter:", error);
      setActionError("Failed to send counter-offer.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingJobs = jobs.filter((j) => j.status === "pending");
  const acceptedJobs = jobs.filter((j) => j.status === "accepted");

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );

        const getMinDateTime = () => {
          const now = new Date();
          now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
          return now.toISOString().slice(0, 16);
    };


  return (
    <div className="space-y-8 mt-10">
      {/* AVAILABLE JOBS */}
      <div>
        <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
          <Clock className="text-[#EF9D39]" strokeWidth={3} /> Available
          Requests
        </h2>
        {actionError && (
          <p className="mb-4 text-sm font-black uppercase text-red-500">{actionError}</p>
        )}
        <div className="grid gap-4">
          {pendingJobs.length > 0 ? (
            pendingJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-zinc-800 border-[3px] border-black p-5 rounded-2xl text-gray-900 dark:text-zinc-100 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#EF9D39]">
                      {job.service_type}
                    </span>
                    <h3 className="font-black text-lg uppercase leading-tight">
                      {job.client_name}
                    </h3>
                    <p className="text-sm font-bold text-gray-500 dark:text-zinc-400">
                      {job.description}
                    </p>
                    {job.client_proposed_time && (
                      <p className="text-xs font-black uppercase tracking-wide text-blue-500">
                        Client requested: {formatDateTime(job.client_proposed_time)}
                      </p>
                    )}
                    {job.client_counter_message && (
                      <p className="text-xs font-bold text-gray-600 dark:text-zinc-300">
                        Client note: {job.client_counter_message}
                      </p>
                    )}
                    {job.negotiation_status === "awaiting_client" && (
                      <p className="text-xs font-black uppercase tracking-wide text-purple-500">
                        Waiting for client response to your counter.
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <button
                      onClick={() => handleAcceptJob(job.id)}
                      disabled={actionLoadingId === job.id}
                      className="bg-white text-black px-5 py-2.5 rounded-[20px] font-black uppercase text-[10px] tracking-[0.2em] border-[3px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-[#EF9D39] transition-all disabled:opacity-60"
                    >
                      {actionLoadingId === job.id ? "Working..." : "Accept"}
                    </button>

                    {job.handyman && (
                      <>
                        <button
                          onClick={() => handleDeclineJob(job.id)}
                          disabled={actionLoadingId === job.id}
                          className="bg-white text-black px-5 py-2.5 rounded-[20px] font-black uppercase text-[10px] tracking-[0.2em] border-[3px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-red-300 transition-all disabled:opacity-60"
                        >
                          Deny
                        </button>
                        <button
                          onClick={() =>
                            setCounterOpenFor(counterOpenFor === job.id ? null : job.id)
                          }
                          disabled={actionLoadingId === job.id}
                          className="bg-white text-black px-5 py-2.5 rounded-[20px] font-black uppercase text-[10px] tracking-[0.2em] border-[3px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-[#EF9D39] transition-all disabled:opacity-60"
                        >
                          Counter
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {counterOpenFor === job.id && job.handyman && (
                  <div className="mt-4 border-2 border-black rounded-xl bg-[#FFF8EA] dark:bg-zinc-900 p-4 space-y-3">
                    <h4 className="font-black uppercase text-sm tracking-wide text-black dark:text-white">
                      Send Counter Offer
                    </h4>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 block mb-1">
                        Proposed date and time
                      </label>
                      <input
                        type="datetime-local"
                        min={getMinDateTime()}
                        value={counterValues[job.id]?.proposedTime || ""}
                        onChange={(e) =>
                          setCounterValues((prev) => ({
                            ...prev,
                            [job.id]: {
                              proposedTime: e.target.value,
                              message: prev[job.id]?.message || "",
                            },
                          }))
                        }
                        className="w-full bg-white dark:bg-zinc-800 border-2 border-black rounded-xl p-3 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 block mb-1">
                        Message to client (optional)
                      </label>
                      <textarea
                        rows={3}
                        value={counterValues[job.id]?.message || ""}
                        onChange={(e) =>
                          setCounterValues((prev) => ({
                            ...prev,
                            [job.id]: {
                              proposedTime: prev[job.id]?.proposedTime || "",
                              message: e.target.value,
                            },
                          }))
                        }
                        placeholder="I can come later the same day..."
                        className="w-full bg-white dark:bg-zinc-800 border-2 border-black rounded-xl p-3 font-bold"
                      />
                    </div>
                    <button
                      onClick={() => handleCounterJob(job.id)}
                      disabled={actionLoadingId === job.id}
                      className="w-full bg-black text-white px-5 py-3 rounded-[16px] font-black uppercase text-[10px] tracking-[0.2em] border-[3px] border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-60"
                    >
                      Send Counter To Client
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="font-bold text-gray-400 dark:text-zinc-500 italic">
              No pending requests in your area.
            </p>
          )}
        </div>
      </div>

      {/* ACTIVE JOBS */}
      <div>
        <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
          <Briefcase className="text-blue-500" strokeWidth={3} /> My Active Jobs
        </h2>
        <div className="grid gap-4">
          {acceptedJobs.length > 0 ? (
            acceptedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-blue-50 dark:bg-zinc-800 border-[3px] border-blue-500 p-5 rounded-2xl text-gray-900 dark:text-zinc-100 shadow-[5px_5px_0px_0px_rgba(59,130,246,0.5)] flex justify-between items-center"
              >
                <div>
                  <h3 className="font-black text-lg uppercase">
                    {job.client_name}
                  </h3>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-300">
                    {formatDateTime(job.scheduled_time)}
                  </p>
                </div>
                <CheckCircle className="text-blue-500" />
              </div>
            ))
          ) : (
            <p className="font-bold text-gray-400 dark:text-zinc-500 italic">
              You have not accepted any jobs yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
