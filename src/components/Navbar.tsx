import React from 'react';
import {
  Cloud,
  Send,
  Sparkles,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  RefreshCw,
  FolderSync,
  Camera,
  Image as ImageIcon,
  Folder,
  Smartphone,
  Download,
} from 'lucide-react';
import { AutoBackupConfig, TelegramConfig } from '../types';
import { formatBytes } from '../utils/storage';

interface NavbarProps {
  telegramConfig: TelegramConfig;
  autoBackupConfig: AutoBackupConfig;
  totalStorageBytes: number;
  totalFilesCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  appView: 'drive' | 'photos';
  onSetAppView: (view: 'drive' | 'photos') => void;
  onOpenUpload: () => void;
  onOpenTelegramSetup: () => void;
  onOpenAutoBackupSettings: () => void;
  onOpenAndroidInstall: () => void;
  onOpenCreateFolder: () => void;
  onToggleAiChat: () => void;
  isAiChatOpen: boolean;
  onRefreshDrive: () => void;
  isRefreshing?: boolean;
  isSyncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  telegramConfig,
  autoBackupConfig,
  totalStorageBytes,
  totalFilesCount,
  searchQuery,
  setSearchQuery,
  appView,
  onSetAppView,
  onOpenUpload,
  onOpenTelegramSetup,
  onOpenAutoBackupSettings,
  onOpenAndroidInstall,
  onOpenCreateFolder,
  onToggleAiChat,
  isAiChatOpen,
  onRefreshDrive,
  isRefreshing,
  isSyncing,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
      {/* Brand & Telegram indicator */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20">
          <Send className="h-5 w-5 -translate-x-0.5 translate-y-0.5 fill-white text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-slate-900 dark:text-white">
              Tele<span className="text-sky-500">Cloud</span>
            </span>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-sky-700 dark:bg-sky-950/80 dark:text-sky-300">
              TELEGRAM STORAGE
            </span>
          </div>
          <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
            Unlimited Cloud Drive & Photos
          </p>
        </div>

        {/* View Switcher: Drive vs Photos (Google Photos style) */}
        <div className="ml-2 hidden items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800 sm:flex">
          <button
            onClick={() => onSetAppView('drive')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              appView === 'drive'
                ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Folder className="h-3.5 w-3.5" />
            <span>Drive</span>
          </button>
          <button
            onClick={() => onSetAppView('photos')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              appView === 'photos'
                ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Google Photos</span>
            <span className="rounded-full bg-emerald-500/20 px-1 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
              AUTO
            </span>
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="mx-4 hidden max-w-sm flex-1 md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              appView === 'photos'
                ? 'Search photos (e.g. sunsets, nature, food)...'
                : 'Search documents, files or tags...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 transition-all focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Auto Backup Status Button */}
        <button
          onClick={onOpenAutoBackupSettings}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
            isSyncing
              ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-950/60 dark:text-blue-300'
              : autoBackupConfig.enabled
              ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-300'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
          }`}
          title="Google Photos Auto-Backup Settings"
        >
          {isSyncing ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
          ) : autoBackupConfig.enabled ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          ) : (
            <FolderSync className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span className="hidden md:inline">Auto-Backup</span>
        </button>

        {/* Android App Install Button */}
        <button
          onClick={onOpenAndroidInstall}
          className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 transition-all hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
          title="Install as Android App / Download APK"
        >
          <Smartphone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Android App</span>
        </button>

        {/* Download Source Code Zip */}
        <a
          href="/api/download-zip"
          download="telecloud-source-code.zip"
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          title="Download complete project source code (.zip)"
        >
          <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden md:inline">Codes (.zip)</span>
        </a>

        {/* Telegram Bot status pill */}
        <button
          onClick={onOpenTelegramSetup}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
            telegramConfig.isConnected
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800'
              : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800'
          }`}
          title="Telegram Storage Connection"
        >
          {telegramConfig.isConnected ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden lg:inline">Bot:</span>
              <span className="max-w-[75px] truncate font-semibold">
                @{telegramConfig.botUsername || 'Active'}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Connect TG</span>
            </>
          )}
        </button>

        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="flex h-8 items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3 text-xs font-semibold text-white shadow-sm shadow-sky-500/25 transition-all hover:from-sky-600 hover:to-blue-700 active:scale-95"
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        {/* Gemini AI Copilot button */}
        <button
          onClick={onToggleAiChat}
          className={`flex h-8 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold transition-all ${
            isAiChatOpen
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/70 dark:text-indigo-300'
              : 'border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900/60 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-indigo-950/50'
          }`}
          title="Open Gemini AI Drive & Photos Assistant"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>
      </div>
    </header>
  );
};
