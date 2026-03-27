"use client";

import React, { useEffect, useState } from "react";
// Import the custom api instance instead of raw axios
import api from "../../lib/axios";
import { Clock, Briefcase, CheckCircle, Loader2 } from "lucide-react";

interface Booking {
  id: number;
  client_name: string;
  service_type: string;
  description: string;
  scheduled_time: string;
  status: string;
}

export default function HandymanDashboard() {
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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
      await api.post(`/api/bookings/accept/${jobId}/`);
      // Refresh the list so the job moves from 'Available' to 'Active'
      fetchJobs();
    } catch (error) {
      console.error("Error accepting job:", error);
      alert("Failed to accept job. It might have been taken by someone else.");
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

  return (
    <div className="space-y-8 mt-10">
      {/* AVAILABLE JOBS */}
      <div>
        <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
          <Clock className="text-[#EF9D39]" strokeWidth={3} /> Available
          Requests
        </h2>
        <div className="grid gap-4">
          {pendingJobs.length > 0 ? (
            pendingJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-zinc-800 border-[3px] border-black p-5 rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center"
              >
                <div>
                  <span className="text-[10px] font-black uppercase text-[#EF9D39]">
                    {job.service_type}
                  </span>
                  <h3 className="font-black text-lg uppercase leading-tight">
                    {job.client_name}
                  </h3>
                  <p className="text-sm font-bold text-gray-500">
                    {job.description}
                  </p>
                </div>
                <button
                  onClick={() => handleAcceptJob(job.id)}
                  className="bg-black text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] hover:bg-[#EF9D39] hover:text-black transition-all border-2 border-black"
                >
                  Accept Job
                </button>
              </div>
            ))
          ) : (
            <p className="font-bold text-gray-400 italic">
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
                className="bg-blue-50 dark:bg-zinc-800 border-[3px] border-blue-500 p-5 rounded-2xl shadow-[5px_5px_0px_0px_rgba(59,130,246,0.5)] flex justify-between items-center"
              >
                <div>
                  <h3 className="font-black text-lg uppercase">
                    {job.client_name}
                  </h3>
                  <p className="text-sm font-bold text-blue-600">
                    {new Date(job.scheduled_time).toLocaleString()}
                  </p>
                </div>
                <CheckCircle className="text-blue-500" />
              </div>
            ))
          ) : (
            <p className="font-bold text-gray-400 italic">
              You haven't accepted any jobs yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
