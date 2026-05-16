"use client";

import React, { useEffect, useState } from "react";
import { Timer } from "lucide-react";

// 1. Dodajemo interface da TS zna šta komponenta prima
interface JobTimerProps {
  expiresAt: string | null;
  onExpire?: () => void; // Funkcija koju pozivamo kad istekne vrijeme
}

export const JobTimer = ({ expiresAt, onExpire }: JobTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    setHasExpired(false);
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt) return;

    const calculate = () => {
      const diff = new Date(expiresAt).getTime() - new Date().getTime();
      const remaining = Math.max(0, diff);
      
      setTimeLeft(remaining);

      // 2. Ključni dio: Ako je došlo do nule, a nismo još okinuli onExpire
      if (remaining === 0 && !hasExpired) {
        setHasExpired(true);
        if (onExpire) onExpire();
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire, hasExpired]); // Dodani dependencies

  // Ako nema datuma ili je skroz isteklo, ne rendamo ništa (ili rendamo EXPIRED)
  if (!expiresAt || (timeLeft <= 0 && hasExpired)) return null;

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