import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  RefreshCw,
  FolderSync,
  Smartphone,
  Wifi,
  HardDrive,
  Camera,
  Trash2,
  Sparkles,
  Zap,
  ShieldCheck,
  Send,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { AutoBackupConfig, CloudFile, TelegramConfig } from '../types';
import { formatBytes } from '../utils/storage';

interface AutoBackupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AutoBackupConfig;
  onSaveConfig: (newConfig: AutoBackupConfig) => void;
  telegramConfig: TelegramConfig;
  files: CloudFile[];
  onSimulateNewPhoto: () => void;
  onFreeUpSpace: () => void;
  onPickDeviceFolder: () => void;
  isSyncing?: boolean;
}

export const AutoBackupSettingsModal: React.FC<AutoBackupSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  telegramConfig,
  files,
  onSimulateNewPhoto,
  onFreeUpSpace,
  onPickDeviceFolder,
  isSyncing,
}) => {
  const [enabled, setEnabled] = useState(config.enabled);
  const [quality, setQuality] = useState<'original' | 'saver'>(config.quality);
  const [backupVideos, setBackupVideos] = useState(config.backupVideos);
  const [backupOnWifiOnly, setBackupOnWifiOnly] = useState(config.backupOnWifiOnly);
  const [autoTagWithAi, setAutoTagWithAi] = useState(config.autoTagWithAi);
  const [monitoredSources, setMonitoredSources] = useState(config.monitoredSources);
  const [freedUpSuccess, setFreedUpSuccess] = useState(false);

  if (!isOpen) return null;

  const totalPhotoBytes = files
    .filter((f) => f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/'))
    .reduce((sum, f) => sum + f.size, 0);

  const totalPhotoCount = files.filter(
    (f) => f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/')
  ).length;

  const toggleSource = (source: 'Camera' | 'Screenshots' | 'WhatsApp' | 'Downloads') => {
    if (monitoredSources.includes(source)) {
      setMonitoredSources(monitoredSources.filter((s) => s !== source));
    } else {
      setMonitoredSources([...monitoredSources, source]);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      ...config,
      enabled,
      quality,
      backupVideos,
      backupOnWifiOnly,
      autoTagWithAi,
      monitoredSources,
      lastSyncTime: 'Just now',
    });
    onClose();
  };

  const handleFreeUp = () => {
    onFreeUpSpace();
    setFreedUpSuccess(true);
    setTimeout(() => setFreedUpSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 via-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25">
              <FolderSync className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Photos & Videos Auto-Backup
                </h2>
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  Google Photos Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Continuous background backup of your camera roll directly into Telegram Cloud
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Main Master Toggle Banner */}
          <div className="flex items-center justify-between rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50/70 to-indigo-50/60 p-4 dark:border-sky-900/40 dark:from-sky-950/30 dark:to-indigo-950/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm dark:bg-slate-800 dark:text-sky-400">
                <Cloud className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Backup & Sync
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {enabled
                    ? telegramConfig.isConnected
                      ? `Uploading photos automatically to @${telegramConfig.botUsername}`
                      : 'Active (Saving into Local Vault until Telegram Bot connected)'
                    : 'Auto-backup is currently paused'}
                </div>
              </div>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-slate-300 peer-checked:bg-sky-600 peer-focus:outline-none dark:bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
            </label>
          </div>

          {/* Backup Quality Options */}
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Backup Quality (Google Photos standard):
            </label>
            <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div
                onClick={() => setQuality('original')}
                className={`cursor-pointer rounded-2xl border p-3.5 transition ${
                  quality === 'original'
                    ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20 dark:border-sky-500 dark:bg-sky-950/40'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Original Quality
                  </span>
                  {quality === 'original' && (
                    <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Full resolution images, raw camera colors, preserved EXIF & GPS location.
                </p>
                <span className="mt-2 inline-block rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-800 dark:bg-sky-900/60 dark:text-sky-200">
                  RECOMMENDED (Unlimited in Telegram)
                </span>
              </div>

              <div
                onClick={() => setQuality('saver')}
                className={`cursor-pointer rounded-2xl border p-3.5 transition ${
                  quality === 'saver'
                    ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20 dark:border-sky-500 dark:bg-sky-950/40'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Storage Saver
                  </span>
                  {quality === 'saver' && (
                    <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Slightly compressed (16MP max, 1080p videos) for faster transmission on mobile data.
                </p>
              </div>
            </div>
          </div>

          {/* Monitored Folders / Sources */}
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Device Folders to Auto-Backup:
            </label>
            <p className="text-[11px] text-slate-400">
              Select which device albums should automatically sync to your Telegram vault
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(['Camera', 'Screenshots', 'WhatsApp', 'Downloads'] as const).map((source) => {
                const isSelected = monitoredSources.includes(source);
                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() => toggleSource(source)}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-semibold transition ${
                      isSelected
                        ? 'border-sky-400 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <span>{source}</span>
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 text-sky-600" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border border-slate-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Directory Picker / Watch Local Folder */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Device Folder Live Watcher
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pick your phone or computer's Pictures/DCIM folder to automatically watch and upload
                </p>
              </div>
              <button
                type="button"
                onClick={onPickDeviceFolder}
                className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <FolderSync className="h-3.5 w-3.5 text-sky-500" />
                <span>Select Folder</span>
              </button>
            </div>
          </div>

          {/* Rules & Network */}
          <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/30 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Back up over Wi-Fi only
                </span>
              </div>
              <input
                type="checkbox"
                checked={backupOnWifiOnly}
                onChange={(e) => setBackupOnWifiOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/60 pt-3 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Back up videos (larger files)
                </span>
              </div>
              <input
                type="checkbox"
                checked={backupVideos}
                onChange={(e) => setBackupVideos(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/60 pt-3 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Auto-tag photos with Gemini AI (Places, Objects, Faces)
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoTagWithAi}
                onChange={(e) => setAutoTagWithAi(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Live Simulation / Trigger Camera Backup */}
          <div className="flex flex-col gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                <Camera className="h-4 w-4 text-indigo-500" />
                <span>Test Camera Auto-Backup Now</span>
              </div>
              <button
                type="button"
                onClick={onSimulateNewPhoto}
                disabled={isSyncing}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSyncing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="h-3.5 w-3.5" />
                )}
                <span>Simulate Camera Photo</span>
              </button>
            </div>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
              Simulates a new photo taken on your phone. TeleCloud will detect it and back it up
              into Telegram cloud storage instantly.
            </p>
          </div>

          {/* Free up space feature (Google Photos signature tool) */}
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <div>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                Free Up Device Space ({formatBytes(totalPhotoBytes)})
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                {totalPhotoCount} photos & videos are safely backed up in Telegram.
              </p>
              {freedUpSuccess && (
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Space cleaned up successfully!
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleFreeUp}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300"
            >
              <Trash2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Free Up</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <span className="text-[11px] text-slate-400">
            Continuous sync status: {enabled ? 'Active' : 'Disabled'}
          </span>
          <div className="flex gap-2">
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
              Save Auto-Backup Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
