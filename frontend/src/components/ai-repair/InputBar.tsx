'use client';

import { KeyboardEvent } from 'react';

export default function InputBar({
  value,
  setValue,
  onSend,
  disabled,
  placeholder,
}: {
  value: string;
  setValue: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        aria-label="Message input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-2 text-sm rounded-[10px] outline-none transition-all
          bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400
          focus:ring-2 focus:ring-yellow-200
          disabled:opacity-50
          dark:bg-[#1a1a1a] dark:border-[#2a2a2a] dark:text-[#cccccc] dark:placeholder:text-[#555]
          dark:focus:ring-yellow-600"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={disabled}
        className="px-4 py-2 text-sm font-bold rounded-[10px] transition-all
          bg-black text-white
          hover:bg-gray-800
          disabled:opacity-40 disabled:cursor-not-allowed
          dark:bg-[#EF9D39] dark:text-black
          dark:hover:bg-[#d4882e]
          dark:disabled:bg-[#333] dark:disabled:text-[#666]"
      >
        Send
      </button>
    </div>
  );
}