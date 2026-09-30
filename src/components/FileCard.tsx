import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Code,
  Archive,
  Star,
  Download,
  Trash2,
  ExternalLink,
  MoreVertical,
  Send,
  Eye,
} from 'lucide-react';
import { CloudFile } from '../types';
import { formatBytes, getFileCategory } from '../utils/storage';

interface FileCardProps {
  file: CloudFile;
  onPreview: (file: CloudFile) => void;
  onToggleFavorite: (fileId: string) => void;
  onDelete: (file: CloudFile) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onPreview,
  onToggleFavorite,
  onDelete,
}) => {
  const category = getFileCategory(file.mimeType, file.name);

  return (
    <div
      onClick={() => onPreview(file)}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-800 cursor-pointer"
    >
      {/* Top row: Category icon, Telegram cloud badge, Favorite button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
            {category === 'image' && <ImageIcon className="h-4 w-4 text-emerald-500" />}
            {category === 'video' && <Video className="h-4 w-4 text-red-500" />}
            {category === 'audio' && <Music className="h-4 w-4 text-amber-500" />}
            {category === 'code' && <Code className="h-4 w-4 text-cyan-500" />}
            {category === 'archive' && <Archive className="h-4 w-4 text-indigo-500" />}
            {category === 'document' && <FileText className="h-4 w-4 text-blue-500" />}
            {category === 'other' && <FileText className="h-4 w-4 text-slate-400" />}
          </div>
          {file.storageProvider === 'telegram' ? (
            <span className="flex items-center gap-1 rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-600 dark:bg-sky-950/60 dark:text-sky-300">
              <Send className="h-2.5 w-2.5" />
              TG #{file.telegramMessageId || 'Doc'}
            </span>
          ) : (
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              Demo Vault
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(file.id);
          }}
          className={`rounded-lg p-1.5 transition ${
            file.isFavorite
              ? 'text-amber-500 hover:bg-amber-50'
              : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800'
          }`}
          title={file.isFavorite ? 'Favorited' : 'Add to favorites'}
        >
          <Star className={`h-4 w-4 ${file.isFavorite ? 'fill-amber-500' : ''}`} />
        </button>
      </div>

      {/* Visual Preview / Thumbnail Thumbnail block */}
      <div className="my-3 flex h-24 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-950/60">
        {category === 'image' && file.localPreviewUrl ? (
          <img
            src={file.localPreviewUrl}
            alt={file.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
            {category === 'document' && <FileText className="h-8 w-8 text-blue-400/80" />}
            {category === 'video' && <Video className="h-8 w-8 text-red-400/80" />}
            {category === 'audio' && <Music className="h-8 w-8 text-amber-400/80" />}
            {category === 'code' && <Code className="h-8 w-8 text-cyan-400/80" />}
            {category === 'archive' && <Archive className="h-8 w-8 text-indigo-400/80" />}
            {category === 'image' && <ImageIcon className="h-8 w-8 text-emerald-400/80" />}
            {category === 'other' && <FileText className="h-8 w-8 text-slate-400" />}
          </div>
        )}
      </div>

      {/* Title & Metadata */}
      <div>
        <h4
          className="truncate text-xs font-bold text-slate-800 dark:text-slate-100"
          title={file.name}
        >
          {file.name}
        </h4>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>{formatBytes(file.size)}</span>
          <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Quick hover action bar */}
      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
        <span className="text-[10px] uppercase tracking-wider text-slate-400">
          {category}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(file);
            }}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-slate-800"
            title="Preview file"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file);
            }}
            className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
            title="Delete file"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
