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
    Wrench, Flag, User, Wallet
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../../datepicker-custom.css";
import { addMinutes } from "date-fns";
import { BookingDetail } from "@/types/booking";
import type { QuoteLineItemInput } from "@/types/booking";
import {
    canHandymanSendOffer,
    getPhaseHint,
    getResponseDeadlineLabel,
} from "@/lib/handymanDeadline";
import { createQuote, getLatestQuote } from "@/lib/quoteEscrowApi";

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
    if (booking.status === "closed") {
        return {
            label: "Job Finished",
            badgeClass: "bg-green-400 text-black",
            helperText: "Payment acknowledged. This job is closed.",
            icon: <CheckCircle2 className="text-green-400 shrink-0" size={18} strokeWidth={3} />
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
    if (booking.status === "awaiting_payment") {
        return {
            label: "Awaiting Payment",
            badgeClass: "bg-amber-400 text-black",
            helperText: "Client must pay from their wallet to release funds to you.",
            icon: <Wallet className="text-amber-400 shrink-0" size={18} strokeWidth={3} />
        };
    }
    if (booking.status === "visit_fee_paid") {
        return {
            label: "Visit Paid",
            badgeClass: "bg-sky-300 text-black",
            helperText: "Client can decide whether to continue into quote flow.",
            icon: <Wallet className="text-sky-700 shrink-0" size={18} strokeWidth={3} />
        };
    }
    if (booking.status === "quote_pending_client") {
        return {
            label: "Quote Pending",
            badgeClass: "bg-indigo-300 text-black",
            helperText: "Itemized quote sent. Waiting for client decision.",
            icon: <AlertCircle className="text-indigo-700 shrink-0" size={18} strokeWidth={3} />
        };
    }
    if (booking.status === "funds_locked") {
        return {
            label: "Escrow Locked",
            badgeClass: "bg-cyan-300 text-black",
            helperText: "Funds are reserved. Complete work, then release escrow via payment step.",
            icon: <Wallet className="text-cyan-700 shrink-0" size={18} strokeWidth={3} />
        };
    }
    if (booking.status === "paid") {
        return {
            label: "Paid",
            badgeClass: "bg-emerald-400 text-black",
            helperText: "Payment received. Acknowledge to finish.",
            icon: <CheckCircle2 className="text-emerald-400 shrink-0" size={18} strokeWidth={3} />
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
            helperText: "Your offer (time & price) was sent. Waiting for the client to confirm.",
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

/** Allows digits and one decimal point with up to 2 fractional digits (KM). */
function sanitizeKmPriceInput(raw: string): string {
    const v = raw.replace(",", ".").replace(/[^\d.]/g, "");
    const parts = v.split(".");
    if (parts.length === 1) return parts[0];
    const head = parts[0];
    const tail = parts.slice(1).join("").slice(0, 2);
    return tail.length ? `${head}.${tail}` : `${head}.`;
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

type BusySlotResponse = {
    scheduled_time: string;
    duration_minutes?: number | null;
};

function shouldShowHandymanActions(booking: BookingDetail) {
    if (["cancelled", "accepted", "completed", "in_progress", "handyman_done", "not_completed", "awaiting_payment", "paid", "closed"].includes(booking.status)) return false;
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
    const [acceptPrice, setAcceptPrice] = useState("");

    // Counter panel
    const [counterOpen, setCounterOpen] = useState(false);
    const [counterProposedTime, setCounterProposedTime] = useState<Date | null>(null);
    const [counterDuration, setCounterDuration] = useState("");
    const [counterPrice, setCounterPrice] = useState("");
    const [counterMessage, setCounterMessage] = useState("");
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Action state
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");
    const expiryHandledRef = useRef(false);

    // Job completion
    const [markDoneLoading, setMarkDoneLoading] = useState(false);
    const [thanksLoading, setThanksLoading] = useState(false);
    const [jobFinishedModalOpen, setJobFinishedModalOpen] = useState(false);
    const [secondsUntilUnlock, setSecondsUntilUnlock] = useState<number | null>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const unlockZeroSyncRef = useRef(false);

    const [knowsFix, setKnowsFix] = useState(false);
    const [busySlots, setBusySlots] = useState<{ start: Date; end: Date }[]>([]);
    const [quoteItems, setQuoteItems] = useState<QuoteLineItemInput[]>([
        { category: "materials", description: "", quantity: 1, unit_price: 0, sort_order: 0 },
        { category: "labor", description: "", quantity: 1, unit_price: 0, sort_order: 1 },
    ]);
    const [quoteNotes, setQuoteNotes] = useState("");
    const [quoteLoading, setQuoteLoading] = useState(false);

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

    useEffect(() => {
        if (booking && !canHandymanSendOffer(booking)) {
            setAcceptOpen(false);
        }
    }, [booking?.handyman_response_phase]);

    const handleNegotiationExpire = async () => {
        if (!booking || expiryHandledRef.current) return;
        expiryHandledRef.current = true;
        try {
            const res = await api.post(`/api/bookings/${booking.id}/expire/`);
            setBooking(res.data.booking ?? res.data);
            setAcceptOpen(false);
            if (res.data.result === "post_proposal_started") {
                setActionError("");
                setActionSuccess("Client's requested time has passed. You can decline or send a counter offer — 3 hours left.");
            } else if (res.data.result === "declined") {
                setActionSuccess("Request expired and was declined automatically.");
            }
        } catch (e) {
            console.error("Expire failed:", e);
            expiryHandledRef.current = false;
        }
    };

    useEffect(() => {
        expiryHandledRef.current = false;
    }, [booking?.id, booking?.expires_at, booking?.handyman_response_phase]);

    // Negotiation expiry timer
    useEffect(() => {
        if (!booking || booking.status === "accepted" || booking.status === "completed" || booking.status === "awaiting_payment" || booking.status === "paid" || booking.status === "closed") {
            setTimeLeft(0);
            return;
        }
        const update = () => {
            const left = calculateTimeLeft(booking.expires_at);
            setTimeLeft(left);
            if (left === 0 && shouldShowHandymanActions(booking)) {
                handleNegotiationExpire();
            }
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [booking]);

    useEffect(() => {
        unlockZeroSyncRef.current = false;
    }, [booking?.id, booking?.scheduled_time]);

    // Live countdown until scheduled_time (same target as backend JobStatusCheckView)
    useEffect(() => {
        if (!booking || booking.status !== "accepted" || !booking.scheduled_time) {
            setSecondsUntilUnlock(null);
            return;
        }

        const targetMs = new Date(booking.scheduled_time).getTime();
        if (Number.isNaN(targetMs)) {
            setSecondsUntilUnlock(null);
            return;
        }

        const tick = () => {
            const left = Math.max(0, Math.floor((targetMs - Date.now()) / 1000));
            setSecondsUntilUnlock(left);

            if (left === 0 && !unlockZeroSyncRef.current) {
                unlockZeroSyncRef.current = true;
                api
                    .post(`/api/bookings/${booking.id}/status-check/`)
                    .then((res) => {
                        if (res.data?.status === "not_yet") {
                            unlockZeroSyncRef.current = false;
                            if (typeof res.data.seconds_left === "number") {
                                setSecondsUntilUnlock(Math.max(0, res.data.seconds_left));
                            }
                        } else {
                            setBooking(res.data);
                        }
                    })
                    .catch((e) => {
                        console.error("Status check at unlock failed:", e);
                        unlockZeroSyncRef.current = false;
                    });
            }
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [booking?.id, booking?.status, booking?.scheduled_time]);

    // ── POLLING: status-check backup (accepted → in_progress) ──
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
                }
            } catch (e) {
                console.error("Status check failed:", e);
            }
        };

        pollingRef.current = setInterval(poll, 30_000);

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [booking?.status, booking?.id]);

    useEffect(() => {
        if (!booking || booking.status !== "awaiting_payment") return;
        const poll = async () => {
            try {
                const res = await api.get<BookingDetail>(`/api/bookings/${booking.id}/`);
                const next = res.data;
                setBooking((prev) => {
                    if (prev?.status === "awaiting_payment" && next.status === "paid") {
                        api.get<{ wallet_balance?: number }>("/api/accounts/me/").then((me) => {
                            if (typeof window !== "undefined" && me.data.wallet_balance != null) {
                                localStorage.setItem("wallet_balance", String(me.data.wallet_balance));
                                window.dispatchEvent(new Event("profile-updated"));
                            }
                        });
                    }
                    return next;
                });
            } catch {
                /* ignore */
            }
        };
        poll();
        const id = setInterval(poll, 8000);
        return () => clearInterval(id);
    }, [booking?.id, booking?.status]);

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
                const slots = res.data as BusySlotResponse[];
                setBusySlots(slots.map((slot) => ({
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
            setActionError("Please enter estimated exact time in minutes.");
            return;
        }
        const priceNum = parseFloat(acceptPrice.replace(",", "."));
        if (!acceptPrice.trim() || isNaN(priceNum) || priceNum <= 0) {
            setActionError("Please enter the total job price in KM.");
            return;
        }
        clearActionMessages();
        try {
            setActionLoading(true);
            const res = await api.post(`/api/bookings/${booking.id}/handyman-action/`, {
                action: "accept",
                duration_minutes: Number(acceptDuration),
                agreed_price: priceNum,
                knows_fix: knowsFix,
            });
            setBooking(res.data);
            setActionSuccess("Offer sent to the client. They must confirm the deal before the appointment is locked in.");
            setAcceptOpen(false);
            setAcceptDuration("");
            setAcceptPrice("");
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
            setActionError("Please enter estimated exact time in minutes.");
            return;
        }
        const cPriceNum = parseFloat(counterPrice.replace(",", "."));
        if (!counterPrice.trim() || isNaN(cPriceNum) || cPriceNum <= 0) {
            setActionError("Please enter the total job price in KM for this offer.");
            return;
        }
        clearActionMessages();
        try {
            setActionLoading(true);
            const res = await api.post(`/api/bookings/${booking.id}/handyman-action/`, {
                action: "counter",
                proposed_time: toUtcIso(counterProposedTime),
                duration_minutes: Number(counterDuration),
                agreed_price: cPriceNum,
                message: counterMessage,
                knows_fix: knowsFix,
            });
            setBooking(res.data);
            setActionSuccess("Counter offer sent to client.");
            setCounterOpen(false);
            setCounterProposedTime(null);
            setCounterDuration("");
            setCounterPrice("");
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

    const handleThanksForPaying = async () => {
        if (!booking) return;
        clearActionMessages();
        try {
            setThanksLoading(true);
            const res = await api.post(`/api/bookings/${booking.id}/complete/`, { action: "acknowledge_payment" });
            setBooking(res.data);
            setJobFinishedModalOpen(true);
        } catch (e) {
            setActionError(getBackendErrorMessage(e));
        } finally {
            setThanksLoading(false);
        }
    };

    const updateQuoteItem = (index: number, patch: Partial<QuoteLineItemInput>) => {
        setQuoteItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    };

    const addQuoteItem = () => {
        setQuoteItems((prev) => [
            ...prev,
            { category: "other", description: "", quantity: 1, unit_price: 0, sort_order: prev.length },
        ]);
    };

    const removeQuoteItem = (index: number) => {
        setQuoteItems((prev) => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, sort_order: i })));
    };

    const submitItemizedQuote = async () => {
        if (!booking) return;
        clearActionMessages();
        const sanitized = quoteItems
            .map((item, idx) => ({
                ...item,
                description: item.description.trim(),
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                sort_order: idx,
            }))
            .filter((item) => item.description.length > 0);

        if (!sanitized.length) {
            setActionError("Add at least one quote line item with description.");
            return;
        }

        try {
            setQuoteLoading(true);
            await createQuote(booking.id, {
                line_items: sanitized,
                notes: quoteNotes.trim() || undefined,
            });
            const latestQuote = await getLatestQuote(booking.id);
            const refreshed = await api.get(`/api/bookings/${booking.id}/`);
            setBooking({ ...refreshed.data, latest_quote: latestQuote });
            setActionSuccess("Itemized quote sent to client. Waiting for their decision.");
        } catch (e) {
            setActionError(getBackendErrorMessage(e));
        } finally {
            setQuoteLoading(false);
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
    const showSendOffer = showActions && canHandymanSendOffer(booking);
    const phaseHint = getPhaseHint(booking);

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
                        {timeLeft > 0 && booking.status !== "accepted" && booking.status !== "completed" && booking.status !== "awaiting_payment" && booking.status !== "paid" && booking.status !== "closed" && (
                            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-500 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Timer className="text-orange-500 animate-pulse" size={24} />
                                    <div>
                                        <p className="text-[12px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">{getResponseDeadlineLabel(booking)}</p>
                                        <p className="text-xl font-black text-black dark:text-white tabular-nums">{formatMs(timeLeft)}</p>
                                    </div>
                                </div>
                                {timeLeft < 15 * 60 * 1000 && (
                                    <span className="text-[12px] bg-red-500 text-white px-2 py-1 rounded font-black uppercase animate-bounce">Expiring soon!</span>
                                )}
                            </div>
                        )}

                        {/* ── ACCEPTED: countdown do početka posla ── */}
                        {booking.status === "accepted" && secondsUntilUnlock !== null && secondsUntilUnlock >= 0 && (
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

                        {/* ── IN PROGRESS / HANDYMAN DONE: two columns — you vs client status ── */}
                        {(booking.status === "in_progress" || booking.status === "handyman_done") && (
                            <div className="p-6 bg-violet-50 dark:bg-zinc-800/60 border-2 border-violet-500 rounded-xl space-y-4 shadow-[4px_4px_0px_0px_#7c3aed]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-violet-500 border-2 border-black flex items-center justify-center shrink-0">
                                        <Wrench size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-black uppercase text-base text-black dark:text-white tracking-tight">
                                            {booking.status === "in_progress" ? "Job in progress" : "Waiting for client"}
                                        </h3>
                                        <p className="text-xs font-bold text-gray-500">
                                            {booking.status === "in_progress"
                                                ? "Finish your work, then mark done. The client must confirm on their side too."
                                                : "You marked this job finished. Red panel stays until the client confirms."}
                                        </p>
                                    </div>
                                </div>
                                {actionError && <p className="text-sm font-black text-red-600">{actionError}</p>}
                                {actionSuccess && <p className="text-sm font-black text-green-700 dark:text-green-400">{actionSuccess}</p>}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Handyman */}
                                    <div className="rounded-xl border-2 border-black bg-white dark:bg-zinc-900 p-4 flex flex-col justify-between min-h-[148px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-violet-500 border-2 border-black flex items-center justify-center shrink-0">
                                                <Wrench size={14} className="text-white" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
                                                You (handyman)
                                            </p>
                                        </div>
                                        {booking.status === "in_progress" ? (
                                            <button
                                                type="button"
                                                onClick={handleMarkDone}
                                                disabled={markDoneLoading}
                                                className="w-full bg-white dark:bg-black text-black dark:text-white border-2 border-black py-3 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-[3px_3px_0px_0px_#7c3aed] hover:bg-violet-50 dark:hover:bg-zinc-800 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                            >
                                                {markDoneLoading ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <>
                                                        <Flag size={14} /> Mark Job as Finished
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-2 text-center">
                                                <CheckCircle2 className="text-green-500 shrink-0" size={36} strokeWidth={2.5} />
                                                <p className="font-black text-sm text-black dark:text-white leading-tight">
                                                    You marked this job finished
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                    Waiting for client action
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Client — red until they confirm on their request */}
                                    <div
                                        className="rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/35 p-4 flex flex-col justify-center min-h-[148px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-black flex items-center justify-center shrink-0">
                                                <User size={14} className="text-white" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-red-700 dark:text-red-400">
                                                Client — confirm job
                                            </p>
                                        </div>
                                        <p className="font-black text-sm text-black dark:text-white leading-snug">
                                            {booking.status === "in_progress"
                                                ? "Pending (red until they confirm)"
                                                : "Still waiting — red until they open their request and tap Mark Job as Finished"}
                                        </p>
                                        <p className="text-[10px] font-bold text-red-800/80 dark:text-red-300/90 mt-2 leading-relaxed">
                                            {booking.status === "in_progress"
                                                ? "After you mark done, the client gets the same button on their booking. This turns green only when both sides are done."
                                                : "They have limited time to confirm; the job completes when they tap Mark Job as Finished."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── AWAITING PAYMENT (client wallet) ── */}
                        {booking.status === "awaiting_payment" && (
                            <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500 rounded-xl flex items-start gap-3 shadow-[4px_4px_0px_0px_#f59e0b]">
                                <Timer className="text-amber-500 shrink-0" size={22} />
                                <div>
                                    <p className="font-black uppercase text-sm text-black dark:text-white">Waiting for client payment</p>
                                    <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200/90 mt-1">
                                        They pay from their profile balance. This updates automatically when the payment goes through.
                                    </p>
                                    {booking.estimated_price != null && (
                                        <p className="text-xs font-black text-black dark:text-white mt-2 tabular-nums">
                                            Due: {Number(booking.estimated_price).toFixed(2)} KM
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {(booking.status === "visit_fee_paid" || booking.status === "quote_pending_client" || booking.status === "funds_locked") && (
                            <div className="p-6 bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-500 rounded-xl space-y-4 shadow-[4px_4px_0px_0px_#6366f1]">
                                <h3 className="font-black uppercase text-base text-black dark:text-white tracking-tight">
                                    Itemized Quote
                                </h3>

                                {booking.continue_job_confirmed !== true ? (
                                    <p className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                                        Waiting for client to choose <span className="font-black">Continue the Job</span>.
                                    </p>
                                ) : (
                                    <>
                                        {booking.status === "visit_fee_paid" && (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-12 gap-2 px-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
                                                    <p className="col-span-5">Description</p>
                                                    <p className="col-span-2">Category</p>
                                                    <p className="col-span-2 text-right">Qty</p>
                                                    <p className="col-span-2 text-right">Unit price (KM)</p>
                                                    <p className="col-span-1 text-center">Remove</p>
                                                </div>
                                                {quoteItems.map((item, idx) => (
                                                    <div key={idx} className="grid grid-cols-12 gap-2 bg-white dark:bg-zinc-900 border-2 border-black rounded-xl p-3">
                                                        <input
                                                            value={item.description}
                                                            onChange={(e) => updateQuoteItem(idx, { description: e.target.value })}
                                                            placeholder="Line item description"
                                                            className="col-span-5 border-2 border-black rounded px-2 py-2 text-xs font-bold bg-white dark:bg-zinc-800"
                                                        />
                                                        <select
                                                            value={item.category}
                                                            onChange={(e) => updateQuoteItem(idx, { category: e.target.value as QuoteLineItemInput["category"] })}
                                                            className="col-span-2 border-2 border-black rounded px-2 py-2 text-xs font-bold bg-white dark:bg-zinc-800"
                                                        >
                                                            <option value="materials">Materials</option>
                                                            <option value="labor">Labor</option>
                                                            <option value="other">Other</option>
                                                        </select>
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            placeholder="0"
                                                            value={item.quantity === 0 ? "" : String(item.quantity)}
                                                            onChange={(e) => {
                                                                const raw = e.target.value.replace(",", ".").trim();
                                                                if (raw === "") {
                                                                    updateQuoteItem(idx, { quantity: 0 });
                                                                    return;
                                                                }
                                                                const parsed = Number(raw);
                                                                if (!Number.isNaN(parsed)) {
                                                                    updateQuoteItem(idx, { quantity: parsed });
                                                                }
                                                            }}
                                                            className="col-span-2 border-2 border-black rounded px-2 py-2 text-xs font-bold bg-white dark:bg-zinc-800 text-right"
                                                        />
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            placeholder="0"
                                                            value={item.unit_price === 0 ? "" : String(item.unit_price)}
                                                            onChange={(e) => {
                                                                const raw = e.target.value.replace(",", ".").trim();
                                                                if (raw === "") {
                                                                    updateQuoteItem(idx, { unit_price: 0 });
                                                                    return;
                                                                }
                                                                const parsed = Number(raw);
                                                                if (!Number.isNaN(parsed)) {
                                                                    updateQuoteItem(idx, { unit_price: parsed });
                                                                }
                                                            }}
                                                            className="col-span-2 border-2 border-black rounded px-2 py-2 text-xs font-bold bg-white dark:bg-zinc-800 text-right"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeQuoteItem(idx)}
                                                            className="col-span-1 border-2 border-black rounded px-2 py-2 text-xs font-black uppercase bg-red-100 dark:bg-red-950/30"
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                ))}
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={addQuoteItem}
                                                        className="border-2 border-black rounded px-3 py-2 text-[10px] font-black uppercase bg-white dark:bg-zinc-900"
                                                    >
                                                        Add Item
                                                    </button>
                                                </div>
                                                <textarea
                                                    value={quoteNotes}
                                                    onChange={(e) => setQuoteNotes(e.target.value)}
                                                    rows={3}
                                                    placeholder="Optional quote notes"
                                                    className="w-full border-2 border-black rounded-xl p-3 text-sm font-bold bg-white dark:bg-zinc-900"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={quoteLoading}
                                                    onClick={submitItemizedQuote}
                                                    className="w-full bg-white dark:bg-black text-black dark:text-white border-2 border-black py-3 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0px_0px_#6366f1] disabled:opacity-60"
                                                >
                                                    {quoteLoading ? "Sending..." : "Send Itemized Quote"}
                                                </button>
                                            </div>
                                        )}

                                        {booking.latest_quote && (
                                            <div className="p-4 bg-white dark:bg-zinc-900 border-2 border-black rounded-xl">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                                    Latest quote summary
                                                </p>
                                                <p className="text-sm font-bold">
                                                    Version #{booking.latest_quote.version} - {booking.latest_quote.status}
                                                </p>
                                                <p className="text-lg font-black text-[#EF9D39] mt-1">
                                                    {Number(booking.latest_quote.total_amount).toFixed(2)} KM
                                                </p>
                                            </div>
                                        )}

                                        {booking.status === "funds_locked" && (
                                            <p className="text-sm font-black text-cyan-800 dark:text-cyan-300">
                                                Escrow locked: {Number(booking.quote_locked_amount ?? 0).toFixed(2)} KM
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── PAID: expert acknowledges ── */}
                        {booking.status === "paid" && (
                            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-500 rounded-xl space-y-4 shadow-[4px_4px_0px_0px_#10b981]">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-emerald-500 shrink-0" size={28} />
                                    <div>
                                        <p className="font-black uppercase text-sm text-black dark:text-white">Payment received</p>
                                        <p className="text-xs font-bold text-gray-600 dark:text-zinc-400">
                                            The client paid {booking.payment_amount != null ? Number(booking.payment_amount).toFixed(2) : "—"} KM to your wallet. Tap below to close the job.
                                        </p>
                                    </div>
                                </div>
                                {actionError && <p className="text-sm font-black text-red-600">{actionError}</p>}
                                <button
                                    type="button"
                                    onClick={handleThanksForPaying}
                                    disabled={thanksLoading}
                                    className="w-full bg-white dark:bg-black text-black dark:text-white border-[3px] border-black py-3.5 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0px_0px_#10b981] hover:bg-emerald-50 dark:hover:bg-zinc-800 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {thanksLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                    Thanks for Paying
                                </button>
                            </div>
                        )}

                        {/* ── CLOSED (payment acknowledged) ── */}
                        {booking.status === "closed" && (
                            <div className="p-6 bg-green-50 dark:bg-green-950/25 border-2 border-green-500 rounded-xl text-center shadow-[4px_4px_0px_0px_#22c55e]">
                                <CheckCircle2 className="mx-auto text-green-600 mb-2" size={40} strokeWidth={2.5} />
                                <h3 className="font-black uppercase text-lg text-black dark:text-white">Job finished</h3>
                                <p className="text-sm font-bold text-gray-600 dark:text-zinc-400 mt-1">See you on the next booking.</p>
                            </div>
                        )}

                        {/* ── BOTH DONE (legacy bookings before payment flow) ── */}
                        {booking.status === "completed" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-950/30 p-4 flex items-center gap-3 shadow-[3px_3px_0px_0px_#16a34a]">
                                    <CheckCircle2 className="text-green-600 shrink-0" size={28} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-green-700 dark:text-green-400">Handyman</p>
                                        <p className="font-black text-sm text-black dark:text-white">Marked job finished</p>
                                    </div>
                                </div>
                                <div className="rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-950/30 p-4 flex items-center gap-3 shadow-[3px_3px_0px_0px_#16a34a]">
                                    <CheckCircle2 className="text-green-600 shrink-0" size={28} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-green-700 dark:text-green-400">Client</p>
                                        <p className="font-black text-sm text-black dark:text-white">Confirmed completion</p>
                                    </div>
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

                        {phaseHint && showActions && (
                            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-500 rounded-2xl">
                                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">{phaseHint}</p>
                            </div>
                        )}

                        {/* Handyman action panel (accept/decline/counter) */}
                        {showActions && (
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {showSendOffer && (
                                    <button
                                        onClick={() => { setAcceptOpen(v => !v); setCounterOpen(false); clearActionMessages(); }}
                                        className="cursor-pointer bg-white text-black dark:bg-black dark:text-white border-[3px] border-black px-6 py-2.5 rounded-[20px] font-black uppercase text-[11px] tracking-widest shadow-[4px_4px_0px_0px_#4ade80] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#4ade80] transition-all active:translate-y-1 active:shadow-none"
                                    >
                                        Send offer
                                    </button>
                                    )}
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
{acceptOpen && showSendOffer && (
    <div className="p-4 md:p-5 border-[3px] border-black rounded-2xl bg-green-50 dark:bg-zinc-900 animate-in slide-in-from-top-2 shadow-[6px_6px_0px_0px_#000] space-y-3">
        <p className="text-xs font-black uppercase tracking-wide text-gray-700 dark:text-zinc-300">
            Enter how long the job should take and your total price. This is sent to the client to confirm — no payment happens until later in the flow.
        </p>
        <div className="space-y-3">
            <div>
                <label className="text-[11px] font-black uppercase tracking-widest mb-2 block text-gray-600 dark:text-zinc-400">Appointment time (from request)</label>
                <div className="bg-white dark:bg-zinc-800 border-[3px] border-black rounded-xl p-3.5 min-h-[64px] flex items-center font-black text-base md:text-lg text-black dark:text-white">
                    {formatDateTime(booking.client_proposed_time || booking.scheduled_time)}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-600 dark:text-zinc-400">
                        Estimated exact time (minutes) *
                    </label>
                    <div className="relative">
                        <input
                            type="text" inputMode="numeric" placeholder="60"
                            className="box-border flex h-[90px] w-full items-center bg-white px-4 pr-14 font-black text-2xl text-black outline-none focus:border-green-500 dark:bg-zinc-800 dark:text-white border-[3px] border-black rounded-xl"
                            value={acceptDuration}
                            onChange={(e) => setAcceptDuration(e.target.value.replace(/\D/g, ""))}
                        />
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs uppercase text-gray-400">min</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-600 dark:text-zinc-400">
                        Total job price (KM) *
                    </label>
                    <div className="relative">
                        <input
                            type="text" inputMode="decimal" placeholder="120"
                            className="box-border flex h-[90px] w-full items-center bg-white px-4 pr-14 font-black text-2xl text-black outline-none focus:border-green-500 dark:bg-zinc-800 dark:text-white border-[3px] border-black rounded-xl"
                            value={acceptPrice}
                            onChange={(e) => setAcceptPrice(sanitizeKmPriceInput(e.target.value))}
                        />
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs uppercase text-gray-400">KM</span>
                    </div>
                </div>
            </div>
        </div>
        <button
            onClick={handleAccept} disabled={actionLoading}
            className="cursor-pointer w-full bg-black text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-[5px_5px_0px_0px_#16a34a] hover:bg-zinc-800 active:translate-y-1 active:shadow-none transition-all disabled:opacity-60 flex items-center justify-center gap-2 min-h-[48px]"
        >
            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : "Send offer to client"}
        </button>
    </div>
)}


{/* Counter Form */}
{counterOpen && (
    <div className="border-[3px] border-black rounded-2xl bg-[#FFF8EA] dark:bg-zinc-900 p-4 md:p-5 space-y-3 animate-in slide-in-from-top-2 shadow-[6px_6px_0px_0px_#000]">
        <p className="text-xs font-black uppercase tracking-wide text-gray-700 dark:text-zinc-300">
            Propose a new time, estimated exact duration, and total price. The client confirms before the booking is final — payment stays later.
        </p>
        <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-600 dark:text-zinc-400">Pick new appointment time *</label>
            <div
                onClick={() => setIsCalendarOpen(true)}
                className="relative cursor-pointer bg-white dark:bg-zinc-800 border-[3px] border-black rounded-xl p-4 pl-12 font-black text-base md:text-lg min-h-[74px] flex items-center hover:border-[#EF9D39] transition-colors"
            >
                <CalendarIcon className="absolute left-4 text-gray-400" size={20} />
                {counterProposedTime
                    ? <span className="text-black dark:text-white">{formatDateTime(counterProposedTime)}</span>
                    : <span className="text-gray-400 text-xs uppercase">Tap to select date & time</span>
                }
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-600 dark:text-zinc-400">
                    Estimated exact time (minutes) *
                </label>
                <div className="relative">
                    <input
                        type="text" inputMode="numeric" placeholder="60"
                        className="box-border flex h-[90px] w-full items-center bg-white px-4 pr-14 font-black text-2xl text-black outline-none focus:border-[#EF9D39] dark:bg-zinc-800 dark:text-white border-[3px] border-black rounded-xl"
                        value={counterDuration}
                        onChange={(e) => setCounterDuration(e.target.value.replace(/\D/g, ""))}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs uppercase text-gray-400">min</span>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-600 dark:text-zinc-400">
                    Total job price (KM) *
                </label>
                <div className="relative">
                    <input
                        type="text" inputMode="decimal" placeholder="150"
                        className="box-border flex h-[90px] w-full items-center bg-white px-4 pr-14 font-black text-2xl text-black outline-none focus:border-[#EF9D39] dark:bg-zinc-800 dark:text-white border-[3px] border-black rounded-xl"
                        value={counterPrice}
                        onChange={(e) => setCounterPrice(sanitizeKmPriceInput(e.target.value))}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs uppercase text-gray-400">KM</span>
                </div>
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Message to client (optional)</label>
            <textarea
                rows={3} placeholder="Could you do a little earlier/later?"
                value={counterMessage} onChange={(e) => setCounterMessage(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border-2 border-black rounded-xl p-3 font-bold text-sm text-black dark:text-white outline-none focus:border-[#EF9D39] resize-none"
            />
        </div>
        <button
            onClick={handleCounter} disabled={actionLoading}
            className="cursor-pointer w-full bg-black text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-[5px_5px_0px_0px_#EF9D39] hover:bg-zinc-800 active:translate-y-1 active:shadow-none transition-all disabled:opacity-60 flex items-center justify-center gap-2 min-h-[48px]"
        >
            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : "Send counter offer to client"}
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
                        {["accepted", "in_progress", "handyman_done", "awaiting_payment", "paid", "closed", "not_completed", "completed"].includes(booking.status) && (
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
                                    {booking.agreed_price != null && (
                                        <div className="pt-2 border-t border-gray-100 mt-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Agreed job price</p>
                                            <p className="font-black text-black text-lg tabular-nums">{Number(booking.agreed_price).toFixed(2)} KM</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>

            {jobFinishedModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
                    <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-zinc-700 p-8 rounded-[24px] shadow-[8px_8px_0px_0px_rgba(34,197,94,0.45)] text-center">
                        <CheckCircle2 className="mx-auto text-green-500 mb-3" size={48} strokeWidth={2.5} />
                        <h3 className="text-2xl font-black uppercase text-black dark:text-white">Job finished</h3>
                        <p className="text-sm font-bold text-gray-600 dark:text-zinc-400 mt-2">Thank you for your work on GetItFixed.</p>
                        <button
                            type="button"
                            onClick={() => setJobFinishedModalOpen(false)}
                            className="mt-6 w-full bg-[#EF9D39] text-black border-[3px] border-black py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}