"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "../../lib/axios";
import { BookingDetail } from "@/types/booking";
import { HandymanNewTicketToast } from "@/components/HandymanNewTicketToast";
import { getSeenTicketIds, markTicketSeen } from "@/lib/handymanSeenTickets";

export function HandymanNewTicketNotifier() {
  const params = useParams() as { username?: string };
  const username = params.username ?? "";

  const [toastJobs, setToastJobs] = useState<BookingDetail[]>([]);
  const [ready, setReady] = useState(false);

  const getUnseenJobs = useCallback((allJobs: BookingDetail[], seenIds: number[]) => {
    return allJobs
      .filter((j) => j.status === "pending" && !seenIds.includes(j.id))
      .sort((a, b) => b.id - a.id);
  }, []);

  useEffect(() => {
    if (!username) return;

    const role = localStorage.getItem("user_role");
    const loggedIn = localStorage.getItem("is_logged_in") === "true";
    if (role !== "handyman" || !loggedIn) {
      setReady(true);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const response = await api.get("/api/bookings/dashboard/");
        if (cancelled) return;
        const seen = getSeenTicketIds(username);
        setToastJobs((current) =>
          current.length > 0 ? current : getUnseenJobs(response.data, seen)
        );
      } catch (error) {
        console.error("Failed to load handyman notifications:", error);
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [username, getUnseenJobs]);

  const handleExpire = async (jobId: number) => {
    try {
      const res = await api.post(`/api/bookings/${jobId}/expire/`);
      const updated = res.data.booking ?? res.data;
      setToastJobs((prev) =>
        prev
          .map((job) => (job.id === jobId ? { ...job, ...updated } : job))
          .filter((job) => job.status === "pending")
      );
    } catch (error) {
      console.error("Expire failed:", error);
    }
  };

  const dismissToast = (jobId: number) => {
    if (!username) return;
    markTicketSeen(username, jobId);
    setToastJobs((prev) => prev.filter((job) => job.id !== jobId));
  };

  if (!ready || toastJobs.length === 0 || !username) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col-reverse gap-3 items-end pointer-events-none">
      {toastJobs.map((job) => (
        <HandymanNewTicketToast
          key={job.id}
          job={job}
          username={username}
          onDismiss={() => dismissToast(job.id)}
          onExpire={handleExpire}
        />
      ))}
    </div>
  );
}
