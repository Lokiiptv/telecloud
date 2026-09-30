import React, { useState } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Key,
  MessageSquare,
  Shield,
  Loader2,
  RefreshCw,
  ExternalLink,
  Bot,
  Zap,
} from 'lucide-react';
import { TelegramConfig } from '../types';

interface TelegramSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TelegramConfig;
  onSaveConfig: (config: TelegramConfig) => void;
  onDisconnect: () => void;
}

export const TelegramSetupModal: React.FC<TelegramSetupModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onDisconnect,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'guide'>('config');
  const [botToken, setBotToken] = useState(config.botToken);
  const [chatId, setChatId] = useState(config.chatId);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDetectingChat, setIsDetectingChat] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    bot?: any;
    error?: string;
  } | null>(null);
  const [detectedChats, setDetectedChats] = useState<
    Array<{ id: number | string; title: string; type: string; username?: string }>
  >([]);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!botToken.trim()) {
      setVerificationResult({ success: false, error: 'Please enter a Bot Token first' });
      return;
    }
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await fetch('/api/telegram/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: botToken.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setVerificationResult({ success: true, bot: data.bot });
      } else {
        setVerificationResult({ success: false, error: data.error || 'Failed to verify token' });
      }
    } catch (err: any) {
      setVerificationResult({ success: false, error: err.message || 'Network error verifying bot' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDetectChats = async () => {
    if (!botToken.trim()) {
      setVerificationResult({ success: false, error: 'Please enter a Bot Token before detecting chats' });
      return;
    }
    setIsDetectingChat(true);

    try {
      const res = await fetch('/api/telegram/detect-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: botToken.trim() }),
      });
      const data = await res.json();
      if (data.success && data.chats?.length > 0) {
        setDetectedChats(data.chats);
      } else {
        setVerificationResult({
          success: false,
          error:
            'No recent messages found. Please post a message in your channel or message /start to your bot in Telegram first!',
        });
      }
    } catch (err: any) {
      setVerificationResult({ success: false, error: err.message || 'Failed to detect chats' });
    } finally {
      setIsDetectingChat(false);
    }
  };

  const handleSave = () => {
    if (!botToken.trim() || !chatId.trim()) {
      setVerificationResult({
        success: false,
        error: 'Both Bot Token and Storage Chat ID are required for cloud storage',
      });
      return;
    }

    onSaveConfig({
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      botUsername: verificationResult?.bot?.username || config.botUsername || 'CustomBot',
      botName: verificationResult?.bot?.first_name || config.botName || 'StorageBot',
      isConnected: true,
      autoSync: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/20">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Telegram Cloud Storage Setup
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Turn any Telegram Channel or Chat into unlimited personal cloud drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 px-6 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('config')}
            className={`border-b-2 py-3 text-xs font-semibold transition ${
              activeTab === 'config'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Connection Settings
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`ml-6 border-b-2 py-3 text-xs font-semibold transition ${
              activeTab === 'guide'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Step-by-Step 2-Minute Guide
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {activeTab === 'config' ? (
            <div className="space-y-4">
              {/* Bot Token Field */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-sky-500" />
                    Telegram Bot Token
                  </span>
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-sky-600 hover:underline dark:text-sky-400"
                  >
                    <span>Get from @BotFather</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    type="password"
                    placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 font-mono transition focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerifying || !botToken}
                    className="flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:opacity-50 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                  >
                    {isVerifying ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Bot className="h-3.5 w-3.5" />
                    )}
                    <span>Test Bot</span>
                  </button>
                </div>
              </div>

              {/* Chat ID Field */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-sky-500" />
                    Storage Chat ID / Channel ID
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectChats}
                    disabled={isDetectingChat || !botToken}
                    className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:underline disabled:opacity-50 dark:text-sky-400"
                  >
                    {isDetectingChat ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Zap className="h-3 w-3" />
                    )}
                    <span>Auto-Detect Chat ID</span>
                  </button>
                </label>
                <div className="mt-1.5">
                  <input
                    type="text"
                    placeholder="e.g. -1001928374652 (Channel) or 123456789 (Direct)"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 font-mono transition focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Use a private Telegram channel ID where the bot is an admin.
                  </p>
                </div>
              </div>

              {/* Detected chats list if found */}
              {detectedChats.length > 0 && (
                <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 dark:border-sky-900/50 dark:bg-sky-950/40">
                  <div className="text-xs font-bold text-sky-800 dark:text-sky-300">
                    Detected Telegram Chats:
                  </div>
                  <div className="mt-2 max-h-36 space-y-1.5 overflow-y-auto">
                    {detectedChats.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setChatId(String(c.id))}
                        className="flex w-full items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-sm transition hover:bg-sky-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <div className="truncate font-medium">
                          {c.title}{' '}
                          <span className="text-[10px] text-slate-400">({c.type})</span>
                        </div>
                        <span className="ml-2 font-mono text-[10px] text-sky-600 dark:text-sky-400">
                          {c.id}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Message */}
              {verificationResult && (
                <div
                  className={`flex items-start gap-2.5 rounded-xl p-3 text-xs ${
                    verificationResult.success
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300'
                  }`}
                >
                  {verificationResult.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                  )}
                  <div>
                    {verificationResult.success ? (
                      <div>
                        <span className="font-semibold">Bot Verified: </span>
                        {verificationResult.bot?.first_name} (@
                        {verificationResult.bot?.username})
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold">Error: </span>
                        {verificationResult.error}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Demo Mode Notice */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">Note: </span>
                Without your own bot credentials, TeleCloud operates with local browser cache and
                simulated Telegram messages so you can test all drive features, previews, and Gemini AI.
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="font-bold text-slate-900 dark:text-white">
                  Step 1: Create your Telegram Bot
                </div>
                <p className="mt-1 leading-relaxed">
                  Open Telegram, search for{' '}
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-sky-600 underline"
                  >
                    @BotFather
                  </a>
                  , and send <code className="rounded bg-slate-200 px-1 py-0.5 dark:bg-slate-700">/newbot</code>.
                  Choose a display name and username ending in "bot". BotFather will give you a token
                  like <code className="text-sky-600">123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11</code>.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="font-bold text-slate-900 dark:text-white">
                  Step 2: Create a Storage Channel
                </div>
                <p className="mt-1 leading-relaxed">
                  In Telegram, create a new <strong>Private Channel</strong> (e.g. "My Cloud Drive
                  Vault"). This channel will hold your encrypted file documents with unlimited space.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="font-bold text-slate-900 dark:text-white">
                  Step 3: Add Bot as Administrator
                </div>
                <p className="mt-1 leading-relaxed">
                  Go to Channel Settings → Administrators → <strong>Add Admin</strong> → select your
                  new bot. Grant it permission to <strong>Post Messages</strong>.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="font-bold text-slate-900 dark:text-white">
                  Step 4: Connect with One Click
                </div>
                <p className="mt-1 leading-relaxed">
                  Post any hello message into your channel, paste your token in the Connection tab,
                  and click <strong>Auto-Detect Chat ID</strong>!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            {config.isConnected && (
              <button
                type="button"
                onClick={() => {
                  onDisconnect();
                  onClose();
                }}
                className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline"
              >
                Disconnect Bot
              </button>
            )}
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-sky-500/25 transition hover:from-sky-600 hover:to-blue-700"
            >
              Save & Connect Drive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
