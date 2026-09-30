import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  HardDrive,
  FolderTree,
  FileSearch,
  HelpCircle,
} from 'lucide-react';
import { ChatMessage, CloudFile, CloudFolder, TelegramConfig } from '../types';
import { formatBytes } from '../utils/storage';

interface GeminiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  files: CloudFile[];
  folders: CloudFolder[];
  telegramConfig: TelegramConfig;
  totalStorageBytes: number;
}

const DEFAULT_SUGGESTIONS = [
  '📊 Summarize my cloud storage and files',
  '🔍 Find my largest files and what types take up space',
  '📁 Recommend a clean folder organization structure',
  '🚀 How does Telegram unlimited cloud storage work?',
];

export const GeminiChatDrawer: React.FC<GeminiChatDrawerProps> = ({
  isOpen,
  onClose,
  files,
  folders,
  telegramConfig,
  totalStorageBytes,
}) => {
  const [modelChoice, setModelChoice] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.5-flash'>(
    'gemini-3.8-flash'
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initialize with welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome',
        role: 'model',
        text: `👋 Hello! I am **TeleCloud Copilot**, your AI drive assistant.
I have full real-time awareness of your Telegram cloud storage vault (${files.length} files, ${formatBytes(totalStorageBytes)} stored).

I can help you:
- Search and analyze stored documents and code
- Recommend folder structures and categorize files
- Explain how Telegram Bot API cloud storage works
- Draft captions and notes for Telegram uploads

What would you like to explore today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Compute live drive context to send to Gemini
    const driveContext = {
      totalFiles: files.length,
      totalSizeFormatted: formatBytes(totalStorageBytes),
      connected: telegramConfig.isConnected,
      botUsername: telegramConfig.botUsername || 'CustomBot',
      folders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        fileCount: files.filter((file) => file.folderId === f.id).length,
      })),
      breakdown: {
        documents: files.filter((f) => f.mimeType.includes('pdf') || f.mimeType.includes('document') || f.name.endsWith('.docx')).length,
        images: files.filter((f) => f.mimeType.startsWith('image/')).length,
        videos: files.filter((f) => f.mimeType.startsWith('video/')).length,
        audio: files.filter((f) => f.mimeType.startsWith('audio/')).length,
        archives: files.filter((f) => f.name.endsWith('.zip') || f.name.endsWith('.tar.gz') || f.name.endsWith('.gz')).length,
      },
      files: files.slice(0, 30).map((f) => ({
        name: f.name,
        sizeFormatted: formatBytes(f.size),
        folderName: folders.find((folder) => folder.id === f.folderId)?.name || 'Root',
        mimeType: f.mimeType,
        uploadedAt: f.uploadedAt,
      })),
    };

    try {
      // Format messages payload for server
      const serverPayload = newMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: serverPayload,
          modelChoice: modelChoice,
          driveContext: driveContext,
        }),
      });

      const data = await res.json();

      if (data.success && data.text) {
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          role: 'model',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorMsg: ChatMessage = {
          id: `ai_err_${Date.now()}`,
          role: 'model',
          text: `⚠️ **Error:** ${data.error || 'Failed to generate response. Please check your Gemini API setup.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        role: 'model',
        text: `⚠️ **Connection Error:** ${err.message || 'Unable to connect to Gemini AI server'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome_reset',
        role: 'model',
        text: `🧹 Conversation history cleared. How can I assist you with your Telegram drive?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-slate-200/80 bg-white shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900 sm:max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                TeleCloud Copilot
              </h2>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Gemini AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Multi-turn assistant with Telegram drive context
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleClearHistory}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Clear Chat History"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Model Selector Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-2 text-xs dark:border-slate-800 dark:bg-slate-950/40">
        <span className="font-medium text-slate-500 dark:text-slate-400">Model Engine:</span>
        <div className="flex rounded-lg bg-slate-200/70 p-0.5 dark:bg-slate-800">
          <button
            onClick={() => setModelChoice('gemini-3.8-flash')}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
              modelChoice === 'gemini-3.8-flash'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            gemini-3.8-flash
          </button>
          <button
            onClick={() => setModelChoice('gemini-3.1-flash-lite')}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
              modelChoice === 'gemini-3.1-flash-lite'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            flash-lite (fast)
          </button>
          <button
            onClick={() => setModelChoice('gemini-3.5-flash')}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
              modelChoice === 'gemini-3.5-flash'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            3.5-flash (pro)
          </button>
        </div>
      </div>

      {/* Scrollable Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs ${
                  isUser
                    ? 'bg-sky-500 text-white'
                    : 'bg-indigo-600 text-white shadow-sm'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Content */}
              <div
                className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-sky-500 text-white'
                    : 'border border-slate-100 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-100'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {m.text}
                </div>

                <div
                  className={`mt-1.5 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-sky-100' : 'text-slate-400'
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => copyText(m.text, m.id)}
                      className="ml-2 opacity-0 transition group-hover:opacity-100 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Copy response"
                    >
                      {copiedId === m.id ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
              <span>Analyzing files and formulating response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length <= 2 && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/20">
          <p className="mb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Suggested Prompts:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(suggestion)}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-800"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        <div className="relative flex items-end rounded-2xl border border-slate-200 bg-slate-50/80 p-2 shadow-inner focus-within:border-indigo-500 focus-within:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:focus-within:bg-slate-900">
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your files, storage, or Telegram drive..."
            className="flex-1 resize-none bg-transparent p-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white dark:placeholder-slate-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-40"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-400">
          Powered by Google GenAI SDK & {modelChoice}. Enter to send.
        </p>
      </div>
    </div>
  );
};
