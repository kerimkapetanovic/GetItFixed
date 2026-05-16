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

  const [jobs, setJobs] = useState<BookingDetail[]>([]);
  const [toastJob, setToastJob] = useState<BookingDetail | null>(null);
  const [ready, setReady] = useState(false);

  const pickNextUnseen = useCallback(
    (allJobs: BookingDetail[], seenIds: number[]) => {
      return (
        allJobs
          .filter((j) => j.status === "pending" && !seenIds.includes(j.id))
          .sort((a, b) => b.id - a.id)[0] ?? null
      );
    },
    []
  );

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
        setJobs(response.data);
        const seen = getSeenTicketIds(username);
        setToastJob((current) => current ?? pickNextUnseen(response.data, seen));
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
  }, [username, pickNextUnseen]);

  const handleExpire = async (jobId: number) => {
    try {
      const res = await api.post(`/api/bookings/${jobId}/expire/`);
      const updated = res.data.booking ?? res.data;
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, ...updated } : job))
      );
      setToastJob((current) =>
        current?.id === jobId ? { ...current, ...updated } : current
      );
    } catch (error) {
      console.error("Expire failed:", error);
    }
  };

  const dismissToast = () => {
    if (!toastJob || !username) return;
    markTicketSeen(username, toastJob.id);
    const seen = [...getSeenTicketIds(username), toastJob.id];
    setToastJob(pickNextUnseen(jobs, seen));
  };

  if (!ready || !toastJob || !username) return null;

  return (
    <HandymanNewTicketToast
      job={toastJob}
      username={username}
      onDismiss={dismissToast}
      onExpire={handleExpire}
    />
  );
}
