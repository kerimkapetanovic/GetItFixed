"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import api from "../../../../lib/axios";
import {
  Wrench,
  ShieldAlert,
  Users,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useRequireRole } from "@/lib/useRequireRole";

interface ServiceMetric {
  service_type: string;
  total_pros: number;
  active_pros: number;
}

export default function AdminServicesPage() {
  const { checking } = useRequireRole(["admin"]);
  const [metrics, setMetrics] = useState<ServiceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const response = await api.get("/api/bookings/admin/services/");
        setMetrics(response.data);
      } catch (err: any) {
        console.error("Failed to load services info:", err);
        setError(
          err.response?.data?.detail || "Access denied or server error.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, []);
        if (checking) return null;


  return (
    <div className="min-h-screen dark:text-white bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto p-6 py-12 w-full">
        <div className="mb-8">
          <span className="text-xs font-black uppercase tracking-widest text-[#EF9D39]">
            Administrative Workspace
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tighter mt-1">
            Marketplace <span className="text-[#EF9D39]">Services</span>
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Monitor provider supply and active category allocation across the
            platform.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[#EF9D39]" size={40} />
          </div>
        ) : error ? (
          <div className="border-2 border-black p-6 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-2xl font-bold flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <ShieldAlert size={24} />
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((service, index) => (
              <div
                key={index}
                className="bg-white dark:bg-zinc-900 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black capitalize tracking-tight text-black dark:text-white">
                      {service.service_type}
                    </h3>
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 border border-black rounded-xl">
                      <Wrench size={18} className="text-[#EF9D39]" />
                    </div>
                  </div>

                  <hr className="border-zinc-200 dark:border-zinc-800 my-4" />

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-gray-500 flex items-center gap-2">
                        <Users size={16} /> Total Providers:
                      </span>
                      <span className="text-black dark:text-white">
                        {service.total_pros}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-gray-500 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />{" "}
                        Active Supply:
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        {service.active_pros}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs font-black uppercase text-gray-400 tracking-wider">
                  <span>Status</span>
                  {service.active_pros > 0 ? (
                    <span className="text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-1 border border-green-600 rounded-md">
                      Healthy Supply
                    </span>
                  ) : (
                    <span className="text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 border border-amber-600 rounded-md">
                      No Active Pros
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
