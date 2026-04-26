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
    // NOTE: no timestamp here to avoid server/client mismatch
  },
];

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // auto-scroll on new message
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
      timestamp: new Date().toISOString(), // created on client interaction — OK
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
       

        <div className={styles.quickArea}>
          <label className="text-xs font-semibold mr-2 text-gray-700 dark:text-zinc-300">Quick prompts:</label>
          <div className={styles.quickButtons}>
            {quickPrompts.map((p) => (
              <button
                key={p}
                type="button"
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700"
                onClick={() => handleSend(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.chatArea} ref={scrollRef} aria-live="polite">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {isThinking && (
            <div className="flex items-start gap-2 mt-2">
              <div className={styles.assistantAvatar} aria-hidden />
              <div className="bg-gray-100 dark:bg-zinc-800 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-zinc-300">
                <em>Thinking...</em>
              </div>
            </div>
          )}
        </div>

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