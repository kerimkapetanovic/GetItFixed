"use client";

import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import HandymanDashboard from "@/components/HandymanDashboard";
import { LayoutDashboard } from "lucide-react";
import { useRequireRole } from "@/lib/useRequireRole";

export default function DashboardPage() {
  const {checking}=useRequireRole(["handyman"]);
  const brandColor = "#EF9D39";
      if (checking) return null;

  return (
    <div className="page-gradient flex flex-col min-h-screen text-black dark:text-white font-sans">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto px-6 py-12 w-full">
        {/* DASHBOARD HEADER */}
        <div
          className="bg-white dark:bg-[#141414] border-[3px] border-black dark:border-[#222] p-8 mb-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-none relative"
          style={{ borderRadius: "30px" }}
        >
          {/* Ikona lijevo, apsolutno pozicionirana */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 p-3 bg-black rounded-2xl">
            <LayoutDashboard size={32} className="text-[#EF9D39]" />
          </div>

          {/* Tekst centriran */}
          <div className="text-center">
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-black dark:text-[#f0f0f0]">
              Handyman <span style={{ color: brandColor }}>Dashboard</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 dark:text-[#555] uppercase tracking-[0.3em] mt-2">
              Manage your incoming requests and active jobs
            </p>
          </div>
        </div>

        <HandymanDashboard />
      </main>

      <Footer />
    </div>
  );
}