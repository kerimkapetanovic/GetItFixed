'use client';

import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import styles from './styles.module.css';
import { Message } from '../../types/ai';

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
  const [serviceCategory, setServiceCategory] = useState('general');
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

  function simulateAiReply(userText: string) {
    setIsThinking(true);

    const cannedReply = (() => {
      if (/leak|faucet|pipe/i.test(userText)) {
        return `Sounds like a leak. First check if the shut-off valve is working and turn off the water supply. Inspect the connection points and look for loose fittings or damaged washers. If the leak is from a joint, tightening may help. If it's from the faucet body, you may need a replacement cartridge.`;
      }
      if (/ac|air|cool/i.test(userText)) {
        return `If the AC is not cooling, check the thermostat settings, verify the filter is clean, and ensure the outdoor unit is running. If the compressor is not starting or there are strange noises, stop using the unit and consult a technician.`;
      }
      if (/electr|power|outlet/i.test(userText)) {
        return `For electrical issues, switch off power at the breaker before inspecting. Check for tripped breakers, loose outlet connections, or burnt smells. If you are unsure, hire a licensed electrician — electrical faults can be dangerous.`;
      }
      return `Thanks for the description. As a first step try these troubleshooting tips: 1) Inspect the obvious parts (connections, filters, switches). 2) Take photos and note error messages. 3) If it’s unsafe (smoke, sparks, major leaks), stop and call a pro. Tell me more details and I can suggest step-by-step actions.`;
    })();

    // Simulate streaming/typing delay
    setTimeout(() => {
      appendMessage({
        id: `m-${Date.now()}`,
        role: 'assistant',
        text: cannedReply,
        timestamp: new Date().toISOString(),
      });
      setIsThinking(false);
    }, 900 + Math.min(1200, userText.length * 20));
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
    simulateAiReply(text.trim());
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
          <div className="flex items-center gap-3 mb-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Category</label>
            <select
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
              className="text-sm border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-1 rounded-md"
              aria-label="Service category"
            >
              <option value="general">General</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="hvac">HVAC</option>
              <option value="carpentry">Carpentry</option>
            </select>
            <div className="text-xs text-gray-500 dark:text-zinc-400 ml-auto">Frontend-only (dummy)</div>
          </div>

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