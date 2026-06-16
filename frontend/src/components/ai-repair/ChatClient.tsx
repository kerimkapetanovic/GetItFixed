'use client';

import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import styles from './styles.module.css';
import { Message } from '../../types/ai';
import api from '../../../lib/axios';

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    role: 'assistant',
    text: 'Hi — I am the AI Repair Assistant. Describe the problem (e.g. "leaky faucet", "AC not cooling") and I will suggest troubleshooting steps.',
  },
];

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  function appendMessage(msg: Message) {
    setMessages((prev) => [...prev, msg]);
  }

  async function requestAiReply(userText: string) {
    setIsThinking(true);
    try {
      const response = await api.post('/api/ai-helper/', { message: userText });
      const status = response.data?.status;
      const category = response.data?.category;
      const explanation = response.data?.explanation;
      const fallbackMessage = response.data?.message;

      const aiText =
        status === 'match' && category
          ? `The category you should look for is "${category}".${explanation ? `\n\n${explanation}` : ''}`
          : fallbackMessage || explanation || 'I could not generate a clear recommendation right now.';

      appendMessage({
        id: `m-${Date.now()}`,
        role: 'assistant',
        text: aiText,
        timestamp: new Date().toISOString(),
      });
    } catch {
      appendMessage({
        id: `m-${Date.now()}`,
        role: 'assistant',
        text: 'The AI helper is currently unavailable. Please try again shortly.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsThinking(false);
    }
  }

  function handleSend(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    appendMessage(userMsg);
    setInput('');
    requestAiReply(text.trim());
  }

  const quickPrompts = [
    'Leaky faucet in kitchen',
    'AC not cooling on hot days',
    'Power outlet not working',
    'Shower tile loose',
  ];

  return (
    <div className={styles.container}>
      <div className={styles.panel}>

        {/* QUICK PROMPTS */}
        <div className={styles.quickArea}>
          <label className="text-[11px] font-semibold whitespace-nowrap text-gray-500 dark:text-[#555]">
            Quick prompts:
          </label>
          <div className={styles.quickButtons}>
            {quickPrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleSend(p)}
                className="px-3 py-1 text-[11px] rounded-full border transition-all
                  bg-gray-100 border-gray-200 text-gray-600
                  hover:bg-[#EF9D39] hover:text-black hover:border-[#EF9D39]
                  dark:bg-[#1e1e1e] dark:border-[#2a2a2a] dark:text-[#888]
                  dark:hover:bg-[#EF9D39] dark:hover:text-black dark:hover:border-[#EF9D39]"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* CHAT AREA */}
        <div
          className={`${styles.chatArea} bg-gray-50 border border-gray-100 dark:bg-[#0f0f0f] dark:border-[#1e1e1e]`}
          ref={scrollRef}
          aria-live="polite"
        >
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 mt-3">
              <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center font-extrabold text-[9px] flex-shrink-0
                bg-gray-200 text-gray-600
                dark:bg-[#1e1e1e] dark:border dark:border-[#EF9D39] dark:text-[#EF9D39]">
                AI
              </div>
              <div className="px-4 py-2 rounded-[14px] rounded-bl-[4px] text-[12px] italic
                bg-gray-100 text-gray-400
                dark:bg-[#1a1a1a] dark:border dark:border-[#252525] dark:text-[#555]">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className={styles.footer}>
          <InputBar
            value={input}
            setValue={setInput}
            onSend={() => handleSend(input)}
            disabled={isThinking}
            placeholder="Describe the issue (e.g. leaking pipe near sink)..."
          />
        </div>
      </div>
    </div>
  );
}