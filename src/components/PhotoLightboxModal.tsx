import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Star,
  Trash2,
  Info,
  Maximize2,
  Minimize2,
  Send,
  Sparkles,
  Calendar,
  Camera,
  MapPin,
  Tag,
  Check,
  Loader2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { CloudFile, TelegramConfig } from '../types';
import { formatBytes, formatDuration } from '../utils/storage';

interface PhotoLightboxModalProps {
  currentFile: CloudFile | null;
  allPhotos: CloudFile[];
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (file: CloudFile) => void;
  onToggleFavorite: (fileId: string) => void;
  onDelete: (file: CloudFile) => void;
  telegramConfig: TelegramConfig;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  currentFile,
  allPhotos,
  isOpen,
  onClose,
  onSelectPhoto,
  onToggleFavorite,
  onDelete,
  telegramConfig,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [aiCaption, setAiCaption] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !currentFile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentFile, allPhotos]);

  if (!isOpen || !currentFile) return null;

  const currentIndex = allPhotos.findIndex((p) => p.id === currentFile.id);
  const isVideo = currentFile.mimeType.startsWith('video/');

  const handleNext = () => {
    if (currentIndex < allPhotos.length - 1) {
      onSelectPhoto(allPhotos[currentIndex + 1]);
      setIsZoomed(false);
      setAiCaption(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectPhoto(allPhotos[currentIndex - 1]);
      setIsZoomed(false);
      setAiCaption(null);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentFile.localPreviewUrl || '#';
    link.download = currentFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAskGemini = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              text: `Please analyze this photo record from Google Photos & Telegram Cloud:\nName: "${currentFile.name}"\nCaption: "${currentFile.caption || ''}"\nTags: "${currentFile.tags?.join(', ') || ''}"\nProvide 3 poetic captions, scene tags, and lighting assessment.`,
            },
          ],
          modelChoice: 'gemini-3.8-flash',
        }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        setAiCaption(data.text);
      }
    } catch (err) {
      console.warn('AI caption error:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const copyTgLink = () => {
    navigator.clipboard.writeText(
      `https://t.me/c/${telegramConfig.chatId}/${currentFile.telegramMessageId || ''}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none backdrop-blur-md">
      {/* Top action bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-4 py-3 text-white sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
            title="Back to Photos"
          >
            <X className="h-5 w-5" />
          </button>
          <div>
            <div className="text-sm font-semibold truncate max-w-xs sm:max-w-md">
              {currentFile.name}
            </div>
            <div className="text-xs text-white/60">
              {new Date(currentFile.capturedAt || currentFile.uploadedAt).toLocaleDateString(
                undefined,
                { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
              )}{' '}
              • {formatBytes(currentFile.size)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Telegram Cloud indicator */}
          <span className="hidden items-center gap-1 rounded-full bg-sky-500/20 px-2.5 py-1 text-xs font-medium text-sky-400 sm:flex">
            <Send className="h-3 w-3" />
            <span>Backed up to Telegram</span>
          </span>

          {/* Favorite */}
          <button
            onClick={() => onToggleFavorite(currentFile.id)}
            className={`rounded-full p-2 transition ${
              currentFile.isFavorite
                ? 'text-amber-400 hover:bg-white/10'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
            title={currentFile.isFavorite ? 'Favorited' : 'Add to Favorites'}
          >
            <Star className={`h-5 w-5 ${currentFile.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Zoom (images only) */}
          {!isVideo && (
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
              title={isZoomed ? 'Zoom out' : 'Zoom in'}
            >
              {isZoomed ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
          )}

          {/* Download */}
          <button
            onClick={handleDownload}
            className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
            title="Download Original"
          >
            <Download className="h-5 w-5" />
          </button>

          {/* Info toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`rounded-full p-2 transition ${
              showInfo
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
            title="Photo Information"
          >
            <Info className="h-5 w-5" />
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              onDelete(currentFile);
              onClose();
            }}
            className="rounded-full p-2 text-white/80 hover:bg-red-500/20 hover:text-red-400"
            title="Move to Trash"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="relative flex h-full w-full items-center justify-center p-4">
        {/* Prev Arrow */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/70 hover:scale-110 active:scale-95"
            title="Previous Photo (Left Arrow)"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Media (Image or Video) */}
        <div
          className={`flex h-full w-full items-center justify-center transition-transform duration-300 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-default'
          }`}
          onClick={() => !isVideo && setIsZoomed(!isZoomed)}
        >
          {isVideo ? (
            <video
              src={currentFile.localPreviewUrl || ''}
              controls
              autoPlay
              className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl"
            />
          ) : (
            <img
              src={currentFile.localPreviewUrl || ''}
              alt={currentFile.name}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl transition-all"
            />
          )}
        </div>

        {/* Next Arrow */}
        {currentIndex < allPhotos.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/70 hover:scale-110 active:scale-95"
            title="Next Photo (Right Arrow)"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Google Photos Right Info Drawer */}
      {showInfo && (
        <div className="absolute top-0 right-0 bottom-0 z-30 w-full max-w-sm overflow-y-auto border-l border-white/10 bg-black/85 p-6 text-white backdrop-blur-xl animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold tracking-wide uppercase text-white/70">
              Photo Details
            </h3>
            <button
              onClick={() => setShowInfo(false)}
              className="rounded-lg p-1 text-white/60 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 space-y-5 text-xs">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">
                  {new Date(currentFile.capturedAt || currentFile.uploadedAt).toLocaleDateString(
                    undefined,
                    { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
                  )}
                </div>
                <div className="text-white/60">
                  {new Date(currentFile.capturedAt || currentFile.uploadedAt).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Resolution and specs */}
            <div className="flex items-start gap-3">
              <Camera className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">
                  {currentFile.dimensions
                    ? `${currentFile.dimensions.width} × ${currentFile.dimensions.height} (12.2 MP)`
                    : 'High Definition Photo'}
                </div>
                <div className="text-white/60">
                  {formatBytes(currentFile.size)} • {currentFile.mimeType}
                </div>
                <div className="mt-1 text-[11px] text-white/50">
                  Device Source: {currentFile.deviceSource || 'Camera Roll (DCIM)'}
                </div>
              </div>
            </div>

            {/* Telegram Storage status */}
            <div className="rounded-2xl border border-sky-500/30 bg-sky-950/40 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                <Send className="h-3.5 w-3.5 text-sky-400" />
                <span>Telegram Cloud Backup</span>
              </div>
              <p className="text-[11px] text-sky-200/80">
                Backed up in Telegram channel #{telegramConfig.chatId || 'MyVault'}
              </p>
              <div className="flex items-center justify-between text-[11px] text-white/70">
                <span>Message ID: #{currentFile.telegramMessageId || '1048'}</span>
                <button
                  onClick={copyTgLink}
                  className="flex items-center gap-1 text-sky-400 hover:underline"
                >
                  {copiedLink ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedLink ? 'Copied' : 'Telegram Link'}</span>
                </button>
              </div>
            </div>

            {/* Caption */}
            {currentFile.caption && (
              <div>
                <span className="text-[11px] font-semibold text-white/50">Caption / Note:</span>
                <p className="mt-1 rounded-xl bg-white/5 p-2.5 italic text-white/90">
                  "{currentFile.caption}"
                </p>
              </div>
            )}

            {/* Tags */}
            {currentFile.tags && currentFile.tags.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-white/50">Smart Tags:</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {currentFile.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/80"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Gemini AI Photo Copilot feature */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-purple-950/30 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Gemini Photo AI</span>
                </div>
                <button
                  onClick={handleAskGemini}
                  disabled={isGeneratingAi}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  <span>AI Insights</span>
                </button>
              </div>

              {aiCaption ? (
                <div className="mt-2.5 whitespace-pre-wrap rounded-xl bg-black/40 p-2.5 text-[11px] leading-relaxed text-indigo-100">
                  {aiCaption}
                </div>
              ) : (
                <p className="mt-1.5 text-[11px] text-indigo-200/70">
                  Generate poetic descriptions, smart social captions, and scene tags using Gemini.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
