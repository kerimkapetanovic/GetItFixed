"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import api from "../../../../lib/axios";
import {
  UserCheck,
  UserX,
  ShieldAlert,
  Loader2,
  Mail,
  Calendar,
  Hammer,
} from "lucide-react";
import { useRequireRole } from "@/lib/useRequireRole";

interface HandymanUser {
  id: number;
  name: string;
  email: string;
  service_type: string;
  is_active: boolean;
  verification_status: "pending" | "active" | "inactive";
  date_joined: string;
}

export default function AdminVerificationPage() {
    const { checking } = useRequireRole(["admin"]);
      
  const [providers, setProviders] = useState<HandymanUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  // Dodali smo filter state
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "pending" | "inactive"
  >("all");

  const fetchQueue = async () => {
    try {
      const response = await api.get("/api/bookings/admin/verification/");
      setProviders(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to load verification queue.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (
    userId: number,
    actionType: "approve" | "suspend" | "decline",
  ) => {
    setActionLoading(userId);
    try {
      await api.post(`/api/bookings/admin/verification/${userId}/action/`, {
        action: actionType,
      });
      fetchQueue(); // Ponovo učitaj listu da osvježi statuse
    } catch (err) {
      alert("Failed to modify user access permissions.");
    } finally {
      setActionLoading(null);
    }
  };

  // Logika za filtriranje
  const filteredProviders = providers.filter((p) => {
    if (activeFilter === "active") return p.verification_status === "active";
    if (activeFilter === "pending") return p.verification_status === "pending";
    if (activeFilter === "inactive") return p.verification_status === "inactive";
    return true;
  });
        if (checking) return null;


  return (
    <div className="min-h-screen dark:text-white bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Header />
      <main className="grow max-w-5xl mx-auto p-6 py-12 w-full">
        <div className="mb-8">
          <span className="text-xs font-black uppercase tracking-widest text-[#EF9D39]">
            Administrative Workspace
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tighter mt-1">
            Verification <span className="text-[#EF9D39]">Queue</span>
          </h1>

          {/* Filteri */}
          <div className="flex gap-2 mt-6">
            {(["all", "active", "pending", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-2 rounded-full font-black uppercase text-[10px] border-2 border-black ${
                  activeFilter === f
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[#EF9D39]" size={40} />
          </div>
        ) : error ? (
          <div className="border-2 border-black p-6 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center gap-3">
            <ShieldAlert size={24} />
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProviders.length === 0 ? (
              <p className="text-center font-bold text-gray-500 py-10">
                No providers found in this category.
              </p>
            ) : (
              filteredProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-white dark:bg-zinc-900 border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-black dark:text-white">
                        {provider.name}
                      </h3>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md border border-black ${
                          provider.verification_status === "active"
                            ? "bg-green-100 text-green-700"
                            : provider.verification_status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-zinc-200 text-zinc-700"
                        }`}
                      >
                        {provider.verification_status === "active"
                          ? "Active"
                          : provider.verification_status === "pending"
                            ? "Pending"
                            : "Inactive"}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-gray-500 space-y-0.5">
                      <p className="flex items-center gap-2">
                        <Mail size={14} /> {provider.email}
                      </p>
                      <p className="flex items-center gap-2 capitalize">
                        <Hammer size={14} /> Specialty:{" "}
                        <span className="text-black dark:text-zinc-300">
                          {provider.service_type}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar size={14} /> Joined:{" "}
                        {new Date(provider.date_joined).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    {provider.verification_status === "pending" ? (
                      <>
                        <button
                          disabled={actionLoading === provider.id}
                          onClick={() => handleAction(provider.id, "approve")}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border-2 border-black bg-green-500 hover:bg-green-600 text-white font-black uppercase text-xs rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-60"
                        >
                          {actionLoading === provider.id ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <UserCheck size={14} />
                          )}{" "}
                          Approve
                        </button>
                        <button
                          disabled={actionLoading === provider.id}
                          onClick={() => handleAction(provider.id, "decline")}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border-2 border-black bg-red-500 hover:bg-red-600 text-white font-black uppercase text-xs rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-60"
                        >
                          {actionLoading === provider.id ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <UserX size={14} />
                          )}{" "}
                          Decline
                        </button>
                      </>
                    ) : provider.verification_status === "active" ? (
                      <button
                        disabled={actionLoading === provider.id}
                        onClick={() => handleAction(provider.id, "suspend")}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border-2 border-black bg-red-500 hover:bg-red-600 text-white font-black uppercase text-xs rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-60"
                      >
                        {actionLoading === provider.id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <UserX size={14} />
                        )}{" "}
                        Suspend
                      </button>
                    ) : (
                      <button
                        disabled={actionLoading === provider.id}
                        onClick={() => handleAction(provider.id, "approve")}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border-2 border-black bg-green-500 hover:bg-green-600 text-white font-black uppercase text-xs rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-60"
                      >
                        {actionLoading === provider.id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <UserCheck size={14} />
                        )}{" "}
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
