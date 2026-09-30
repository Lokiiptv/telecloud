import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Send,
  Sparkles,
  Layers,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCommand = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Android App Installation
                </h2>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  ANDROID READY
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Install as a native standalone Android App on your phone or build an APK
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 px-6 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`border-b-2 py-3 text-xs font-bold transition ${
              activeTab === 'pwa'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Direct 1-Tap Android Install (PWA)
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`ml-6 border-b-2 py-3 text-xs font-bold transition ${
              activeTab === 'apk'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            APK / Play Store Package (TWA)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'pwa' ? (
            <div className="space-y-4">
              {/* App banner with mockup */}
              <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/70 to-teal-50/60 p-4 dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-teal-950/20">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 shrink-0">
                  <Send className="h-7 w-7 fill-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    TeleCloud for Android
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Runs full-screen with native notification support, offline caching, and automatic
                    camera roll sync to Telegram!
                  </p>
                </div>
              </div>

              {/* Install trigger button */}
              {isInstalled ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>TeleCloud is already installed on your device as an Android App!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      const res = await install();
                      if (res) onClose();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-700 hover:to-teal-700 active:scale-98"
                  >
                    <Download className="h-4 w-4" />
                    <span>Install App on Android Phone</span>
                  </button>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      How to install on your Android device:
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed">
                      <li>
                        Open this app URL in <strong>Google Chrome</strong> on your Android phone.
                      </li>
                      <li>
                        Click the <strong>Install App</strong> button above, or tap the three dots
                        (⋮) in Chrome menu.
                      </li>
                      <li>
                        Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                      </li>
                      <li>
                        TeleCloud will appear as an app in your Android App Drawer alongside
                        Telegram and WhatsApp!
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Feature pills */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Zero URL bar (Standalone)
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Offline Cache Ready
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Option 1: Generate Android APK with PWABuilder (Easiest, No Code)
                </h4>
                <p className="text-[11px] leading-relaxed">
                  Microsoft's official <strong>PWABuilder</strong> packages this web app into a signed
                  Android `.apk` or `.aab` file ready for installation or Google Play Store:
                </p>
                <div className="pt-1">
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                  >
                    <span>Open PWABuilder.com</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <span className="ml-2 text-[10px] text-slate-400">
                    Paste your app URL → Click "Build My APK"
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Option 2: Google's Official Bubblewrap (TWA APK)
                </h4>
                <p className="text-[11px] leading-relaxed">
                  Run Google's official Bubblewrap CLI to generate an Android Studio project or APK:
                </p>
                <div className="relative rounded-xl bg-slate-900 p-2.5 font-mono text-[11px] text-emerald-400">
                  <code>npm i -g @bubblewrap/cli && bubblewrap init --manifest=manifest.webmanifest</code>
                  <button
                    onClick={() =>
                      copyCommand(
                        'npm i -g @bubblewrap/cli && bubblewrap init --manifest=manifest.webmanifest',
                        'bubble'
                      )
                    }
                    className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'bubble' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Option 3: Capacitor (Full Native Android Studio Project)
                </h4>
                <p className="text-[11px] leading-relaxed">
                  Wrap with Capacitor for direct native Android camera & file APIs:
                </p>
                <div className="relative rounded-xl bg-slate-900 p-2.5 font-mono text-[11px] text-emerald-400">
                  <code>npm i @capacitor/core @capacitor/cli && npx cap add android</code>
                  <button
                    onClick={() =>
                      copyCommand(
                        'npm i @capacitor/core @capacitor/cli && npx cap add android',
                        'cap'
                      )
                    }
                    className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'cap' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <span className="text-[11px] text-slate-400">
            Package identifier: <code className="text-slate-600 dark:text-slate-300">com.telecloud.drive</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
