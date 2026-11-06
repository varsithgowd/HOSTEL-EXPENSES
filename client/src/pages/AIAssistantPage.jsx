import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  PiggyBank,
  Coffee,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

const QUICK_PROMPTS = [
  'Why am I spending so much money this month?',
  'How can I cut down my canteen, mess & snack bills?',
  'Can I afford a weekend trip home with my remaining balance?',
  'Compare my current month spending with last month.',
  'Give me 3 realistic savings tips for a hostel student.',
];

export const AIAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "👋 Hey there! I'm your Hostel Financial Assistant. I analyze your actual logged expenses and budget to help you stretch your pocket money. How can I help you today?",
      source: 'heuristic',
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: query.trim(),
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: query.trim() });
      if (res.data.success) {
        const botReply = {
          sender: 'assistant',
          text: res.data.data.reply,
          source: res.data.data.source,
          time: new Date(),
        };
        setMessages((prev) => [...prev, botReply]);
        if (res.data.data.metrics) {
          setMetrics(res.data.data.metrics);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: "I'm having trouble analyzing your expenses right now. Please ensure your backend is reachable and try again.",
          source: 'error',
          time: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purpleDark to-brand-purple flex items-center justify-center shadow-soft-purple text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
              AI Spending Assistant
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Personalized hostel budgeting advisor powered by your actual expense data
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/15 border border-brand-purple/30 text-brand-purpleLight text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Financial Intelligence</span>
        </div>
      </div>

      {/* Main Grid: Chat Area (left) + Context Metrics Sidebar (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area (3 cols on lg) */}
        <div className="lg:col-span-3 glass-card flex flex-col h-[520px] sm:h-[650px] overflow-hidden">
          {/* Quick Prompt Chips Bar */}
          <div className="p-3 border-b border-border-subtle bg-bg-cardHover/40 overflow-x-auto flex items-center gap-2">
            <span className="text-[11px] font-semibold text-text-muted shrink-0 pl-1">
              Suggestions:
            </span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="shrink-0 px-3 py-1 rounded-full bg-bg-input hover:bg-bg-card border border-border-subtle hover:border-brand-purple/40 text-[11px] text-text-secondary hover:text-text-main transition text-left"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isUser
                        ? 'bg-brand-purple text-white'
                        : 'bg-brand-purple/20 text-brand-purpleLight border border-brand-purple/40'
                    }`}
                  >
                    {isUser ? 'You' : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-brand-purple text-white shadow-soft-purple rounded-tr-none'
                        : 'bg-bg-input border border-border-subtle text-text-main rounded-tl-none whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}

                    <div
                      className={`mt-2 flex items-center gap-2 text-[10px] ${
                        isUser ? 'text-white/70 justify-end' : 'text-text-muted'
                      }`}
                    >
                      <span>
                        {new Date(msg.time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {!isUser && msg.source === 'gemini' && (
                        <span className="inline-flex items-center gap-0.5 text-brand-purpleLight font-semibold">
                          <Cpu className="w-2.5 h-2.5" /> Gemini AI
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-purple/20 text-brand-purpleLight border border-brand-purple/40 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-bg-input border border-border-subtle rounded-2xl rounded-tl-none p-4 text-xs text-text-secondary flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-purple" />
                  <span>Analyzing your hostel finances...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-border-subtle bg-bg-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask financial advice (e.g., 'How can I save ₹2,000 this month?')..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-4 py-2.5 text-xs text-text-main placeholder-text-muted focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-brand-purple hover:bg-brand-purpleDark disabled:opacity-40 text-white shadow-soft-purple transition active:scale-95 cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Live Metrics Context Sidebar (1 col) */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-xs font-bold text-text-main uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-purpleLight" />
              Active Spending Context
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-bg-input border border-border-subtle">
                <span className="text-[11px] text-text-muted">Monthly Limit</span>
                <p className="text-sm font-bold text-text-main mt-0.5">
                  {formatCurrency(metrics?.monthlyLimit || 8000)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-bg-input border border-border-subtle">
                <span className="text-[11px] text-text-muted">Current Spent</span>
                <p className="text-sm font-bold text-brand-purpleLight mt-0.5">
                  {formatCurrency(metrics?.currentTotalSpent || 0)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-bg-input border border-border-subtle">
                <span className="text-[11px] text-text-muted">Remaining Balance</span>
                <p className="text-sm font-bold text-status-success mt-0.5">
                  {formatCurrency(metrics?.remainingBudget || 0)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-bg-input border border-border-subtle">
                <span className="text-[11px] text-text-muted">Highest Category</span>
                <p className="text-sm font-bold text-text-main mt-0.5">
                  {metrics?.topCategory
                    ? `${metrics.topCategory.category} (${metrics.topCategory.percentage}%)`
                    : 'Food & Canteen'}
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Advice Disclaimer */}
          <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle text-[11px] text-text-muted space-y-1.5 leading-relaxed">
            <p className="font-semibold text-text-secondary flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-brand-purple" />
              Hostel Finance Advice Disclaimer
            </p>
            <p>
              Suggestions are generated based solely on the expenses you manually log. No real bank accounts are accessed. Always prioritize health, academic supplies, and safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;

