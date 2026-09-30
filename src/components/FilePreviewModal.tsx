import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Share2,
  Trash2,
  Star,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Code,
  Archive,
  Send,
  Loader2,
  FolderInput,
} from 'lucide-react';
import { CloudFile, CloudFolder, TelegramConfig } from '../types';
import { formatBytes, getFileCategory } from '../utils/storage';

interface FilePreviewModalProps {
  file: CloudFile | null;
  folders: CloudFolder[];
  telegramConfig: TelegramConfig;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (fileId: string) => void;
  onDeleteFile: (file: CloudFile) => void;
  onMoveFile: (fileId: string, targetFolderId: string) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  folders,
  telegramConfig,
  isOpen,
  onClose,
  onToggleFavorite,
  onDeleteFile,
  onMoveFile,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>(file?.folderId || 'root');

  useEffect(() => {
    if (!file) return;
    setSelectedFolder(file.folderId || 'root');
    setStreamUrl(null);

    // If file has a local preview URL already
    if (file.localPreviewUrl) {
      setStreamUrl(file.localPreviewUrl);
      return;
    }

    // If connected to Telegram and has telegramFileId, resolve real stream URL
    if (telegramConfig.isConnected && file.telegramFileId && file.storageProvider === 'telegram') {
      setIsLoadingStream(true);
      fetch('/api/telegram/get-file-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: telegramConfig.botToken,
          fileId: file.telegramFileId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.streamUrl) {
            setStreamUrl(data.streamUrl);
          }
        })
        .catch((err) => {
          console.warn('Could not resolve Telegram stream URL:', err);
        })
        .finally(() => {
          setIsLoadingStream(false);
        });
    }
  }, [file, telegramConfig]);

  if (!isOpen || !file) return null;

  const category = getFileCategory(file.mimeType, file.name);
  const folderName =
    folders.find((f) => f.id === file.folderId)?.name || 'Root / Home';

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownload = () => {
    if (streamUrl) {
      const a = document.createElement('a');
      a.href = streamUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create simulated blob download for demonstration
      const blob = new Blob([`Content of ${file.name} stored in Telegram cloud drive.`], {
        type: file.mimeType || 'text/plain',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3 truncate">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
              {category === 'image' && <ImageIcon className="h-5 w-5 text-emerald-500" />}
              {category === 'video' && <Video className="h-5 w-5 text-red-500" />}
              {category === 'audio' && <Music className="h-5 w-5 text-amber-500" />}
              {category === 'code' && <Code className="h-5 w-5 text-cyan-500" />}
              {category === 'archive' && <Archive className="h-5 w-5 text-indigo-500" />}
              {category === 'document' && <FileText className="h-5 w-5 text-blue-500" />}
              {category === 'other' && <FileText className="h-5 w-5 text-slate-500" />}
            </div>
            <div className="truncate">
              <h2 className="truncate text-base font-bold text-slate-900 dark:text-white">
                {file.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatBytes(file.size)} • Folder: {folderName} • Uploaded{' '}
                {new Date(file.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(file.id)}
              className={`rounded-xl p-2 transition ${
                file.isFavorite
                  ? 'bg-amber-50 text-amber-500 hover:bg-amber-100 dark:bg-amber-950/50'
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={file.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`h-4 w-4 ${file.isFavorite ? 'fill-amber-500' : ''}`} />
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-500/20 dark:text-sky-400"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid flex-1 grid-cols-1 overflow-y-auto p-6 md:grid-cols-3 md:gap-6">
          {/* Main Preview (Left 2 cols) */}
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/40 md:col-span-2">
            {isLoadingStream ? (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                <span className="text-xs">Fetching file from Telegram storage network...</span>
              </div>
            ) : category === 'image' && streamUrl ? (
              <div className="flex max-h-[420px] w-full items-center justify-center overflow-hidden rounded-xl">
                <img
                  src={streamUrl}
                  alt={file.name}
                  className="max-h-[400px] max-w-full rounded-xl object-contain shadow-md"
                />
              </div>
            ) : category === 'video' && streamUrl ? (
              <div className="w-full">
                <video
                  src={streamUrl}
                  controls
                  className="max-h-[400px] w-full rounded-xl bg-black shadow-md"
                />
              </div>
            ) : category === 'audio' && streamUrl ? (
              <div className="flex w-full flex-col items-center gap-4 py-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner">
                  <Music className="h-10 w-10" />
                </div>
                <audio src={streamUrl} controls className="w-full max-w-md" />
              </div>
            ) : (
              /* Generic or document card */
              <div className="flex flex-col items-center p-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/20">
                  {category === 'document' ? (
                    <FileText className="h-10 w-10 text-blue-500" />
                  ) : category === 'code' ? (
                    <Code className="h-10 w-10 text-cyan-500" />
                  ) : (
                    <Archive className="h-10 w-10 text-indigo-500" />
                  )}
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                  {file.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {file.mimeType} • {formatBytes(file.size)}
                </p>
                {file.caption && (
                  <p className="mt-3 max-w-md rounded-xl bg-white p-3 text-xs italic text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                    "{file.caption}"
                  </p>
                )}
                <button
                  onClick={handleDownload}
                  className="mt-5 flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700"
                >
                  <Download className="h-4 w-4" />
                  <span>Download / Open Original</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar Metadata */}
          <div className="mt-6 space-y-4 md:mt-0">
            {/* Telegram Cloud Storage Spec */}
            <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 dark:border-sky-900/50 dark:bg-sky-950/30">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-900 dark:text-sky-300">
                <Send className="h-4 w-4 text-sky-500" />
                <span>Telegram Cloud Index</span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Telegram Message ID:
                  </span>
                  <div className="flex items-center justify-between font-mono font-semibold text-slate-800 dark:text-slate-200">
                    <span>#{file.telegramMessageId || 'N/A'}</span>
                    <button
                      onClick={() =>
                        copyToClipboard(String(file.telegramMessageId || ''), 'msgId')
                      }
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {copiedField === 'msgId' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Telegram File ID:
                  </span>
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    <span className="max-w-[170px] truncate">
                      {file.telegramFileId || 'Demo file ID'}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(file.telegramFileId || '', 'fileId')
                      }
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {copiedField === 'fileId' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Storage Channel:
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {telegramConfig.chatId ? `Chat #${telegramConfig.chatId}` : 'Local Vault'}
                  </p>
                </div>
              </div>
            </div>

            {/* Folder Move */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Move to Folder:
              </label>
              <div className="mt-1.5 flex gap-2">
                <select
                  value={selectedFolder}
                  onChange={(e) => {
                    setSelectedFolder(e.target.value);
                    onMoveFile(file.id, e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="root">📁 Root / Home</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            {file.tags && file.tags.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-500">Tags:</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {file.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Delete button */}
            <button
              onClick={() => {
                onDeleteFile(file);
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete from Drive & Telegram</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
