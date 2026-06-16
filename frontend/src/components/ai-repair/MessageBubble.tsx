'use client';

import { useEffect, useState } from 'react';
import { Message } from '../../types/ai';

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  const [timeLabel, setTimeLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!message.timestamp) { setTimeLabel(null); return; }
    try {
      const d = new Date(message.timestamp);
      setTimeLabel(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch { setTimeLabel(null); }
  }, [message.timestamp]);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start gap-2 mt-3`}>

      {/* AI avatar */}
      {!isUser && (
        <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center font-extrabold text-[9px] flex-shrink-0
          bg-gray-200 text-gray-700
          dark:bg-[#1e1e1e] dark:border dark:border-[#EF9D39] dark:text-[#EF9D39]">
          AI
        </div>
      )}

      {/* Bubble */}
      <div className="max-w-[78%]">
        <div className={`px-4 py-2 text-[13px] leading-relaxed
          ${isUser
            ? 'bg-black text-white rounded-[14px] rounded-br-[4px] font-semibold dark:bg-[#EF9D39] dark:text-black'
            : 'bg-gray-100 text-gray-800 rounded-[14px] rounded-bl-[4px] border border-gray-200 dark:bg-[#1a1a1a] dark:text-[#bbbbbb] dark:border-[#252525]'
          }`}>
          {message.text}
        </div>
        {timeLabel && (
          <div className={`text-[9px] mt-1 text-gray-400 dark:text-[#444] ${isUser ? 'text-right' : 'text-left'}`}>
            {timeLabel}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center font-extrabold text-[11px] flex-shrink-0
          bg-yellow-300 text-black">
          U
        </div>
      )}
    </div>
  );
}