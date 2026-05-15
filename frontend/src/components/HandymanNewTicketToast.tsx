"use client";

import React, { useEffect, useCallback } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { BookingDetail } from "@/types/booking";
import { JobTimer } from "@/components/JobTimer";

const AUTO_DISMISS_MS = 5000;

type HandymanNewTicketToastProps = {
  job: BookingDetail;
  username: string;
  onDismiss: () => void;
  onExpire: (jobId: number) => void;
};

export function HandymanNewTicketToast({
  job,
  username,
  onDismiss,
  onExpire,
}: HandymanNewTicketToastProps) {
  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    const timer = window.setTimeout(handleDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [job.id, handleDismiss]);

  return (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-[200] w-[min(340px,calc(100vw-2rem))] handyman-toast-enter"
    >
      <div
        className={`relative bg-white dark:bg-zinc-800 border-[3px] p-4 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
          job.is_urgent ? "border-red-600" : "border-black"
        }`}
      >
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
          className="absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-[3px_3px_0px_0px_#000] transition-transform hover:scale-110"
        >
          <X size={14} strokeWidth={3} />
        </button>

        <span className="absolute top-2 right-8 z-10 bg-red-500 text-white px-2 py-0.5 rounded-md font-black text-[9px] uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          New
        </span>

        <div className="space-y-2 pr-4 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-black text-[#EF9D39] px-2 py-0.5 rounded-md font-black text-[11px] tracking-widest uppercase">
              #{job.ticket_id}
            </span>
            <JobTimer expiresAt={job.expires_at} onExpire={() => onExpire(job.id)} />
          </div>

          <span className="text-[10px] font-black uppercase text-[#EF9D39] block">
            🔧 {job.service_type}
          </span>

          <h3 className="font-black text-sm uppercase leading-tight dark:text-white line-clamp-1">
            {job.client_name}
          </h3>

          <p className="text-xs font-bold text-gray-500 dark:text-zinc-400 line-clamp-2">
            {job.description}
          </p>
        </div>

        <Link
          href={`/${username}/dashboard/${job.id}`}
          onClick={handleDismiss}
          className="mt-3 block w-full text-center border-2 border-black bg-[#EF9D39] py-2 font-black uppercase text-[10px] tracking-widest text-black shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none rounded-xl"
        >
          View ticket
        </Link>
      </div>
    </div>
  );
}
