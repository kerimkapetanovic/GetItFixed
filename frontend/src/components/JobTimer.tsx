"use client";

import React, { useEffect, useState } from "react";
import { Timer } from "lucide-react";

export const JobTimer = ({ expiresAt }: { expiresAt: string | null }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!expiresAt) return;
    const calculate = () => {
      const diff = new Date(expiresAt).getTime() - new Date().getTime();
      setTimeLeft(Math.max(0, diff));
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt || timeLeft <= 0) return null;

  const seconds = Math.floor((timeLeft / 1000) % 60);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const isUrgent = timeLeft < 15 * 60 * 1000;

  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md border-2 font-black text-[11px] tabular-nums uppercase ${
      isUrgent
        ? 'bg-red-500 text-white border-red-500 animate-bounce'
        : 'bg-transparent border-orange-500 text-orange-600'
    }`}>
      <Timer size={12} className={isUrgent ? 'text-white animate-pulse' : 'text-orange-500 animate-pulse'} />
      {isUrgent ? 'Expiring soon! ' : 'Expires: '}
      {hours > 0 ? `${hours}h ` : ""}{minutes}m {seconds}s
    </span>
  );
};