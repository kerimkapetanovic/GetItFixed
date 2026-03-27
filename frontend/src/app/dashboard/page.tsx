"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import HandymanDashboard from "@/components/HandymanDashboard";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const brandColor = "#EF9D39";

  return (
    <div className="page-gradient flex flex-col min-h-screen text-black dark:text-white font-sans">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto px-6 py-12 w-full">
        {/* DASHBOARD HEADER */}
        <div
          className="bg-white dark:bg-zinc-900 border-[3px] border-black p-8 mb-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
          style={{ borderRadius: "30px" }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black rounded-2xl">
              <LayoutDashboard size={32} className="text-[#EF9D39]" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">
                Handyman <span style={{ color: brandColor }}>Dashboard</span>
              </h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">
                Manage your incoming requests and active jobs
              </p>
            </div>
          </div>
        </div>

        {/* THE JOBS LOGIC */}
        <HandymanDashboard />
      </main>

      <Footer />
    </div>
  );
}
