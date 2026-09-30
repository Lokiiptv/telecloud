import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  File,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Folder,
  Send,
  Sparkles,
} from 'lucide-react';
import { CloudFile, CloudFolder, TelegramConfig } from '../types';
import { formatBytes } from '../utils/storage';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: CloudFolder[];
  currentFolderId: string | null;
  telegramConfig: TelegramConfig;
  onFilesUploaded: (newFiles: CloudFile[]) => void;
}

interface UploadQueueItem {
  file: File;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
  result?: CloudFile;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  folders,
  currentFolderId,
  telegramConfig,
  onFilesUploaded,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    currentFolderId || 'root'
  );
  const [caption, setCaption] = useState('');
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelection = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: UploadQueueItem[] = Array.from(files).map((f) => ({
      file: f,
      status: 'idle',
      progress: 0,
    }));
    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelection(e.dataTransfer.files);
  };

  const handleRemoveQueueItem = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const startUpload = async () => {
    if (queue.length === 0) return;
    setIsUploading(true);

    const uploadedFiles: CloudFile[] = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'success') continue;

      // Update item to uploading
      setQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: 'uploading', progress: 30 } : q))
      );

      try {
        if (telegramConfig.isConnected) {
          // Real Telegram upload via backend proxy
          const formData = new FormData();
          formData.append('file', item.file);
          formData.append('token', telegramConfig.botToken);
          formData.append('chatId', telegramConfig.chatId);
          formData.append('folderId', selectedFolderId);
          if (caption) {
            formData.append('caption', caption);
          }

          const res = await fetch('/api/telegram/upload', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          if (!data.success) {
            throw new Error(data.error || 'Upload to Telegram failed');
          }

          const newFile: CloudFile = {
            id: data.file.id,
            name: data.file.name,
            size: data.file.size,
            mimeType: data.file.mimeType,
            folderId: selectedFolderId,
            uploadedAt: data.file.uploadedAt,
            telegramMessageId: data.file.telegramMessageId,
            telegramFileId: data.file.telegramFileId,
            telegramFileUniqueId: data.file.telegramFileUniqueId,
            caption: caption,
            tags: [item.file.name.split('.').pop()?.toUpperCase() || 'FILE', 'Telegram'],
            storageProvider: 'telegram',
          };

          uploadedFiles.push(newFile);
          setQueue((prev) =>
            prev.map((q, idx) =>
              idx === i ? { ...q, status: 'success', progress: 100, result: newFile } : q
            )
          );
        } else {
          // Demo / Local storage mode with object URL preview
          await new Promise((r) => setTimeout(r, 600)); // simulated latency

          let previewUrl: string | undefined = undefined;
          if (item.file.type.startsWith('image/')) {
            previewUrl = URL.createObjectURL(item.file);
          }

          const simulatedMsgId = Math.floor(1000 + Math.random() * 9000);
          const newFile: CloudFile = {
            id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: item.file.name,
            size: item.file.size,
            mimeType: item.file.type || 'application/octet-stream',
            folderId: selectedFolderId,
            uploadedAt: new Date().toISOString(),
            telegramMessageId: simulatedMsgId,
            telegramFileId: `demo_tg_${simulatedMsgId}`,
            caption: caption,
            tags: [item.file.name.split('.').pop()?.toUpperCase() || 'FILE'],
            storageProvider: 'demo',
            localPreviewUrl: previewUrl,
          };

          uploadedFiles.push(newFile);
          setQueue((prev) =>
            prev.map((q, idx) =>
              idx === i ? { ...q, status: 'success', progress: 100, result: newFile } : q
            )
          );
        }
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((q, idx) =>
            idx === i ? { ...q, status: 'error', errorMessage: err.message } : q
          )
        );
      }
    }

    setIsUploading(false);
    if (uploadedFiles.length > 0) {
      onFilesUploaded(uploadedFiles);
    }
  };

  const allFinished = queue.length > 0 && queue.every((q) => q.status === 'success');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/20">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Upload to Telegram Cloud Drive
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {telegramConfig.isConnected
                  ? `Files will be stored in Telegram channel #${telegramConfig.chatId}`
                  : 'Files will be cached locally in demo vault'}
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

        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
          {/* Target Folder Selector */}
          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Destination Folder:
            </label>
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="root">📁 Root / Home</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/40 p-6 text-center transition hover:border-sky-400 hover:bg-sky-50/70 dark:border-sky-800/80 dark:bg-sky-950/20 dark:hover:bg-sky-950/40 cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-800">
              <Upload className="h-6 w-6 text-sky-500" />
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              Drag and drop files here, or <span className="text-sky-600">browse</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Supports documents, photos, audio, videos, code archives (Up to 50MB per file)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelection(e.target.files)}
            />
          </div>

          {/* Optional Caption */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Telegram Message Caption / Note (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Q4 Financial Review, final approved draft"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 transition focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Queue List */}
          {queue.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Selected Files ({queue.length})</span>
                <button
                  type="button"
                  onClick={() => setQueue([])}
                  className="text-red-500 hover:underline"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-44 space-y-2 overflow-y-auto">
                {queue.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <File className="h-4 w-4 shrink-0 text-slate-400" />
                      <div className="truncate">
                        <p className="truncate text-xs font-medium text-slate-900 dark:text-white">
                          {item.file.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatBytes(item.file.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === 'uploading' && (
                        <span className="flex items-center gap-1 text-[11px] text-sky-600 font-medium">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Uploading...
                        </span>
                      )}
                      {item.status === 'success' && (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Stored
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span
                          className="flex items-center gap-1 text-[11px] text-red-500 font-semibold"
                          title={item.errorMessage}
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          Failed
                        </span>
                      )}
                      {item.status === 'idle' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQueueItem(idx)}
                          className="rounded p-1 text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="text-[11px] text-slate-500">
            {telegramConfig.isConnected ? (
              <span className="flex items-center gap-1 text-emerald-600">
                <Send className="h-3 w-3" />
                Posting via @{telegramConfig.botUsername}
              </span>
            ) : (
              <span>Simulated Telegram vault (Demo Mode)</span>
            )}
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {allFinished ? 'Done' : 'Cancel'}
            </button>

            {!allFinished && (
              <button
                type="button"
                onClick={startUpload}
                disabled={isUploading || queue.length === 0}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-sky-500/25 transition hover:from-sky-600 hover:to-blue-700 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading to Telegram...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    <span>Start Upload ({queue.length})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
