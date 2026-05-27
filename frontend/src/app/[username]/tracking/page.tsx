"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import api from "../../../../lib/axios";
import {
  ListFilter,
  Loader2,
  Radio,
  ClipboardList,
  Clock,
  Lock,
} from "lucide-react";

interface Metrics {
  total_jobs: number;
  pending_jobs: number;
  escrow_locked: number;
  in_progress: number;
}

interface Booking {
  id: number;
  service_type: string;
  status: string;
  agreed_price: string;
  created_at: string;
}

export default function AdminTrackingPage() {
  const [data, setData] = useState<{
    metrics: Metrics;
    results: Booking[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const fetchTrackingData = async (statusFilter = "") => {
    try {
      const url = statusFilter
        ? `/api/bookings/admin/tracking/?status=${statusFilter}`
        : "/api/bookings/admin/tracking/";
      const response = await api.get(url);
      setData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData(selectedStatus);
  }, [selectedStatus]);

  return (
    <div className="min-h-screen dark:text-white bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Header />
      <main className="flex-grow max-w-5xl mx-auto p-6 py-12 w-full">
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#EF9D39]">
              Administrative Workspace
            </span>
            <h1 className="text-4xl font-black uppercase tracking-tighter mt-1">
              Platform <span className="text-[#EF9D39]">Tracking</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 border-2 border-black p-2 bg-white dark:bg-zinc-900 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ListFilter size={16} className="text-[#EF9D39]" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-bold text-xs uppercase outline-none cursor-pointer dark:text-white dark:bg-zinc-900"
            >
              <option value="">All Pipeline States</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="funds_locked">Funds Locked</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {loading || !data ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[#EF9D39]" size={40} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Structural Metrics Dash Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  title: "Total Volume",
                  val: data.metrics.total_jobs,
                  icon: <ClipboardList className="text-blue-500" />,
                },
                {
                  title: "Bidding Queue",
                  val: data.metrics.pending_jobs,
                  icon: <Radio className="text-amber-500" />,
                },
                {
                  title: "Active Builds",
                  val: data.metrics.in_progress,
                  icon: <Clock className="text-indigo-500" />,
                },
                {
                  title: "Escrow Frozen",
                  val: data.metrics.escrow_locked,
                  icon: <Lock className="text-emerald-500" />,
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-zinc-900 border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-black uppercase text-gray-400">
                      {card.title}
                    </p>
                    <p className="text-2xl font-black mt-1 text-black dark:text-white">
                      {card.val}
                    </p>
                  </div>
                  <div className="p-2 border border-black bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Platform Itemized Logs Table */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-800 text-xs font-black uppercase text-gray-500 border-b-2 border-black">
                    <th className="p-4">Ticket ID</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status Flag</th>
                    <th className="p-4">Agreed Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm font-bold">
                  {data.results.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="p-4 font-black text-[#EF9D39]">
                        GIT-#{job.id}
                      </td>
                      <td className="p-4 capitalize">{job.service_type}</td>
                      <td className="p-4">
                        <span className="text-xs uppercase px-2 py-0.5 border border-zinc-400 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded">
                          {job.status}
                        </span>
                      </td>
                      <td className="p-4 text-black dark:text-zinc-200">
                        {job.agreed_price
                          ? `${job.agreed_price} KM`
                          : "Negotiating"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
