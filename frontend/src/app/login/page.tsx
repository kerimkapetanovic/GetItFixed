"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Hammer, Eye, EyeOff } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useLanguage } from "@/components/providers/language-provider";
import api from "../../../lib/axios";

type ApiErrorResponse = {
  non_field_errors?: string[];
  detail?: string;
};

export default function LoginPage() {
  const { t } = useLanguage();
  const [role, setRole] = useState<"client" | "handyman">("client");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const mainCardStyle = { borderRadius: "32px", maxWidth: "500px" };
  const inputRadius = { borderRadius: "16px" };
  const roleRadius = { borderRadius: "20px" };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const loginData = {
      email: formData.email,
      password: formData.password,
      role: role,
    };

    try {
      const response = await api.post("/api/accounts/login/", loginData);

      // --- TOKEN & SESSION STORAGE ---
      // 1. Save the token for the Axios Header (Bypasses Cookie 403 errors)
      localStorage.setItem("auth_token", response.data.token);

      // 2. Save UI data for the Header component
      localStorage.setItem("is_logged_in", "true");
      localStorage.setItem("user_role", response.data.role);
      localStorage.setItem("first_name", response.data.first_name);
      localStorage.setItem("last_name", response.data.last_name || "");
      localStorage.setItem("username", response.data.username);

      // 3. Redirect
      // We use window.location.href to force a full state refresh
      window.location.href = role === "handyman" ? "/dashboard" : "/";
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: ApiErrorResponse } };
      const backendError =
        apiError.response?.data?.non_field_errors?.[0] ||
        apiError.response?.data?.detail ||
        t("login.errorFallback");
      setError(backendError);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-gradient flex flex-col min-h-screen dark:text-white">
      <Header />
      <main className="flex-grow flex items-center justify-center p-6 py-12">
        <form
          onSubmit={onSubmit}
          style={mainCardStyle}
          className="w-full bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(239,157,57,0.25)] p-8 md:p-12 flex flex-col"
        >
          <div className="text-center mb-10">
            <h1 className="text-[32px] font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              {t("login.title")}
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 font-bold text-sm mt-2 uppercase">
              {t("login.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <button
              type="button"
              onClick={() => setRole("client")}
              style={roleRadius}
              className={`flex flex-col items-center justify-center p-6 border-4 transition-all ${
                role === "client"
                  ? "border-black bg-[linear-gradient(90deg,#EF9D39_10%,#FFD25A_90%)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5"
                  : "border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 opacity-60 hover:opacity-100 text-gray-400 dark:text-zinc-500"
              }`}
            >
              <div
                className={`p-3 rounded-xl mb-3 ${role === "client" ? " text-black" : "bg-gray-100 dark:bg-zinc-700 text-gray-400 dark:text-zinc-300"}`}
              >
                <User size={24} strokeWidth={3} />
              </div>
              <span className="font-black text-sm uppercase tracking-tight">
                {t("login.client")}
              </span>
              <span className="text-[10px] font-bold opacity-70">
                {t("login.clientDesc")}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole("handyman")}
              style={roleRadius}
              className={`flex flex-col items-center justify-center p-6 border-4 transition-all ${
                role === "handyman"
                  ? "border-black bg-[linear-gradient(90deg,#FFD25A_10%,#EF9D39_90%)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5"
                  : "border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 opacity-60 hover:opacity-100 text-gray-400 dark:text-zinc-500"
              }`}
            >
              <div
                className={`p-3 rounded-xl mb-3 ${role === "handyman" ? " text-black" : "bg-gray-100 dark:bg-zinc-700 text-gray-400 dark:text-zinc-300"}`}
              >
                <Hammer size={24} strokeWidth={3} />
              </div>
              <span className="font-black text-sm uppercase tracking-tight">
                {t("login.handyman")}
              </span>
              <span className="text-[10px] font-bold opacity-70">
                {t("login.handymanDesc")}
              </span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-xs uppercase rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="group">
              <label className="block text-xs font-black text-gray-900 dark:text-zinc-300 uppercase tracking-widest mb-2 ml-1">
                {t("login.email")}
              </label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder={
                  role === "client"
                    ? "client@example.com"
                    : "handyman@example.com"
                }
                style={inputRadius}
                className={`w-full bg-white border-2 border-black dark:border-zinc-600 p-4 text-sm font-bold text-gray-900 dark:bg-zinc-800 dark:text-white outline-none focus:bg-yellow-50 dark:focus:bg-zinc-700 transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-500`}
              />
            </div>

            <div className="group">
              <label className="block text-xs font-black text-gray-900 dark:text-zinc-300 uppercase tracking-widest mb-2 ml-1">
                {t("login.password")}
              </label>
              <div className="relative flex items-center w-full">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={t("login.passwordPlaceholder")}
                  style={inputRadius}
                  className="w-full bg-white border-2 border-black dark:border-zinc-600 p-4 pr-12 text-sm font-bold text-gray-900 dark:bg-zinc-800 dark:text-white outline-none focus:bg-yellow-50 dark:focus:bg-zinc-700 transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-500 block"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 flex items-center justify-center text-gray-700 dark:text-zinc-300 hover:scale-110 transition-transform z-30 bg-transparent border-none"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={inputRadius}
              className="w-full mt-3 mb-4 bg-black text-white py-5 font-black uppercase tracking-widest text-sm transition-all border-2 border-black shadow-[6px_6px_0px_0px_rgba(249,177,77,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95 disabled:opacity-50"
            >
              {loading ? t("login.signingIn") : t("login.signIn")}
            </button>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/register"
              className="text-gray-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-tight"
            >
              {t("login.registerPrompt")}{" "}
              <span className="text-black dark:text-white border-b-2 border-yellow-300 pb-0.5 hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors">
                {t("login.registerHere")}
              </span>
            </Link>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
