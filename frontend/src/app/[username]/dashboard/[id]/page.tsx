"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import api from "../../../../../lib/axios";
import {
    Loader2, Check, X, AlertCircle, PlayCircle, Timer,
    CheckCircle2, Calendar as CalendarIcon, CheckCircle,
    Wrench, Flag
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../../datepicker-custom.css";
import { addMinutes } from "date-fns";
import { BookingDetail } from "@/types/booking";

export const formatDateTime = (value: string | Date | null) => {
    if (!value) return "Not set";
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "Invalid date";
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date).replace(",", "");
};

export function getStatusInfo(booking: BookingDetail) {
    if (booking.status === "cancelled" || booking.negotiation_status === "declined") {
        return {
            label: "Cancelled",
            badgeClass: "bg-red-400 text-black",
            helperText: "Request closed after decline.",
            icon: <X className="text-red-400 shrink-0" size={18} strokeWidth={3} />
        };
    }
    if (booking.status === "completed") {
        return {
            label: "Completed",
            badgeClass: "bg-green-400 text-black",
            helperText: "Job finished! Thank you for your work.",
            icon: <CheckCircle2 className="text-green-400 shrink-0" size={18} strokeWidth={3} />
        };
    }
    if (booking.status === "handyman_done") {
        return {
            label: "Awaiting Client",
            badgeClass: "bg-purple-400 text-black",
            helperText: "You marked job as done. Waiting for client confirmation.",
            icon: <CheckCircle className="text-purple-400 shrink-0" size={18} strokeWidth={3} />
        };
    }
    if (booking.status === "not_completed") {
        return {
            label: "Not Completed",
            badgeClass: "bg-red-400 text-black",
            helperText: "Client reported the job is not completed. Follow-up is required.",
            icon: <AlertCircle className="text-red-500 shrink-0" size={18} strokeWidth={3} />
        };
    }
    if (booking.status === "in_progress") {
        return {
            label: "In Progress",
            badgeClass: "bg-violet-400 text-black",
            helperText: "Job is in progress. Mark as done when finished.",
            icon: <PlayCircle className="text-violet-400 shrink-0" size={18} strokeWidth={3} />
        };
    }
    if (booking.status === "accepted" || booking.negotiation_status === "agreed") {
        return {
            label: "Accepted",
            badgeClass: "bg-blue-400 text-black",
            helperText: "Appointment confirmed with client.",
            icon: <Check className="text-blue-400 shrink-0" size={18} strokeWidth={3} />
        };
    }
    if (booking.negotiation_status === "awaiting_client") {
        return {
            label: "Awaiting Client",
            badgeClass: "bg-purple-400 text-black",
            helperText: "You countered. Waiting for client response.",
            icon: <AlertCircle className="text-purple-400 shrink-0" size={18} strokeWidth={3} />
        };
    }
    if (booking.negotiation_status === "awaiting_handyman") {
        return {
            label: "Confirmation Required",
            badgeClass: "bg-yellow-400 text-black",
            helperText: "Client is waiting for your response.",
            icon: <Timer className="text-yellow-400 shrink-0" size={18} strokeWidth={3} />
        };
    }
    return {
        label: "Waiting",
        badgeClass: "bg-yellow-400 text-black",
        helperText: "Waiting for your response.",
        icon: <Timer className="text-yellow-400 shrink-0" size={18} strokeWidth={3} />
    };
}

function getBackendErrorMessage(error: unknown) {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: unknown }).response === "object"
    ) {
        const response = (error as { response?: { data?: { error?: string } } }).response;
        if (response?.data?.error) return response.data.error;
    }
    return "Failed to submit your response.";
}

const calculateTimeLeft = (expiresAt: string | null) => {
    if (!expiresAt) return 0;
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return diff <= 0 ? 0 : diff;
};

const formatMs = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
};

function shouldShowHandymanActions(booking: BookingDetail) {
    if (["cancelled", "accepted", "completed", "in_progress", "handyman_done", "not_completed"].includes(booking.status)) return false;
    if (booking.negotiation_status === "declined" || booking.negotiation_status === "agreed") return false;
    if (booking.negotiation_status === "awaiting_handyman") return true;
    if (!booking.negotiation_status && booking.status === "pending") return true;
    return false;
}

export default function HandymanRequestDetailsPage() {
    const params = useParams() as { id: string; username: string };
    const bookingId = params.id;
    const username = params.username;

    const [booking, setBooking] = useState<BookingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    // Accept panel
    const [acceptOpen, setAcceptOpen] = useState(false);
    const [acceptDuration, setAcceptDuration] = useState("");

    // Counter panel
    const [counterOpen, setCounterOpen] = useState(false);
    const [counterProposedTime, setCounterProposedTime] = useState<Date | null>(null);
    const [counterDuration, setCounterDuration] = useState("");
    const [counterMessage, setCounterMessage] = useState("");
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Action state
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");

    // Job completion
    const [markDoneLoading, setMarkDoneLoading] = useState(false);
    const [secondsUntilUnlock, setSecondsUntilUnlock] = useState<number | null>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const [knowsFix, setKnowsFix] = useState(false);
    const [busySlots, setBusySlots] = useState<{ start: Date; end: Date }[]>([]);

    const toUtcIso = (date: Date | null) => date ? date.toISOString() : "";

    const filterPassedTime = (time: Date) => {
        if (time < new Date()) return false;
        return !busySlots.some(slot => {
            const t = time.getTime();
            return t >= new Date(slot.start).getTime() && t <= new Date(slot.end).getTime();
        });
    };

    useEffect(() => {
        if (booking) setKnowsFix(!!booking.knows_fix);
    }, [booking]);

    // Negotiation expiry timer
    useEffect(() => {
        if (!booking || booking.status === "accepted" || booking.status === "completed") {
            setTimeLeft(0);
            return;
        }
        const update = () => setTimeLeft(calculateTimeLeft(booking.expires_at));
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [booking]);

    // ── POLLING: status-check (accepted → in_progress) ──
    useEffect(() => {
        if (!booking || booking.status !== "accepted") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            return;
        }

        const poll = async () => {
            try {
                const res = await api.post(`/api/bookings/${booking.id}/status-check/`);
                if (res.data.status !== "not_yet") {
                    setBooking(res.data);
                } else {
                    setSecondsUntilUnlock(res.data.seconds_left);
                }
            } catch (e) {
                console.error("Status check failed:", e);
            }
        };

        poll();
        pollingRef.current = setInterval(poll, 30_000);

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [booking?.status, booking?.id]);

    // Fetch booking
    useEffect(() => {
        if (!bookingId) return;
        const fetchBooking = async () => {
            try {
                const res = await api.get(`/api/bookings/${bookingId}/`);
                setBooking(res.data);
            } catch (e) {
                console.error("Failed to fetch booking:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId]);

    // Fetch busy slots
    useEffect(() => {
        if (!booking?.handyman_id) return;
        api.get(`/api/bookings/busy-slots/${booking.handyman_id}/`)
            .then(res => {
                setBusySlots(res.data.map((slot: any) => ({
                    start: new Date(slot.scheduled_time),
                    end: addMinutes(new Date(slot.scheduled_time), (slot.duration_minutes || 60) + 25),
                })));
            })
            .catch(err => console.error("Error fetching busy slots", err));
    }, [booking?.handyman_id]);

    const clearActionMessages = () => { setActionError(""); setActionSuccess(""); };

    const handleAccept = async () => {
        if (!booking) return;
        if (!acceptDuration || isNaN(Number(acceptDuration)) || Number(acceptDuration) <= 0) {
            setActionError("Please enter a valid estimated duration in minutes.");
            return;
        }
        clearActionMessages();
        try {
            setActionLoading(true);
            const res = await api.post(`/api/bookings/${booking.id}/handyman-action/`, {
                action: "accept",
                duration_minutes: Number(acceptDuration),
                knows_fix: knowsFix,
            });
            setBooking(res.data);
            setActionSuccess("Booking accepted! Appointment is now confirmed.");
            setAcceptOpen(false);
            setAcceptDuration("");
        } catch (e) {
            setActionError(getBackendErrorMessage(e));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDecline = async () => {
        if (!booking) return;
        clearActionMessages();
        try {
            setActionLoading(true);
            const res = await api.post(`/api/bookings/${booking.id}/handyman-action/`, { action: "decline" });
            setBooking(res.data);
            setActionSuccess("Request declined and closed.");
        } catch (e) {
            setActionError(getBackendErrorMessage(e));
        } finally {
            setActionLoading(false);
        }
    };

    const handleCounter = async () => {
        if (!booking) return;
        if (!counterProposedTime) { setActionError("Please select a new date and time."); return; }
        if (!counterDuration || isNaN(Number(counterDuration)) || Number(counterDuration) <= 0) {
            setActionError("Please enter a valid estimated duration in minutes.");
            return;
        }
        clearActionMessages();
        try {
            setActionLoading(true);
            const res = await api.post(`/api/bookings/${booking.id}/handyman-action/`, {
                action: "counter",
                proposed_time: toUtcIso(counterProposedTime),
                duration_minutes: Number(counterDuration),
                message: counterMessage,
                knows_fix: knowsFix,
            });
            setBooking(res.data);
            setActionSuccess("Counter offer sent to client.");
            setCounterOpen(false);
            setCounterProposedTime(null);
            setCounterDuration("");
            setCounterMessage("");
        } catch (e) {
            setActionError(getBackendErrorMessage(e));
        } finally {
            setActionLoading(false);
        }
    };

    // ── HANDYMAN: označi job kao završen ──
    const handleMarkDone = async () => {
        if (!booking) return;
        clearActionMessages();
        try {
            setMarkDoneLoading(true);
            const res = await api.post(`/api/bookings/${booking.id}/complete/`, { action: "mark_done" });
            setBooking(res.data);
            setActionSuccess("Job marked as done! Waiting for client confirmation.");
        } catch (e) {
            setActionError(getBackendErrorMessage(e));
        } finally {
            setMarkDoneLoading(false);
        }
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center font-black uppercase text-xl dark:text-white">
                Loading Details...
            </div>
        );
    if (!booking)
        return (
            <div className="min-h-screen flex items-center justify-center font-black uppercase text-xl text-red-500">
                Job not found
            </div>
        );

    const statusInfo = getStatusInfo(booking);
    const showActions = shouldShowHandymanActions(booking);

    return (
        <div className="page-gradient flex flex-col min-h-screen dark:text-white bg-zinc-50 dark:bg-zinc-950">
            <Header />

            <main className="flex-grow flex flex-col items-center p-6 py-12 w-full max-w-3xl mx-auto">
                <div className="w-full mb-6">
                    <Link
                        href={`/${username}/dashboard`}
                        className="font-bold text-sm uppercase text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                <div className={`w-full bg-white dark:bg-zinc-900 border-2 p-8 md:p-12 rounded-[32px] transition-all
                    ${booking.is_urgent
                        ? "border-red-600 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]"
                        : "border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                    }`}
                >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                                #{booking.ticket_id}
                            </h1>
                            {booking.is_urgent && (
                                <div className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-black text-[10px] md:text-xs uppercase animate-pulse border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    🚨 Urgent Priority
                                </div>
                            )}
                        </div>
                        <span className={`text-center px-6 py-2 border-2 border-black font-black text-sm uppercase rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap ${statusInfo.badgeClass}`}>
                            {statusInfo.label}
                        </span>
                    </div>

                    <div className="space-y-6">
                        {/* Current State */}
                        <div className="p-4 bg-gray-50 dark:bg-zinc-800 border-2 border-black rounded-xl">
                            <p className="text-xs font-black uppercase tracking-widest text-[#EF9D39] dark:text-zinc-400 mb-1">Current state</p>
                            <div className="flex items-center justify-between gap-4 p-3 border-2 border-black rounded-xl bg-white dark:bg-zinc-800">
                                <p className="font-bold text-sm text-black dark:text-white leading-tight">{statusInfo.helperText}</p>
                                <div className="shrink-0 p-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg border-2 border-black">
                                    {statusInfo.icon}
                                </div>
                            </div>
                        </div>

                        {/* Client */}
                        <div>
                            <label className="text-xs font-black text-[#EF9D39] uppercase tracking-widest block mb-2">Client</label>
                            <div className="text-xl font-bold uppercase">{booking.client_name || "No client assigned yet"}</div>
                        </div>

                        {/* Service Type */}
                        <div>
                            <label className="text-xs font-black text-[#EF9D39] uppercase tracking-widest block mb-2">Service Type</label>
                            <div className="text-xl font-bold uppercase">{booking.service_type}</div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-black text-[#EF9D39] uppercase tracking-widest block mb-2">Description</label>
                            <div className="p-4 bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-xl font-bold">
                                {booking.description}
                            </div>
                        </div>

                        {/* Scheduling Timeline */}
                        <div className="border-2 border-black rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
                            <div className="px-4 py-3 bg-black">
                                <p className="text-[12px] font-black uppercase tracking-widest text-[#EF9D39] m-0">Scheduling timeline</p>
                            </div>
                            <div className="p-4 flex flex-col gap-0">
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center w-7 shrink-0">
                                        <div className="w-7 h-7 rounded-full bg-[#EF9D39] border-2 border-black flex items-center justify-center text-[11px] font-black text-black shrink-0">1</div>
                                        <div className="w-0.5 flex-1 bg-gray-200 dark:bg-zinc-700 min-h-6" />
                                    </div>
                                    <div className="pb-5 flex-1">
                                        <p className="text-[12px] font-black uppercase tracking-widest text-gray-400 mb-1">Client proposed</p>
                                        <p className="text-sm font-bold text-black dark:text-white">
                                            {formatDateTime(booking.client_proposed_time || booking.scheduled_time)}
                                        </p>
                                        {booking.client_counter_message && (
                                            <div className="mt-2 inline-flex gap-1.5 items-start bg-orange-50 dark:bg-zinc-800 border-2 border-black rounded-lg px-2.5 py-1.5">
                                                <span className="text-[12px] font-black uppercase text-[#EF9D39] whitespace-nowrap">Note:</span>
                                                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">{booking.client_counter_message}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {booking.handyman_proposed_time && (
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center w-7 shrink-0">
                                            <div className="w-7 h-7 rounded-full bg-violet-400 border-2 border-black flex items-center justify-center text-[11px] font-black text-black shrink-0">2</div>
                                            <div className="w-0.5 flex-1 bg-gray-200 dark:bg-zinc-700 min-h-6" />
                                        </div>
                                        <div className="pb-5 flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Your counter</p>
                                            <p className="text-sm font-bold text-black dark:text-white mb-2">{formatDateTime(booking.handyman_proposed_time)}</p>
                                            {booking.handyman_counter_message && (
                                                <div className="inline-flex gap-1.5 items-start bg-violet-50 dark:bg-zinc-800 border-2 border-black rounded-lg px-2.5 py-1.5">
                                                    <span className="text-[12px] font-black uppercase text-violet-500 whitespace-nowrap">Note:</span>
                                                    <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">{booking.handyman_counter_message}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {booking.duration_minutes && (
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center w-7 shrink-0">
                                            <div className="w-7 h-7 rounded-full bg-blue-400 border-2 border-black flex items-center justify-center text-[11px] font-black text-black shrink-0">3</div>
                                            <div className="w-0.5 flex-1 bg-gray-200 dark:bg-zinc-700 min-h-6" />
                                        </div>
                                        <div className="pb-5 flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Estimated duration</p>
                                            <p className="text-sm font-bold text-black dark:text-white">{booking.duration_minutes} minutes</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center w-7 shrink-0">
                                        <div className="w-7 h-7 rounded-full bg-green-400 border-2 border-black flex items-center justify-center shrink-0">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[12px] font-black uppercase tracking-widest text-gray-400 mb-1">Confirmed appointment</p>
                                        <p className={`text-sm font-black ${booking.status === "accepted" || booking.negotiation_status === "agreed" ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                                            {formatDateTime(
                                                booking.status === "accepted" || booking.negotiation_status === "agreed"
                                                    ? booking.scheduled_time : null
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Knows Fix Toggle */}
                        <div
                            onClick={() => { if (booking?.status === 'pending') setKnowsFix(!knowsFix); }}
                            className={`p-4 border-2 rounded-xl transition-all flex items-center justify-between
                                ${booking?.status !== 'pending' ? "opacity-60 cursor-not-allowed border-gray-300 bg-gray-50" : "cursor-pointer"}
                                ${knowsFix ? "bg-green-50 dark:bg-green-900/20 border-green-600 shadow-[4px_4px_0px_0px_#16a34a]" : "bg-white dark:bg-zinc-800 border-black shadow-[4px_4px_0px_0px_#000000]"}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${knowsFix ? 'bg-green-600 text-white border-green-700' : 'bg-zinc-100 text-gray-400 border-black'}`}>
                                    <CheckCircle size={20} className={knowsFix ? "text-white" : "text-gray-400"} />
                                </div>
                                <div>
                                    <p className={`text-sm font-black uppercase tracking-tight ${knowsFix ? "text-green-700 dark:text-green-400" : "text-black dark:text-white"}`}>
                                        Skip Inspection?
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-tight">
                                        {knowsFix ? "Confirmed: Moving straight to repair" : "I know the problem, go straight to repair phase"}
                                    </p>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full border-2 border-black relative transition-colors ${knowsFix ? 'bg-green-500' : 'bg-gray-200'}`}>
                                <div className={`absolute top-0.5 w-4 h-4 bg-white border-2 border-black rounded-full transition-all ${knowsFix ? 'left-6' : 'left-0.5'}`} />
                            </div>
                        </div>

                        {/* Negotiation expiry timer */}
                        {timeLeft > 0 && booking.status !== "accepted" && booking.status !== "completed" && (
                            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-500 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Timer className="text-orange-500 animate-pulse" size={24} />
                                    <div>
                                        <p className="text-[12px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">Response Deadline</p>
                                        <p className="text-xl font-black text-black dark:text-white tabular-nums">{formatMs(timeLeft)}</p>
                                    </div>
                                </div>
                                {timeLeft < 15 * 60 * 1000 && (
                                    <span className="text-[12px] bg-red-500 text-white px-2 py-1 rounded font-black uppercase animate-bounce">Expiring soon!</span>
                                )}
                            </div>
                        )}

                        {/* ── ACCEPTED: countdown do početka posla ── */}
                        {booking.status === "accepted" && secondsUntilUnlock !== null && secondsUntilUnlock > 0 && (
                            <div className="p-4 bg-violet-50 dark:bg-violet-950/20 border-2 border-violet-500 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Wrench className="text-violet-500 animate-pulse" size={24} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">Job unlocks in</p>
                                        <p className="text-xl font-black text-black dark:text-white tabular-nums">{formatMs(secondsUntilUnlock * 1000)}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] bg-violet-500 text-white px-2 py-1 rounded font-black uppercase">Scheduled</span>
                            </div>
                        )}

                        {/* ── IN PROGRESS: handyman označava kraj ── */}
                        {booking.status === "in_progress" && (
                            <div className="p-6 bg-violet-50 dark:bg-zinc-800/60 border-2 border-violet-500 rounded-xl space-y-4 shadow-[4px_4px_0px_0px_#7c3aed]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-violet-500 border-2 border-black flex items-center justify-center shrink-0">
                                        <Wrench size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-black uppercase text-base text-black dark:text-white tracking-tight">Job In Progress</h3>
                                        <p className="text-xs font-bold text-gray-500">Click below when you have finished the inspection.</p>
                                    </div>
                                </div>
                                {actionError && <p className="text-sm font-black text-red-600">{actionError}</p>}
                                {actionSuccess && <p className="text-sm font-black text-green-700 dark:text-green-400">{actionSuccess}</p>}
                                <button
                                    onClick={handleMarkDone}
                                    disabled={markDoneLoading}
                                    className="w-full bg-white dark:bg-black text-black dark:text-white border-2 border-black py-3.5 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0px_0px_#7c3aed] hover:bg-violet-50 dark:hover:bg-zinc-800 active:translate-y-1 active:shadow-none transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {markDoneLoading
                                        ? <Loader2 size={14} className="animate-spin" />
                                        : <><Flag size={14} /> Mark Job as Finished</>
                                    }
                                </button>
                            </div>
                        )}

                        {/* ── HANDYMAN DONE: čekamo klijenta ── */}
                        {booking.status === "handyman_done" && (
                            <div className="p-5 bg-purple-50 dark:bg-zinc-800/60 border-2 border-purple-400 rounded-xl flex items-center gap-3 shadow-[4px_4px_0px_0px_#a855f7]">
                                <Loader2 size={18} className="animate-spin text-purple-500 shrink-0" />
                                <div>
                                    <p className="font-black uppercase text-sm text-black dark:text-white">Waiting for client confirmation</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Client has 60 minutes to confirm. Auto-completes after.</p>
                                </div>
                            </div>
                        )}

                        {booking.status === "not_completed" && (
                            <div className="p-5 bg-red-50 dark:bg-zinc-800/60 border-2 border-red-400 rounded-xl flex items-center gap-3 shadow-[4px_4px_0px_0px_#ef4444]">
                                <AlertCircle size={18} className="text-red-500 shrink-0" />
                                <div>
                                    <p className="font-black uppercase text-sm text-black dark:text-white">Client marked job as not completed</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contact client and arrange follow-up before payment step.</p>
                                </div>
                            </div>
                        )}

                        {/* Handyman action panel (accept/decline/counter) */}
                        {showActions && (
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-3 justify-center">
                                    <button
                                        onClick={() => { setAcceptOpen(v => !v); setCounterOpen(false); clearActionMessages(); }}
                                        className="cursor-pointer bg-white text-black dark:bg-black dark:text-white border-[3px] border-black px-6 py-2.5 rounded-[20px] font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0px_0px_#4ade80] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#4ade80] transition-all active:translate-y-1 active:shadow-none"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleDecline()}
                                        disabled={actionLoading}
                                        className="cursor-pointer bg-white dark:bg-black text-black dark:text-white border-[3px] border-black px-6 py-2.5 rounded-[20px] font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0px_0px_#f87171] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#f87171] transition-all active:translate-y-1 active:shadow-none disabled:opacity-60"
                                    >
                                        {actionLoading && !acceptOpen && !counterOpen ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Decline"}
                                    </button>
                                    <button
                                        onClick={() => { setCounterOpen(v => !v); setAcceptOpen(false); clearActionMessages(); }}
                                        className="cursor-pointer bg-white dark:bg-black text-black dark:text-white border-[3px] border-black px-6 py-2.5 rounded-[20px] font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0px_0px_#EF9D39] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#EF9D39] transition-all active:translate-y-1 active:shadow-none"
                                    >
                                        Counter
                                    </button>
                                </div>

                                {/* Accept Form */}
                                {acceptOpen && (
                                    <div className="p-5 border-2 border-black rounded-xl bg-green-50 dark:bg-zinc-900 animate-in slide-in-from-top-2 shadow-[4px_4px_0px_0px_#000] space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-500">Scheduled time</label>
                                                <div className="bg-white dark:bg-zinc-800 border-2 border-black rounded-xl p-4 font-bold text-sm text-black dark:text-white">
                                                    {formatDateTime(booking.client_proposed_time || booking.scheduled_time)}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-500">Duration (minutes) *Required</label>
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="text" inputMode="numeric" placeholder="e.g. 60"
                                                        className="w-full bg-white dark:bg-zinc-800 border-2 border-black rounded-xl p-4 pr-14 font-bold text-sm text-black dark:text-white outline-none focus:border-green-500"
                                                        value={acceptDuration}
                                                        onChange={(e) => setAcceptDuration(e.target.value.replace(/\D/g, ""))}
                                                    />
                                                    <span className="absolute right-4 font-black text-[10px] text-gray-400 uppercase">MIN</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleAccept} disabled={actionLoading}
                                            className="cursor-pointer w-full bg-black text-white py-3.5 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0px_0px_#16a34a] hover:bg-zinc-800 active:translate-y-1 active:shadow-none transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                        >
                                            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : "Confirm & Accept"}
                                        </button>
                                    </div>
                                )}

                                {/* Counter Form */}
                                {counterOpen && (
                                    <div className="border-2 border-black rounded-xl bg-[#FFF8EA] dark:bg-zinc-900 p-5 space-y-4 animate-in slide-in-from-top-2 shadow-[4px_4px_0px_0px_#000]">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Pick new time *Required</label>
                                                <div
                                                    onClick={() => setIsCalendarOpen(true)}
                                                    className="relative cursor-pointer bg-white dark:bg-zinc-800 border-2 border-black rounded-xl p-4 pl-12 font-bold text-sm min-h-[50px] flex items-center hover:border-[#EF9D39] transition-colors"
                                                >
                                                    <CalendarIcon className="absolute left-4 text-gray-400" size={16} />
                                                    {counterProposedTime
                                                        ? <span className="text-black dark:text-white">{formatDateTime(counterProposedTime)}</span>
                                                        : <span className="text-gray-400 text-xs">SELECT DATE & TIME</span>
                                                    }
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Duration (minutes) *Required</label>
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="text" inputMode="numeric" placeholder="e.g. 60"
                                                        className="w-full bg-white dark:bg-zinc-800 border-2 border-black rounded-xl p-4 pr-14 font-bold text-sm text-black dark:text-white outline-none focus:border-[#EF9D39] min-h-[50px]"
                                                        value={counterDuration}
                                                        onChange={(e) => setCounterDuration(e.target.value.replace(/\D/g, ""))}
                                                    />
                                                    <span className="absolute right-4 font-black text-[10px] text-gray-400 uppercase">MIN</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Message to client (optional)</label>
                                            <textarea
                                                rows={3} placeholder="Could you do a little earlier/later?"
                                                value={counterMessage} onChange={(e) => setCounterMessage(e.target.value)}
                                                className="w-full bg-white dark:bg-zinc-800 border-2 border-black rounded-xl p-4 font-bold text-sm text-black dark:text-white outline-none focus:border-[#EF9D39] resize-none"
                                            />
                                        </div>
                                        <button
                                            onClick={handleCounter} disabled={actionLoading}
                                            className="cursor-pointer w-full bg-black text-white py-3.5 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0px_0px_#EF9D39] hover:bg-zinc-800 active:translate-y-1 active:shadow-none transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                        >
                                            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : "Send Counter Offer"}
                                        </button>
                                    </div>
                                )}

                                {actionError && <p className="text-sm font-black text-red-600">{actionError}</p>}
                                {actionSuccess && <p className="text-sm font-black text-green-700 dark:text-green-400">{actionSuccess}</p>}
                            </div>
                        )}

                        {/* Waiting for client after counter */}
                        {booking.negotiation_status === "awaiting_client" && booking.status !== "cancelled" && (
                            <div className="bg-zinc-100 dark:bg-zinc-700 border-2 border-dashed border-black px-4 py-3 rounded-xl flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin text-[#EF9D39]" />
                                <span className="font-black uppercase text-[10px] dark:text-white">Waiting for client confirmation</span>
                            </div>
                        )}

                        {/* Calendar Modal */}
                        {isCalendarOpen && (
                            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-4">
                                <div className="bg-white dark:bg-zinc-900 border-4 border-black rounded-[40px] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 max-w-2xl w-full relative flex flex-col items-center">
                                    <button type="button" onClick={() => setIsCalendarOpen(false)} className="absolute top-6 right-6 p-2 bg-black text-white rounded-full hover:bg-[#EF9D39] hover:text-black transition-all">
                                        <X size={24} />
                                    </button>
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl md:text-3xl font-black uppercase dark:text-white tracking-tighter">Pick a term</h2>
                                        <p className="text-[#EF9D39] font-black uppercase tracking-[0.2em] text-sm">Choose your termin</p>
                                    </div>
                                    <div className="flex justify-center w-full bg-white dark:bg-zinc-900 rounded-3xl border-2 border-black/10 pt-4 overflow-hidden">
                                        <DatePicker
                                            selected={counterProposedTime}
                                            onChange={(date: Date | null) => setCounterProposedTime(date)}
                                            inline showTimeSelect timeIntervals={5}
                                            timeFormat="HH:mm" dateFormat="dd.MM.yyyy HH:mm"
                                            minDate={new Date()} filterTime={filterPassedTime}
                                            calendarClassName="popup-brutalist-calendar-final"
                                            nextMonthButtonLabel=">" previousMonthButtonLabel="<"
                                        />
                                    </div>
                                    <button type="button" onClick={() => setIsCalendarOpen(false)} className="mt-8 bg-[#EF9D39] border-4 border-black px-12 py-3 rounded-2xl font-black uppercase text-lg shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                                        Confirm Choice
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Appointment Confirmed Card — vidljiv i tokom in_progress i handyman_done */}
                        {["accepted", "in_progress", "handyman_done", "not_completed", "completed"].includes(booking.status) && (
                            <div className="p-6 bg-[#EF9D39] border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2.5 h-2.5 bg-black rounded-full" />
                                    <h3 className="font-black text-black uppercase tracking-widest text-[11px]">Appointment Confirmed</h3>
                                </div>
                                <div className="bg-white border-2 border-black rounded-xl p-5 flex flex-col gap-3">
                                    <p className="font-black text-black text-2xl uppercase tracking-tight">{booking.client_name || "Client"}</p>
                                    <div className="h-0.5 bg-gray-100" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 shrink-0 rounded-lg border-2 border-black bg-gray-50 flex items-center justify-center">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                            </svg>
                                        </div>
                                        <span className="font-bold text-gray-800 text-sm">{booking.client_email || "Contact info unavailable"}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 shrink-0 rounded-lg border-2 border-black bg-gray-50 flex items-center justify-center">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />
                                            </svg>
                                        </div>
                                        <span className="font-bold text-gray-800 text-sm">{booking.client_phone || "Contact info unavailable"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Completed */}
                        {booking.status === "completed" && (
                            <div className="p-6 bg-green-50 dark:bg-green-950/20 border-2 border-green-500 rounded-xl shadow-[4px_4px_0px_0px_#16a34a] flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-500 border-2 border-black flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-black uppercase text-base text-green-700 dark:text-green-400">Job Completed!</p>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phase 1 finished. Payment phase coming next.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}