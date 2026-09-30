import React from 'react';
import {
  Folder,
  Files,
  Star,
  Clock,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Code,
  Archive,
  FolderPlus,
  Send,
  ShieldCheck,
  HardDrive,
  ExternalLink,
  Plus,
  Camera,
} from 'lucide-react';
import { CloudFolder, TelegramConfig } from '../types';
import { FileCategory, formatBytes } from '../utils/storage';

interface SidebarProps {
  currentFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  folders: CloudFolder[];
  activeCategory: FileCategory | 'all' | 'favorites' | 'recent';
  onSelectCategory: (category: FileCategory | 'all' | 'favorites' | 'recent') => void;
  onOpenCreateFolder: () => void;
  onOpenTelegramSetup: () => void;
  telegramConfig: TelegramConfig;
  totalStorageBytes: number;
  totalFilesCount: number;
  folderFileCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  onOpenPhotos?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFolderId,
  onSelectFolder,
  folders,
  activeCategory,
  onSelectCategory,
  onOpenCreateFolder,
  onOpenTelegramSetup,
  telegramConfig,
  totalStorageBytes,
  totalFilesCount,
  folderFileCounts,
  categoryCounts,
  onOpenPhotos,
}) => {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      {/* Navigation section */}
      <div className="space-y-1">
        {onOpenPhotos && (
          <button
            onClick={onOpenPhotos}
            className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 px-3 py-2 text-sm font-bold text-sky-700 transition-colors hover:from-sky-500/20 hover:to-indigo-500/20 dark:from-sky-950/40 dark:to-indigo-950/40 dark:text-sky-300"
          >
            <div className="flex items-center gap-2.5">
              <Camera className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>Google Photos</span>
            </div>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              AUTO
            </span>
          </button>
        )}

        <button
          onClick={() => {
            onSelectFolder(null);
            onSelectCategory('all');
          }}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            currentFolderId === null && activeCategory === 'all'
              ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400'
              : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Files className="h-4 w-4" />
            <span>All Files</span>
          </div>
          <span className="text-xs font-semibold text-slate-400">{totalFilesCount}</span>
        </button>

        <button
          onClick={() => {
            onSelectFolder(null);
            onSelectCategory('favorites');
          }}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            activeCategory === 'favorites'
              ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
              : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Star className="h-4 w-4" />
            <span>Favorites</span>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {categoryCounts.favorites || 0}
          </span>
        </button>

        <button
          onClick={() => {
            onSelectFolder(null);
            onSelectCategory('recent');
          }}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            activeCategory === 'recent'
              ? 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
              : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4" />
            <span>Recent Uploads</span>
          </div>
        </button>
      </div>

      {/* Folders Section */}
      <div className="mt-6 flex-1 overflow-y-auto">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Folders
          </span>
          <button
            onClick={onOpenCreateFolder}
            className="flex h-5 w-5 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Create new folder"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-1">
          {folders.map((folder) => {
            const isSelected = currentFolderId === folder.id;
            const count = folderFileCounts[folder.id] || 0;
            return (
              <button
                key={folder.id}
                onClick={() => {
                  onSelectFolder(folder.id);
                  onSelectCategory('all');
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400'
                    : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Folder
                    className={`h-4 w-4 shrink-0 ${
                      isSelected ? 'fill-sky-500 text-sky-500' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{folder.name}</span>
                </div>
                <span className="text-xs text-slate-400">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Media Categories filter */}
        <div className="mt-6">
          <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Categories
          </div>
          <div className="space-y-1">
            <button
              onClick={() => {
                onSelectFolder(null);
                onSelectCategory('document');
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === 'document'
                  ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-blue-500" />
                <span>Documents</span>
              </div>
              <span className="text-[11px] text-slate-400">{categoryCounts.document || 0}</span>
            </button>

            <button
              onClick={() => {
                onSelectFolder(null);
                onSelectCategory('image');
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === 'image'
                  ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
                <span>Images & Photos</span>
              </div>
              <span className="text-[11px] text-slate-400">{categoryCounts.image || 0}</span>
            </button>

            <button
              onClick={() => {
                onSelectFolder(null);
                onSelectCategory('video');
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === 'video'
                  ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Video className="h-3.5 w-3.5 text-red-500" />
                <span>Videos</span>
              </div>
              <span className="text-[11px] text-slate-400">{categoryCounts.video || 0}</span>
            </button>

            <button
              onClick={() => {
                onSelectFolder(null);
                onSelectCategory('audio');
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === 'audio'
                  ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Music className="h-3.5 w-3.5 text-amber-500" />
                <span>Audio Tracks</span>
              </div>
              <span className="text-[11px] text-slate-400">{categoryCounts.audio || 0}</span>
            </button>

            <button
              onClick={() => {
                onSelectFolder(null);
                onSelectCategory('code');
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === 'code'
                  ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Code className="h-3.5 w-3.5 text-cyan-500" />
                <span>Code & Scripts</span>
              </div>
              <span className="text-[11px] text-slate-400">{categoryCounts.code || 0}</span>
            </button>

            <button
              onClick={() => {
                onSelectFolder(null);
                onSelectCategory('archive');
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === 'archive'
                  ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Archive className="h-3.5 w-3.5 text-indigo-500" />
                <span>Archives & Backups</span>
              </div>
              <span className="text-[11px] text-slate-400">{categoryCounts.archive || 0}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Telegram Storage status widget at bottom */}
      <div className="mt-4 rounded-2xl border border-sky-200/60 bg-gradient-to-b from-sky-50/80 to-white p-3.5 dark:border-sky-900/40 dark:from-sky-950/30 dark:to-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-900 dark:text-sky-300">
            <Send className="h-3.5 w-3.5 text-sky-500" />
            <span>Telegram Storage</span>
          </div>
          <span className="rounded bg-sky-200/60 px-1.5 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-900/80 dark:text-sky-300">
            FREE
          </span>
        </div>

        <div className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">
          {formatBytes(totalStorageBytes)}
          <span className="ml-1 text-xs font-normal text-slate-500">/ ∞ Unlimited</span>
        </div>

        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          {telegramConfig.isConnected
            ? `Synced to chat #${telegramConfig.chatId}`
            : 'Running in demonstration vault. Connect your bot for cloud persistence.'}
        </p>

        <button
          onClick={onOpenTelegramSetup}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-sky-600 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-98 dark:bg-sky-500 dark:hover:bg-sky-600"
        >
          <span>{telegramConfig.isConnected ? 'Manage Bot Config' : 'Setup Telegram Bot'}</span>
        </button>
      </div>
    </aside>
  );
};
