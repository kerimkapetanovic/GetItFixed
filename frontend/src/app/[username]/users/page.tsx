"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import api from "../../../../lib/axios";
import {
    Users,
    Wrench,
    User,
    MapPin,
    Mail,
    Phone,
    Loader2,
    Eye,
    Shield,
    Calendar,
    DollarSign
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

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
    wallet_balance?: string;
    date_joined: string;
    is_verified?: boolean;
}

export default function AdminUsersPage() {
    const params = useParams() as { username: string };
    const username = params.username;

    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<string>("all");
    const [selectedService, setSelectedService] = useState<string>("all");
    const [selectedCity, setSelectedCity] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get("/api/accounts/users/");
                setUsers(response.data);
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const cardStyle = { borderRadius: "24px" };

    const formatFilterLabel = (value: string) =>
        value
            .replace(/[_-]+/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());

    // Extract unique service types from handymen
    const serviceOptions = [
        "all",
        ...Array.from(
            new Set(
                users
                    .filter((u) => u.role === "handyman" && u.service_type)
                    .map((u) => u.service_type!)
            )
        ),
    ];

    // Extract unique cities
    const cityMap = new Map<string, string>();
    users.forEach((user) => {
        const city = (user.location || "").trim();
        if (!city) return;
        const normalizedCity = city.toLowerCase();
        if (!cityMap.has(normalizedCity)) {
            cityMap.set(normalizedCity, formatFilterLabel(city));
        }
    });
    const cityOptions = [
        { value: "all", label: "All Cities" },
        ...Array.from(cityMap.entries()).map(([value, label]) => ({ value, label })),
    ];

    // Filter users
    const filteredUsers = users.filter((user) => {
        const roleMatch = selectedRole === "all" || user.role === selectedRole;

        const serviceMatch =
            selectedService === "all" ||
            (user.role === "handyman" && user.service_type === selectedService);

        const cityMatch =
            selectedCity === "all" ||
            (user.location || "").trim().toLowerCase() === selectedCity;

        const searchMatch =
            searchTerm === "" ||
            `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase());

        return roleMatch && serviceMatch && cityMatch && searchMatch;
    });

    // Stats
    const totalClients = users.filter((u) => u.role === "client").length;
    const totalHandymen = users.filter((u) => u.role === "handyman").length;
    const totalAdmins = users.filter((u) => u.role === "admin").length;

    const getRoleColor = (role: string) => {
        switch (role) {
            case "client":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            case "handyman":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "admin":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "client":
                return <User size={16} />;
            case "handyman":
                return <Wrench size={16} />;
            case "admin":
                return <Shield size={16} />;
            default:
                return <User size={16} />;
        }
    };

    return (
        <div className="page-gradient flex flex-col min-h-screen dark:text-white bg-zinc-50 dark:bg-zinc-950">
            <Header />

            <main className="flex-grow max-w-7xl mx-auto p-6 py-12 w-full">
                {/* Header Banner */}
                <div
                    className="bg-white dark:bg-zinc-900 border-2 border-black p-10 text-center mb-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    style={{ borderRadius: "40px" }}
                >
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white">
                        User <span className="text-[#EF9D39]">Management</span>
                    </h1>
                    <p className="text-gray-500 dark:text-zinc-400 font-bold text-xs mt-2 uppercase tracking-widest">
                        Manage all platform users
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div
                        className="bg-white dark:bg-zinc-900 border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                        style={cardStyle}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center border-2 border-black">
                                <User size={28} className="text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-black dark:text-white">{totalClients}</p>
                                <p className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                                    Clients
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white dark:bg-zinc-900 border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                        style={cardStyle}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center border-2 border-black">
                                <Wrench size={28} className="text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-black dark:text-white">{totalHandymen}</p>
                                <p className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                                    Handymen
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white dark:bg-zinc-900 border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                        style={cardStyle}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center border-2 border-black">
                                <Shield size={28} className="text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-black dark:text-white">{totalAdmins}</p>
                                <p className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                                    Admins
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by name, email, or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-6 py-4 border-2 border-black rounded-2xl font-bold text-sm bg-white dark:bg-zinc-900 text-black dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                    />
                </div>

                {/* Filters */}
                {!loading && users.length > 0 && (
                    <div className="mb-10 border-2 border-black bg-white dark:bg-zinc-900 rounded-3xl p-4 md:p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        {/* Role Filter */}
                        <div className="mb-4">
                            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                                Filter by role
                            </p>
                            <div
                                className="custom-scroll flex gap-3 overflow-x-auto pb-2 mt-1"
                                style={{
                                    scrollbarWidth: "auto",
                                    scrollbarColor: "#EF9D39 transparent",
                                }}
                            >
                                {["all", "client", "handyman", "admin"].map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setSelectedRole(role)}
                                        className={`whitespace-nowrap px-5 py-2.5 border-2 border-black rounded-xl font-black uppercase text-xs transition-all ${selectedRole === role
                                            ? "bg-[#EF9D39] text-black"
                                            : "bg-white dark:bg-zinc-800 text-black dark:text-white"
                                            }`}
                                    >
                                        {role === "all" ? "All Roles" : formatFilterLabel(role)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Service Filter (only show if handymen exist) */}
                        {totalHandymen > 0 && (
                            <div className="mb-4">
                                <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                                    Filter by service (Handymen)
                                </p>
                                <div
                                    className="custom-scroll flex gap-3 overflow-x-auto pb-2 mt-1"
                                    style={{
                                        scrollbarWidth: "auto",
                                        scrollbarColor: "#EF9D39 transparent",
                                    }}
                                >
                                    {serviceOptions.map((service) => (
                                        <button
                                            key={service}
                                            onClick={() => setSelectedService(service)}
                                            className={`whitespace-nowrap px-5 py-2.5 border-2 border-black rounded-xl font-black uppercase text-xs transition-all ${selectedService === service
                                                ? "bg-[#EF9D39] text-black"
                                                : "bg-white dark:bg-zinc-800 text-black dark:text-white"
                                                }`}
                                        >
                                            {service === "all" ? "All Services" : formatFilterLabel(service)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* City Filter */}
                        <div>
                            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                                Filter by city
                            </p>
                            <div
                                className="custom-scroll flex gap-3 overflow-x-auto pb-2 mt-1"
                                style={{
                                    scrollbarWidth: "auto",
                                    scrollbarColor: "#EF9D39 transparent",
                                }}
                            >
                                {cityOptions.map((city) => (
                                    <button
                                        key={city.value}
                                        onClick={() => setSelectedCity(city.value)}
                                        className={`whitespace-nowrap px-5 py-2.5 border-2 border-black rounded-xl font-black uppercase text-xs transition-all ${selectedCity === city.value
                                            ? "bg-[#EF9D39] text-black"
                                            : "bg-white dark:bg-zinc-800 text-black dark:text-white"
                                            }`}
                                    >
                                        {city.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center py-20">
                            <Loader2 className="animate-spin text-[#EF9D39] mb-4" size={48} />
                            <p className="font-black uppercase tracking-widest text-sm text-black dark:text-white">
                                Loading users...
                            </p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900 border-2 border-dashed border-gray-300 rounded-3xl">
                            <p className="font-bold text-gray-500 dark:text-zinc-400 uppercase">
                                No users found.
                            </p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900 border-2 border-dashed border-gray-300 rounded-3xl">
                            <p className="font-bold text-gray-500 dark:text-zinc-400 uppercase">
                                No users match the selected filters.
                            </p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                style={cardStyle}
                                className="bg-white dark:bg-zinc-900 border-[3px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1"
                            >
                                {/* User Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-black text-white dark:bg-[#EF9D39] dark:text-black rounded-xl flex items-center justify-center font-black text-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                                            {(user.first_name?.[0] || "") + (user.last_name?.[0] || "")}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black uppercase text-black dark:text-white">
                                                {user.first_name} {user.last_name}
                                            </h2>
                                            <p className="text-xs font-bold text-gray-500 dark:text-zinc-400">
                                                @{user.username}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Role Badge */}
                                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-[10px] uppercase border-2 border-black ${getRoleColor(user.role)}`}>
                                        {getRoleIcon(user.role)}
                                        {user.role}
                                    </span>
                                </div>

                                {/* User Info Grid */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail size={16} className="text-[#EF9D39]" />
                                        <span className="font-bold text-black dark:text-white">{user.email}</span>
                                    </div>

                                    {user.phone_number && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone size={16} className="text-[#EF9D39]" />
                                            <span className="font-bold text-black dark:text-white">{user.phone_number}</span>
                                        </div>
                                    )}

                                    {user.location && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin size={16} className="text-[#EF9D39]" />
                                            <span className="font-bold text-black dark:text-white">{user.location}</span>
                                        </div>
                                    )}

                                    {user.role === "handyman" && user.service_type && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Wrench size={16} className="text-[#EF9D39]" />
                                            <span className="font-bold text-black dark:text-white">
                                                {formatFilterLabel(user.service_type)}
                                            </span>
                                        </div>
                                    )}

                                    {user.role === "handyman" && user.hourly_rate && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <DollarSign size={16} className="text-[#EF9D39]" />
                                            <span className="font-bold text-black dark:text-white">
                                                {user.hourly_rate} KM/H
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar size={16} className="text-[#EF9D39]" />
                                        <span className="font-bold text-gray-500 dark:text-zinc-400">
                                            Joined {new Date(user.date_joined).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Wallet Balance */}
                                {user.wallet_balance && (
                                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-black rounded-xl">
                                        <p className="text-xs font-black uppercase text-gray-500 dark:text-zinc-400 mb-1">
                                            Wallet Balance
                                        </p>
                                        <p className="text-2xl font-black text-[#EF9D39]">
                                            {parseFloat(user.wallet_balance).toFixed(2)} KM
                                        </p>
                                    </div>
                                )}

                                {/* View Details Button */}
                                <Link
                                    href={`/${username}/users/${encodeURIComponent(user.username)}`}
                                    className="group flex w-full items-center justify-between border-[3px] border-black bg-white dark:bg-zinc-800 px-6 py-4 font-black uppercase text-xs tracking-[0.2em] shadow-[6px_6px_0px_0px_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-[#EF9D39] hover:shadow-none"
                                    style={{ borderRadius: "18px" }}
                                >
                                    <span className="text-black dark:text-white group-hover:text-black">View Details</span>
                                    <Eye size={18} className="text-black dark:text-white group-hover:text-black" />
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}