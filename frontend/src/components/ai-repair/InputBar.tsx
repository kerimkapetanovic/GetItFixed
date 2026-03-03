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
        className="flex-1 px-4 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-yellow-200"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={disabled}
        className="px-4 py-2 bg-black text-white rounded-md disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}