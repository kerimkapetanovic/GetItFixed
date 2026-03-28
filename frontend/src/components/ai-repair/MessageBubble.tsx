'use client';

import { useEffect, useState } from 'react';
import { Message } from '../../types/ai';

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  // Format time only on the client after hydration to avoid SSR/client mismatch.
  const [timeLabel, setTimeLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!message.timestamp) {
      setTimeLabel(null);
      return;
    }

    try {
      const d = new Date(message.timestamp);
      // Use 24-hour or 12-hour display based on your preference:
      const label = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTimeLabel(label);
    } catch {
      setTimeLabel(null);
    }
  }, [message.timestamp]);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3 mt-3`}>
      {!isUser && <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold">AI</div>}

      <div
        className={`max-w-[78%] px-4 py-2 rounded-lg text-sm ${
          isUser
            ? 'bg-black text-white rounded-br-none'
            : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 rounded-bl-none'
        }`}
      >
        <div>{message.text}</div>
        {timeLabel && (
          <div className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 text-right">
            {timeLabel}
          </div>
        )}
      </div>

      {isUser && <div className="w-8 h-8 rounded-full bg-yellow-300 text-black flex items-center justify-center font-bold">U</div>}
    </div>
  );
}