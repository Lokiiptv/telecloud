import React from 'react';
import { HardDrive, Send, ShieldCheck, Zap, Layers } from 'lucide-react';
import { CloudFile } from '../types';
import { formatBytes, getFileCategory } from '../utils/storage';

interface StorageStatsBarProps {
  files: CloudFile[];
  totalBytes: number;
  isConnected: boolean;
  botUsername?: string;
  onOpenSetup: () => void;
}

export const StorageStatsBar: React.FC<StorageStatsBarProps> = ({
  files,
  totalBytes,
  isConnected,
  botUsername,
  onOpenSetup,
}) => {
  // Calculate breakdown
  let docBytes = 0;
  let imgBytes = 0;
  let videoBytes = 0;
  let audioBytes = 0;
  let otherBytes = 0;

  files.forEach((f) => {
    const cat = getFileCategory(f.mimeType, f.name);
    if (cat === 'document') docBytes += f.size;
    else if (cat === 'image') imgBytes += f.size;
    else if (cat === 'video') videoBytes += f.size;
    else if (cat === 'audio') audioBytes += f.size;
    else otherBytes += f.size;
  });

  const total = Math.max(totalBytes, 1);
  const docPct = Math.round((docBytes / total) * 100);
  const imgPct = Math.round((imgBytes / total) * 100);
  const videoPct = Math.round((videoBytes / total) * 100);
  const audioPct = Math.round((audioBytes / total) * 100);
  const otherPct = Math.round((otherBytes / total) * 100);

  return (
    <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Telegram Cloud Storage
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                UNLIMITED
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatBytes(totalBytes)} stored across Telegram distributed datacenters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Encrypted Telegram Bot API</span>
          </div>
          <div className="hidden h-4 w-px bg-slate-200 dark:bg-slate-700 md:block" />
          <div className="hidden items-center gap-1.5 text-slate-500 md:flex">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>Zero file expiration</span>
          </div>
        </div>
      </div>

      {/* Progress segmented bar */}
      <div className="mt-3.5 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          style={{ width: `${docPct}%` }}
          className="bg-blue-500 transition-all duration-300"
          title={`Documents: ${formatBytes(docBytes)} (${docPct}%)`}
        />
        <div
          style={{ width: `${imgPct}%` }}
          className="bg-emerald-500 transition-all duration-300"
          title={`Images: ${formatBytes(imgBytes)} (${imgPct}%)`}
        />
        <div
          style={{ width: `${videoPct}%` }}
          className="bg-red-500 transition-all duration-300"
          title={`Videos: ${formatBytes(videoBytes)} (${videoPct}%)`}
        />
        <div
          style={{ width: `${audioPct}%` }}
          className="bg-amber-500 transition-all duration-300"
          title={`Audio: ${formatBytes(audioBytes)} (${audioPct}%)`}
        />
        <div
          style={{ width: `${otherPct}%` }}
          className="bg-indigo-500 transition-all duration-300"
          title={`Other: ${formatBytes(otherBytes)} (${otherPct}%)`}
        />
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <span>Docs ({formatBytes(docBytes)})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Images ({formatBytes(imgBytes)})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span>Videos ({formatBytes(videoBytes)})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>Audio ({formatBytes(audioBytes)})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          <span>Other ({formatBytes(otherBytes)})</span>
        </div>
      </div>
    </div>
  );
};
