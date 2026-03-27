"use client";

import React, { useState, useEffect } from "react";
import { Wrench, FileText, CheckCircle, AlertCircle } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
// Adjust import path to your axios instance as needed
import api from "../../../lib/axios";

export default function ClientDashboard() {
  const [serviceType, setServiceType] = useState("plumbing");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  // Grab the client's name from LocalStorage for a personalized greeting
  useEffect(() => {
    const firstName = localStorage.getItem("first_name");
    const lastName = localStorage.getItem("last_name");
    if (firstName) {
      setUserName(`${firstName} ${lastName}`.trim());
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Sending the exact payload your Django serializer expects
      await api.post("/api/bookings/create/", {
        service_type: serviceType,
        description: description,
      });

      setSuccess(true);
      setDescription(""); // Clear the form on success

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Something went wrong. Please try again.",
      );
      console.error("Booking error:", err);
    } finally {
      setLoading(false);
    }
  };

  const mainCardStyle = { borderRadius: "32px" };
  const inputRadius = { borderRadius: "16px" };

  return (
    <div className="page-gradient flex flex-col min-h-screen dark:text-white bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-grow flex flex-col items-center p-6 py-12 w-full max-w-3xl mx-auto">
        <div className="w-full mb-8 text-center md:text-left">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            Welcome, {userName || "Client"}
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 font-bold text-sm mt-2 uppercase">
            What do you need fixed today?
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          style={mainCardStyle}
          className="w-full bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(239,157,57,0.25)] p-8 md:p-12 flex flex-col"
        >
          {/* Success Message */}
          {success && (
            <div className="mb-8 p-4 bg-green-100 border-2 border-green-500 text-green-800 font-bold text-sm uppercase rounded-xl flex items-center gap-3">
              <CheckCircle size={20} />
              Job posted successfully! Handymen in your area will see it
              shortly.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-sm uppercase rounded-xl flex items-center gap-3">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="space-y-8">
            {/* Service Type Dropdown */}
            <div className="group">
              <label className="flex items-center gap-2 text-xs font-black text-gray-900 dark:text-zinc-300 uppercase tracking-widest mb-3 ml-1">
                <Wrench size={16} /> Service Type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                style={inputRadius}
                className="w-full bg-white border-2 border-black dark:border-zinc-600 p-4 text-sm font-bold text-gray-900 dark:bg-zinc-800 dark:text-white outline-none focus:bg-yellow-50 dark:focus:bg-zinc-700 transition-all cursor-pointer appearance-none"
              >
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="carpentry">Carpentry</option>
                <option value="cleaning">Cleaning</option>
                <option value="general">General Handyman</option>
              </select>
            </div>

            {/* Description Textarea */}
            <div className="group">
              <label className="flex items-center gap-2 text-xs font-black text-gray-900 dark:text-zinc-300 uppercase tracking-widest mb-3 ml-1">
                <FileText size={16} /> Describe the Issue
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Water leak under the kitchen sink. Needs urgent fix!"
                style={inputRadius}
                className="w-full bg-white border-2 border-black dark:border-zinc-600 p-4 text-sm font-bold text-gray-900 dark:bg-zinc-800 dark:text-white outline-none focus:bg-yellow-50 dark:focus:bg-zinc-700 transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={inputRadius}
              className="w-full mt-4 bg-[linear-gradient(90deg,#EF9D39_10%,#FFD25A_90%)] text-black py-5 font-black uppercase tracking-widest text-sm transition-all border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? "Posting Job..." : "Post Job Request"}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
