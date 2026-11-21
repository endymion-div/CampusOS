import React, { useRef, useState } from 'react';
import { Loader2, MessageSquare, RotateCcw, Send, Sparkles } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import type { AiChatMessage } from '../../types/campus';

const CAPABILITY_PROMPTS = [
  'Create my study plan for my upcoming Engineering Mathematics exam',
  'Explain Jacobians and Lagrange multipliers with an intuitive example',
  'Generate 5 revision questions for Programming & Problem Solving',
  'Help me prepare for tomorrow’s deadlines and classes',
  'Prioritize my pending and overdue assignments right now',
  'Analyze my academic workload and attendance risks',
];

export const AiAssistantView: React.FC = () => {
  const { state, appendAiMessages, clearAiChat, buildAiContextPayload, pushToast } = useCampus();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsg: AiChatMessage = {
      id: `msg-u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    appendAiMessages([userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: state.aiChat.slice(-6),
          context: buildAiContextPayload(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI Assistant could not process this request.');
      }

      const assistantMsg: AiChatMessage = {
        id: `msg-a-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      appendAiMessages([assistantMsg]);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to reach AI Study Assistant.';
      setError(msg);
      pushToast({ title: 'AI Assistant Error', description: msg, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-10rem)] min-h-[540px]">
      {/* Context & Prompt Starters Sidebar */}
      <aside className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-5 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                Context-Aware Study Advisor
              </h2>
            </div>
            <button
              type="button"
              onClick={clearAiChat}
              title="Reset conversation"
              aria-label="Reset conversation"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-xs space-y-1.5">
            <p className="font-semibold text-slate-900 dark:text-slate-100">Synced Student Context</p>
            <p className="text-slate-600 dark:text-slate-300 tabular-nums">
              {state.subjects.length} active subjects · {state.exams.length} upcoming exams ·{' '}
              {state.assignments.filter((a) => a.status !== 'completed').length} pending assignments
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Quick Capabilities
            </p>
            <div className="space-y-2">
              {CAPABILITY_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-200 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Conversational Interface */}
      <section className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
              CampusOS AI Assistant
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Powered by Gemini
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {state.aiChat.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading ? (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                <span>Analyzing your subjects, deadlines, and exam schedule...</span>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about exams, deadlines, study plans, or tough concepts..."
            aria-label="Message AI Study Assistant"
            className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </section>
    </div>
  );
};
