"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import api from "../../../../lib/axios";
import {
  Landmark,
  Loader2,
  ArrowUpRight,
  Calendar,
  Coins,
  User,
} from "lucide-react";

interface EscrowHoldData {
  id: number;
  booking: number;
  amount: string;
  status: string;
  created_at: string;
}

interface FinancialOverview {
  total_escrow_locked_systemwide: number;
  ledger: EscrowHoldData[];
}

export default function AdminFinancesPage() {
  const [data, setData] = useState<FinancialOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/bookings/admin/finances/")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen dark:text-white bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Header />
      <main className="flex-grow max-w-5xl mx-auto p-6 py-12 w-full">
        <div className="mb-8">
          <span className="text-xs font-black uppercase tracking-widest text-[#EF9D39]">
            Financial Intelligence
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tighter mt-1">
            Ecosystem <span className="text-[#EF9D39]">Finances</span>
          </h1>
        </div>

        {loading || !data ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[#EF9D39]" size={40} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Macro Capital Balance Lock Panel */}
            <div className="bg-white dark:bg-zinc-900 text-white p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(239,157,57,1)] border-2 border-black flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  Total Capital Vault Allocation (Escrow)
                </p>
                <p className="text-4xl font-black mt-2 text-[#EF9D39]">
                  {data.total_escrow_locked_systemwide.toFixed(2)} KM
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-700 rounded-xl text-[#EF9D39]">
                <Landmark size={32} />
              </div>
            </div>

            {/* Audit Logs Trail */}
            <div className="mt-8">
              <h2 className="text-xl font-black uppercase tracking-tight mb-4">
                Ecosystem Ledger Entries
              </h2>
              <div className="space-y-3">
                {data.ledger.map((hold) => (
                  <div
                    key={hold.id}
                    className="bg-white dark:bg-zinc-900 border-2 border-black p-4 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-black text-zinc-600 dark:text-zinc-400">
                        <Coins size={18} />
                      </div>
                      <div>
                        <p className="font-black text-sm text-black dark:text-white">
                          Escrow Allocation for Job{" "}
                          <span className="text-[#EF9D39]">
                            # {hold.booking}
                          </span>
                        </p>
                        <div className="flex gap-4 text-xs font-bold text-gray-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />{" "}
                            {new Date(hold.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <span
                        className={`text-xs font-black uppercase tracking-wider px-2 py-1 rounded border border-black ${hold.status === "locked" ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-800"}`}
                      >
                        {hold.status}
                      </span>
                      <p className="font-black text-lg text-black dark:text-white">
                        {parseFloat(hold.amount).toFixed(2)} KM
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
