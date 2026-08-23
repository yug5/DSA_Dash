'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ChatMessage, sendChatMessage } from '@/lib/services/aiChatService';
import { Sparkles, Bot, Send, X, Loader2, Compass, Lightbulb, BookOpen, Settings } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  { label: '💡 What should I learn before DP?', prompt: 'What should I know before starting DP?' },
  { label: '🧭 Where do I change my goals?', prompt: 'Where do I change my goals?' },
  { label: '📚 What should I learn before Trees?', prompt: 'Should I learn recursion before trees?' },
  { label: '⚙️ How does DSA_Dash work?', prompt: 'How does DSA_Dash calculate my progress?' },
];

export default function AIAssistantWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const replyText = await sendChatMessage(query, pathname);
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Sorry, I ran into an issue retrieving the answer. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-surface-container-high border border-primary/40 text-primary hover:bg-surface-container-highest transition-all duration-200 p-3.5 rounded-full shadow-2xl flex items-center gap-2 font-mono text-xs group"
          aria-label="Open AI Assistant"
        >
          <div>
            <Bot className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-bold hidden sm:inline uppercase tracking-wider text-on-surface">
            AI Assistant
          </span>
        </button>
      )}

      {/* Expandable Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md h-[520px] max-h-[85vh] bg-surface-container-low border border-outline-variant rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 text-on-surface">
          {/* Header */}
          <div className="p-4 bg-surface-container border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-primary/10 rounded-sm text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  DSA_Dash AI Assistant
                </h3>
                <p className="font-mono text-[10px] text-on-surface-variant">
                  App Guidance & DSA Telemetry Helper
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-sm"
              aria-label="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs leading-relaxed">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="p-3 bg-surface-container border border-outline-variant/60 rounded-sm text-on-surface-variant">
                  <p className="font-bold text-on-surface mb-1">👋 Welcome to DSA_Dash Assistant!</p>
                  <p>Ask me any DSA learning path question or how to navigate features in this app.</p>
                </div>

                {/* Suggestion Prompt Chips */}
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2 font-semibold">
                    SUGGESTED PROMPTS
                  </span>
                  <div className="space-y-1.5">
                    {SUGGESTED_PROMPTS.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(item.prompt)}
                        className="w-full text-left p-2.5 bg-surface-container-high border border-outline-variant/60 rounded-sm hover:border-primary hover:bg-surface-container-highest transition-all text-on-surface text-[11px] font-medium"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] p-3 rounded-md border text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-on-primary border-primary/50'
                        : 'bg-surface-container border-outline-variant/80 text-on-surface'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <MarkdownContent content={msg.content} />
                    )}
                  </div>
                  <span className="text-[9px] text-on-surface-variant mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))
            )}

            {/* Typing / Loading Indicator */}
            {loading && (
              <div className="flex items-center space-x-2 text-on-surface-variant p-2 bg-surface-container rounded-md w-max border border-outline-variant/60">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span className="text-[11px]">Searching app knowledge...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-surface-container border-t border-outline-variant">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about DSA or app navigation..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="flex-1 px-3 py-2 border border-outline-variant bg-surface-container-low rounded-sm font-mono text-xs text-on-surface focus:border-primary outline-none disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputQuery.trim() || loading}
                className="p-2 bg-primary text-on-primary rounded-sm hover:bg-primary-container transition-colors disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatInline(text: string): React.ReactNode {
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return tokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-on-surface">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={i} className="bg-surface-container-high text-cyan-400 px-1 py-0.5 rounded text-[11px] font-mono">
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}

function MarkdownContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 leading-relaxed font-mono">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const rawInside = part.slice(3, -3).trim();
          const lines = rawInside.split('\n');
          const firstLine = lines[0] || '';
          const isLangHeader = /^[a-zA-Z0-9_-]+$/.test(firstLine.trim());
          const language = isLangHeader ? firstLine.trim() : '';
          const codeBody = isLangHeader ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div
              key={index}
              className="my-2 rounded bg-surface-container-lowest border border-outline-variant/60 overflow-hidden font-mono text-[11px]"
            >
              {language && (
                <div className="px-3 py-1 bg-surface-container-high text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold border-b border-outline-variant/40 flex justify-between items-center">
                  <span>{language}</span>
                </div>
              )}
              <pre className="p-3 text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed font-mono text-[11px]">
                {codeBody}
              </pre>
            </div>
          );
        }

        const lines = part.split('\n');
        return (
          <React.Fragment key={index}>
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lineIdx} className="h-1" />;

              if (trimmed === '---') {
                return <hr key={lineIdx} className="my-2 border-outline-variant/60" />;
              }

              if (trimmed.startsWith('###')) {
                const headerText = trimmed.replace(/^###\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
                return (
                  <h4 key={lineIdx} className="font-mono text-xs font-bold text-primary mt-2 mb-1">
                    {formatInline(headerText)}
                  </h4>
                );
              }

              if (trimmed.startsWith('####')) {
                const headerText = trimmed.replace(/^####\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
                return (
                  <h5 key={lineIdx} className="font-mono text-xs font-semibold text-on-surface mt-1.5 mb-1">
                    {formatInline(headerText)}
                  </h5>
                );
              }

              if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                const listText = trimmed.replace(/^[-•]\s*/, '');
                return (
                  <div key={lineIdx} className="flex items-start gap-1.5 ml-1 my-0.5">
                    <span className="text-cyan-400 shrink-0 select-none">•</span>
                    <span>{formatInline(listText)}</span>
                  </div>
                );
              }

              const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
              if (numMatch) {
                return (
                  <div key={lineIdx} className="flex items-start gap-1.5 ml-1 my-0.5">
                    <span className="text-primary font-bold shrink-0">{numMatch[1]}.</span>
                    <span>{formatInline(numMatch[2])}</span>
                  </div>
                );
              }

              return (
                <p key={lineIdx} className="my-0.5">
                  {formatInline(line)}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}
