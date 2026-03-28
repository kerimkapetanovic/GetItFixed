"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";
import { useLanguage } from "@/components/providers/language-provider";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

export default function Header() {
  const router = useRouter();
  const { t } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeMounted, setIsThemeMounted] = useState(false);
  const [userRole, setUserRole] = useState("client");
  const [userData, setUserData] = useState({ firstName: "", lastName: "" });
  const [username, setUsername] = useState("");
  const [storedAvatarUrl, setStoredAvatarUrl] = useState("");
  const avatarSeed =
    username || `${userData.firstName}${userData.lastName}` || userRole;
  const avatarUrl =
    storedAvatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;

  const brandColor = "#EF9D39";

  const syncSessionFromStorage = () => {
    const role = localStorage.getItem("user_role");
    const loggedIn = localStorage.getItem("is_logged_in") === "true";
    const fName = localStorage.getItem("first_name") || "";
    const lName = localStorage.getItem("last_name") || "";
    const storedUsername = localStorage.getItem("username") || "";
    const customAvatarUrl = localStorage.getItem("avatar_url") || "";
    setUsername(storedUsername);
    setStoredAvatarUrl(customAvatarUrl);

    if (loggedIn && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      setUserData({ firstName: fName, lastName: lName });
    } else {
      setIsLoggedIn(false);
      setUserRole("client");
      setUserData({ firstName: "", lastName: "" });
      setUsername("");
      setStoredAvatarUrl("");
    }
  };

  // 1. UČITAVANJE SESIJE (UI DIO)
  useEffect(() => {
    syncSessionFromStorage();

    const handleProfileUpdated = () => {
      syncSessionFromStorage();
    };

    window.addEventListener("profile-updated", handleProfileUpdated);
    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, []);

  useEffect(() => {
    setIsThemeMounted(true);
  }, []);

  // 2. LOGOUT LOGIKA (ČISTI I KUKI I LOCALSTORAGE)
  const handleLogout = async () => {
    try {
      await api.post("/api/accounts/logout/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      setIsLoggedIn(false);
      setUserRole("client");
      setIsMenuOpen(false);
      router.push("/login");
    }
  };

  const allBaseLinks = [
    { name: t("header.howItWorks"), href: "/how-it-works", adminHide: true },
    { name: t("header.services"), href: "/services", adminHide: false },
    {
      name: t("header.aiAssistant"),
      href: "/ai-repair-assistant",
      adminHide: true,
    },
    { name: t("header.help"), href: "/help", adminHide: false },
    { name: t("header.contact"), href: "/contact", adminHide: false },
  ];

  const visibleBaseLinks = allBaseLinks.filter(
    (link) => !isLoggedIn || userRole !== "admin" || !link.adminHide,
  );
  const getRoleLinks = (role: string) => {
    if (!isLoggedIn || !username) return []; // Dodaj provjeru za username

    switch (role) {
      case "client":
        return [
          { name: t("header.newRequest"), href: `/${username}/new-request` },
          { name: t("header.myRequests"), href: `/${username}/requests` },
        ];
      case "handyman":
        return [
          { name: t("header.dashboard"), href: "/dashboard" },
          { name: t("header.calendar"), href: "/calendar" },
        ];
      case "admin":
        return [
          { name: t("header.users"), href: "/admin/users" },
          { name: t("header.tracking"), href: "/admin/tracking" },
        ];
      default:
        return [];
    }
  };

  const translatedRole =
    userRole === "client"
      ? t("header.client")
      : userRole === "handyman"
        ? t("header.handyman")
        : userRole === "admin"
          ? t("header.admin")
          : userRole;

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="border-b-2 border-black dark:border-zinc-700 w-full bg-white dark:bg-zinc-900 px-6 py-5 font-sans uppercase tracking-tight relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            className="flex items-center gap-3 text-2xl font-black normal-case tracking-tighter dark:text-white"
          >
            <img
              src="/GetItFixed Logo.png"
              alt="Logo"
              className="h-10 w-auto object-contain"
            />
            <span>GetItFixed</span>
          </Link>
        </div>

        {/* NAV LINKOVI */}
        <nav className="hidden lg:flex flex-grow justify-center items-center gap-x-8 px-4">
          {visibleBaseLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold hover:underline underline-offset-8 decoration-2 transition-all whitespace-nowrap text-black dark:text-zinc-200 dark:hover:text-white"
            >
              {link.name}
            </Link>
          ))}

          {isLoggedIn && (
            <div className="flex items-center gap-4 ml-2 pl-8 border-l-2 border-gray-100 dark:border-zinc-700">
              {getRoleLinks(userRole).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ backgroundColor: brandColor }}
                  className="text-black text-[11px] font-black px-5 py-2.5 rounded-[12px] hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 whitespace-nowrap border-2 border-black"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* DESNA STRANA (Login ili Profile) */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={handleThemeToggle}
            aria-label={t("header.toggleThemeAria")}
            title={t("header.toggleThemeAria")}
            className="flex items-center gap-2 border-2 border-black dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 rounded-[14px] text-[10px] font-black uppercase tracking-wider text-black dark:text-white transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
          >
            {isThemeMounted && isDark ? <Sun size={14} /> : <Moon size={14} />}
            <span className="hidden sm:inline">
              {isThemeMounted && isDark
                ? t("header.lightMode")
                : t("header.darkMode")}
            </span>
          </button>
          {!isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <button className="text-sm font-black px-5 py-2.5 rounded-[30px] border-2 border-transparent cursor-pointer hover:underline underline-offset-8 decoration-2 transition-all whitespace-nowrap text-black dark:text-white transition-all active:scale-95 normal-case tracking-tight">
                  {t("header.login")}
                </button>
              </Link>
              <Link href="/register">
                <button className="border-2 border-black px-6 py-2.5 text-sm font-black cursor-pointer rounded-[30px] bg-[#EF9D39] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                  {t("header.signUp")}
                </button>
              </Link>
            </div>
          ) : (
            <div className="relative group">
              {/* PROFILE BUTTON */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-3 border-2 border-black dark:border-zinc-600 p-2 pl-4 bg-white dark:bg-zinc-800 transition-all z-[60] relative ${
                  isMenuOpen
                    ? "rounded-t-[16px] border-b-0 shadow-none translate-x-1 translate-y-1"
                    : "rounded-[16px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                }`}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black leading-none uppercase tracking-tight dark:text-white">
                    {userData.firstName
                      ? `${userData.firstName} ${userData.lastName}`
                      : translatedRole}
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 mt-1 uppercase leading-none">
                    {translatedRole}
                  </p>
                </div>
                <img
                  src={avatarUrl}
                  alt="Profile avatar"
                  className="w-10 h-10 rounded-full border-2 border-black object-cover shrink-0"
                />
              </button>

              {/* DROPDOWN MENU */}
              {isMenuOpen && (
                <div className="absolute left-1 right-0 mt-[4px] w-[calc(100%)] bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-600 z-50  rounded-b-[16px] overflow-hidden">
                  <ul className="flex flex-col text-[11px] font-black uppercase tracking-widest">
                    <Link
                      href="/profile"
                      className="p-4 border-b-2 border-black dark:border-zinc-700 hover:bg-yellow-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer block dark:text-white"
                    >
                      {t("header.profile")}
                    </Link>
                    <Link
                      href="/settings"
                      className="p-4 border-b-2 border-black dark:border-zinc-700 hover:bg-yellow-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer block dark:text-white"
                    >
                      {t("header.settings")}
                    </Link>
                    <li
                      onClick={handleLogout}
                      className="p-4 bg-black text-white hover:bg-[#EF9D39] hover:text-black cursor-pointer text-center transition-colors"
                    >
                      {t("header.logout")}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
