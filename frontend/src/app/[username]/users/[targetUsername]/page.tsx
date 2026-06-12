"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import api from "../../../../../lib/axios";
import {
  ArrowLeft,
  User,
  Wrench,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Star,
  CheckCircle2,
  Clock3,
  Loader2,
} from "lucide-react";

interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: "client" | "handyman" | "admin";
  location?: string;
  service_type?: string;
  hourly_rate?: string;
  rating?: string;
  jobs?: number;
  wallet_balance?: string;
  date_joined: string;
  is_active?: boolean;
  county?: string;
  city?: string;
  zip_code?: string;
}

function formatFilterLabel(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatMoney(value?: string) {
  const amount = Number.parseFloat(value || "0");
  if (Number.isNaN(amount)) return "0.00 KM";
  return `${amount.toFixed(2)} KM`;
}

function getRoleIcon(role: UserData["role"]) {
  if (role === "handyman") return <Wrench size={16} />;
  if (role === "admin") return <Shield size={16} />;
  return <User size={16} />;
}

function getRoleBadge(role: UserData["role"]) {
  if (role === "handyman") {
    return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200";
  }
  if (role === "admin") {
    return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200";
  }
  return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200";
}

export default function AdminUserDetailsPage() {
  const params = useParams() as { username: string; targetUsername: string };
  const adminUsername = params.username;
  const targetUsername = decodeURIComponent(params.targetUsername || "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/api/accounts/users/");
        const allUsers = Array.isArray(response.data) ? response.data : [];
        const matched = allUsers.find(
          (candidate: UserData) =>
            String(candidate.username).toLowerCase() === targetUsername.toLowerCase(),
        );

        if (!matched) {
          setError("User not found.");
          setUser(null);
        } else {
          setUser(matched);
        }
      } catch (err) {
        console.error("Failed to load user details:", err);
        setError("Failed to load user details.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (targetUsername) {
      fetchUser();
    } else {
      setError("Invalid username in URL.");
      setLoading(false);
    }
  }, [targetUsername]);

  const fullName = useMemo(() => {
    if (!user) return "";
    const combined = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return combined || user.username;
  }, [user]);

  return (
    <div className="page-gradient flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 dark:text-white">
      <Header />

      <main className="grow mx-auto w-full max-w-6xl p-6 py-12">
        <div
          className="mb-8 border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900"
          style={{ borderRadius: "36px" }}
        >
          <h1 className="text-3xl font-black uppercase tracking-tighter text-black dark:text-white md:text-5xl">
            User <span className="text-[#EF9D39]">Details</span>
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">
            Admin view for account profile and status
          </p>
        </div>

        <div className="mb-6">
          <Link
            href={`/${adminUsername}/users`}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-[#EF9D39] hover:shadow-none dark:bg-zinc-900 dark:text-white"
          >
            <ArrowLeft size={16} />
            Back to Users
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-24">
            <Loader2 className="mb-4 animate-spin text-[#EF9D39]" size={48} />
            <p className="text-sm font-black uppercase tracking-widest text-black dark:text-white">
              Loading user details...
            </p>
          </div>
        ) : error || !user ? (
          <div className="rounded-3xl border-2 border-black border-dashed bg-white py-20 text-center dark:bg-zinc-900">
            <p className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400">
              {error || "User not found."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div
              className="border-[3px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900"
              style={{ borderRadius: "24px" }}
            >
              <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-black bg-black text-2xl font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] dark:bg-[#EF9D39] dark:text-black">
                    {(user.first_name?.[0] || "").toUpperCase()}
                    {(user.last_name?.[0] || "").toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase text-black dark:text-white">
                      {fullName}
                    </h2>
                    <p className="text-xs font-bold text-gray-500 dark:text-zinc-400">
                      @{user.username}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg border-2 border-black px-3 py-1.5 text-[10px] font-black uppercase ${getRoleBadge(user.role)}`}
                  >
                    {getRoleIcon(user.role)}
                    {user.role}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg border-2 border-black px-3 py-1.5 text-[10px] font-black uppercase ${
                      user.is_active
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                    }`}
                  >
                    {user.is_active ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                    {user.is_active ? "Active" : "Pending"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div
                className="border-[3px] border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900"
                style={{ borderRadius: "24px" }}
              >
                <p className="mb-4 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400">
                  Contact & Location
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-[#EF9D39]" />
                    <span className="font-bold text-black dark:text-white">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-[#EF9D39]" />
                    <span className="font-bold text-black dark:text-white">
                      {user.phone_number || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-[#EF9D39]" />
                    <span className="font-bold text-black dark:text-white">
                      {user.location || user.city || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-[#EF9D39]" />
                    <span className="font-bold text-black dark:text-white">
                      County: {user.county || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-[#EF9D39]" />
                    <span className="font-bold text-black dark:text-white">
                      ZIP: {user.zip_code || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="border-[3px] border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900"
                style={{ borderRadius: "24px" }}
              >
                <p className="mb-4 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400">
                  Account & Work Data
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-[#EF9D39]" />
                    <span className="font-bold text-black dark:text-white">
                      Joined {new Date(user.date_joined).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={16} className="text-[#EF9D39]" />
                    <span className="font-bold text-black dark:text-white">
                      Wallet: {formatMoney(user.wallet_balance)}
                    </span>
                  </div>

                  {user.role === "handyman" && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Wrench size={16} className="text-[#EF9D39]" />
                        <span className="font-bold text-black dark:text-white">
                          Service: {user.service_type ? formatFilterLabel(user.service_type) : "Not set"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign size={16} className="text-[#EF9D39]" />
                        <span className="font-bold text-black dark:text-white">
                          Hourly rate: {user.hourly_rate ? `${user.hourly_rate} KM/H` : "Not set"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star size={16} className="text-[#EF9D39]" />
                        <span className="font-bold text-black dark:text-white">
                          Rating: {user.rating || "5.0"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase size={16} className="text-[#EF9D39]" />
                        <span className="font-bold text-black dark:text-white">
                          Completed jobs: {user.jobs ?? 0}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
