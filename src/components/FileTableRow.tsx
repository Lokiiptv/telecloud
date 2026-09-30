import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Code,
  Archive,
  Star,
  Trash2,
  Eye,
  Send,
  Download,
} from 'lucide-react';
import { CloudFile, CloudFolder } from '../types';
import { formatBytes, getFileCategory } from '../utils/storage';

interface FileTableRowProps {
  file: CloudFile;
  folders: CloudFolder[];
  onPreview: (file: CloudFile) => void;
  onToggleFavorite: (fileId: string) => void;
  onDelete: (file: CloudFile) => void;
}

export const FileTableRow: React.FC<FileTableRowProps> = ({
  file,
  folders,
  onPreview,
  onToggleFavorite,
  onDelete,
}) => {
  const category = getFileCategory(file.mimeType, file.name);
  const folderName =
    folders.find((f) => f.id === file.folderId)?.name || 'Root / Home';

  return (
    <tr
      onClick={() => onPreview(file)}
      className="group cursor-pointer border-b border-slate-100 hover:bg-slate-50/80 dark:border-slate-800/80 dark:hover:bg-slate-800/40"
    >
      {/* Name and icon */}
      <td className="py-3 pl-4 pr-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            {category === 'image' && <ImageIcon className="h-4 w-4 text-emerald-500" />}
            {category === 'video' && <Video className="h-4 w-4 text-red-500" />}
            {category === 'audio' && <Music className="h-4 w-4 text-amber-500" />}
            {category === 'code' && <Code className="h-4 w-4 text-cyan-500" />}
            {category === 'archive' && <Archive className="h-4 w-4 text-indigo-500" />}
            {category === 'document' && <FileText className="h-4 w-4 text-blue-500" />}
            {category === 'other' && <FileText className="h-4 w-4 text-slate-400" />}
          </div>
          <div className="truncate">
            <span className="font-semibold text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">
              {file.name}
            </span>
            {file.caption && (
              <p className="truncate text-[10px] text-slate-400">{file.caption}</p>
            )}
          </div>
        </div>
      </td>

      {/* Storage provider */}
      <td className="hidden px-3 py-3 text-xs md:table-cell">
        {file.storageProvider === 'telegram' ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:bg-sky-950/60 dark:text-sky-300">
            <Send className="h-2.5 w-2.5" />
            Telegram #{file.telegramMessageId || 'Doc'}
          </span>
        ) : (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800">
            Demo Vault
          </span>
        )}
      </td>

      {/* Folder */}
      <td className="hidden px-3 py-3 text-xs text-slate-500 dark:text-slate-400 sm:table-cell">
        📁 {folderName}
      </td>

      {/* Size */}
      <td className="px-3 py-3 text-xs font-mono text-slate-500 dark:text-slate-400">
        {formatBytes(file.size)}
      </td>

      {/* Date */}
      <td className="hidden px-3 py-3 text-xs text-slate-400 lg:table-cell">
        {new Date(file.uploadedAt).toLocaleDateString()}
      </td>

      {/* Actions */}
      <td className="py-3 pl-3 pr-4 text-right text-xs">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(file.id);
            }}
            className={`rounded-lg p-1.5 transition ${
              file.isFavorite
                ? 'text-amber-500'
                : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-slate-600'
            }`}
          >
            <Star className={`h-4 w-4 ${file.isFavorite ? 'fill-amber-500' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(file);
            }}
            className="rounded-lg p-1.5 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-slate-800"
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file);
            }}
            className="rounded-lg p-1.5 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
