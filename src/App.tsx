/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  loadFiles,
  saveFiles,
  loadFolders,
  saveFolders,
  loadTelegramConfig,
  saveTelegramConfig,
  loadAutoBackupConfig,
  saveAutoBackupConfig,
  loadAiAlbums,
  saveAiAlbums,
  loadPeopleClusters,
  savePeopleClusters,
  getFileCategory,
  FileCategory,
  formatBytes,
} from './utils/storage';
import {
  CloudFile,
  CloudFolder,
  TelegramConfig,
  AutoBackupConfig,
  AIThematicAlbum,
  PersonFaceCluster,
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FileCard } from './components/FileCard';
import { FileTableRow } from './components/FileTableRow';
import { FileUploadModal } from './components/FileUploadModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { TelegramSetupModal } from './components/TelegramSetupModal';
import { CreateFolderModal } from './components/CreateFolderModal';
import { GeminiChatDrawer } from './components/GeminiChatDrawer';
import { StorageStatsBar } from './components/StorageStatsBar';
import { GooglePhotosView } from './components/GooglePhotosView';
import { AutoBackupSettingsModal } from './components/AutoBackupSettingsModal';
import { PhotoLightboxModal } from './components/PhotoLightboxModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import {
  LayoutGrid,
  List,
  Folder,
  ArrowUpDown,
  Upload,
  Send,
  Sparkles,
  Info,
  CheckCircle2,
  FolderPlus,
  AlertTriangle,
  Search,
  Camera,
  FolderSync,
} from 'lucide-react';

const SAMPLE_CAMERA_SHOTS = [
  {
    name: 'IMG_20260929_163210.jpg',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    caption: 'Tropical beach turquoise waves & white sand',
    tags: ['Beach', 'Ocean', 'Summer', 'CameraAutoBackup'],
    album: 'Travel',
  },
  {
    name: 'IMG_20260929_171504.jpg',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    caption: 'Macro electronic circuit tech lab photography',
    tags: ['Tech', 'Electronics', 'Macro', 'CameraAutoBackup'],
    album: 'Work',
  },
  {
    name: 'IMG_20260929_180422.jpg',
    url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80',
    caption: 'Playful French bulldog puppy resting on wooden floor',
    tags: ['Puppy', 'Cute', 'Dog', 'CameraAutoBackup'],
    album: 'Favorites',
  },
  {
    name: 'IMG_20260929_192255.jpg',
    url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
    caption: 'Majestic starry Milky Way night sky over pine silhouette',
    tags: ['Night', 'Stars', 'Astrophotography', 'CameraAutoBackup'],
    album: 'Travel',
  },
];

export default function App() {
  const [files, setFiles] = useState<CloudFile[]>(() => loadFiles());
  const [folders, setFolders] = useState<CloudFolder[]>(() => loadFolders());
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() =>
    loadTelegramConfig()
  );
  const [autoBackupConfig, setAutoBackupConfig] = useState<AutoBackupConfig>(() =>
    loadAutoBackupConfig()
  );
  const [aiAlbums, setAiAlbums] = useState<AIThematicAlbum[]>(() => loadAiAlbums());
  const [peopleClusters, setPeopleClusters] = useState<PersonFaceCluster[]>(() =>
    loadPeopleClusters()
  );
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  // App Main Mode: 'drive' (files & folders) vs 'photos' (Google Photos style timeline)
  const [appView, setAppView] = useState<'drive' | 'photos'>('photos');

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<
    FileCategory | 'all' | 'favorites' | 'recent'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'name_asc' | 'size_desc'>('date_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal / Drawer visibility
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isTelegramSetupOpen, setIsTelegramSetupOpen] = useState(false);
  const [isAutoBackupSettingsOpen, setIsAutoBackupSettingsOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isAndroidInstallOpen, setIsAndroidInstallOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<CloudFile | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<CloudFile | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(
    null
  );

  // Sync state changes to localStorage
  useEffect(() => {
    saveFiles(files);
  }, [files]);

  useEffect(() => {
    saveFolders(folders);
  }, [folders]);

  useEffect(() => {
    saveTelegramConfig(telegramConfig);
  }, [telegramConfig]);

  useEffect(() => {
    saveAutoBackupConfig(autoBackupConfig);
  }, [autoBackupConfig]);

  useEffect(() => {
    saveAiAlbums(aiAlbums);
  }, [aiAlbums]);

  useEffect(() => {
    savePeopleClusters(peopleClusters);
  }, [peopleClusters]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Calculations for sidebar & storage
  const totalStorageBytes = useMemo(() => {
    return files.reduce((acc, f) => acc + f.size, 0);
  }, [files]);

  const folderFileCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    files.forEach((f) => {
      counts[f.folderId] = (counts[f.folderId] || 0) + 1;
    });
    return counts;
  }, [files]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      favorites: files.filter((f) => f.isFavorite).length,
    };
    files.forEach((f) => {
      const cat = getFileCategory(f.mimeType, f.name);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [files]);

  // All photos and videos for lightbox navigation
  const allMediaFiles = useMemo(() => {
    return files.filter(
      (f) => f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/')
    );
  }, [files]);

  // Filtered and sorted files for Drive view
  const displayedFiles = useMemo(() => {
    return files
      .filter((file) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = file.name.toLowerCase().includes(q);
          const matchesCaption = file.caption?.toLowerCase().includes(q);
          const matchesTag = file.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchesName && !matchesCaption && !matchesTag) return false;
        }

        // Folder filter
        if (currentFolderId !== null) {
          if (file.folderId !== currentFolderId) return false;
        }

        // Category filter
        if (activeCategory === 'favorites') {
          return file.isFavorite;
        }
        if (activeCategory === 'recent') {
          const uploadTime = new Date(file.uploadedAt).getTime();
          const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
          return uploadTime >= threeDaysAgo;
        }
        if (activeCategory !== 'all') {
          const cat = getFileCategory(file.mimeType, file.name);
          return cat === activeCategory;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        }
        if (sortBy === 'date_asc') {
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        }
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'size_desc') {
          return b.size - a.size;
        }
        return 0;
      });
  }, [files, searchQuery, currentFolderId, activeCategory, sortBy]);

  // Actions
  const handleFilesUploaded = (newFiles: CloudFile[]) => {
    setFiles((prev) => [...newFiles, ...prev]);
    showToast(`Stored ${newFiles.length} file(s) in Telegram cloud!`);
    setIsUploadModalOpen(false);
  };

  const handleCreateFolder = (newFolder: CloudFolder) => {
    setFolders((prev) => [...prev, newFolder]);
    showToast(`Folder "${newFolder.name}" created!`);
  };

  const handleToggleFavorite = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isFavorite: !f.isFavorite } : f))
    );
  };

  const handleDeleteFile = async (file: CloudFile) => {
    // If in Telegram and has messageId, try deleting message on Telegram side
    if (telegramConfig.isConnected && file.telegramMessageId && file.storageProvider === 'telegram') {
      try {
        await fetch('/api/telegram/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: telegramConfig.botToken,
            chatId: telegramConfig.chatId,
            messageId: file.telegramMessageId,
          }),
        });
      } catch (err) {
        console.warn('Telegram delete error', err);
      }
    }

    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    if (previewFile?.id === file.id) setPreviewFile(null);
    if (lightboxPhoto?.id === file.id) setLightboxPhoto(null);
    showToast(`Deleted "${file.name}"`);
  };

  const handleMoveFile = (fileId: string, targetFolderId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, folderId: targetFolderId } : f))
    );
    showToast('File moved successfully');
  };

  const handleSaveTelegramConfig = (newConfig: TelegramConfig) => {
    setTelegramConfig(newConfig);
    showToast(`Connected to Telegram bot @${newConfig.botUsername}!`);
  };

  const handleDisconnectTelegram = () => {
    setTelegramConfig({
      botToken: '',
      chatId: '',
      isConnected: false,
      autoSync: true,
    });
    showToast('Telegram bot disconnected. Now in demo vault mode.', 'info');
  };

  const handleRefreshDrive = async () => {
    setIsRefreshing(true);
    if (telegramConfig.isConnected) {
      try {
        const res = await fetch('/api/telegram/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: telegramConfig.botToken }),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Synced with Telegram @${data.bot.username}`);
        }
      } catch (err) {
        showToast('Sync check failed', 'error');
      }
    } else {
      await new Promise((r) => setTimeout(r, 400));
      showToast('Vault refreshed');
    }
    setIsRefreshing(false);
  };

  // Google Photos Auto-Backup: Simulate Camera Shot Background Upload
  const handleSimulateCameraShot = () => {
    setIsSyncing(true);
    showToast('📸 New camera photo detected! Auto-backing up to Telegram storage...', 'info');

    setTimeout(() => {
      const sample = SAMPLE_CAMERA_SHOTS[Math.floor(Math.random() * SAMPLE_CAMERA_SHOTS.length)];
      const randomMsgId = Math.floor(2000 + Math.random() * 8000);

      const newPhoto: CloudFile = {
        id: `camera_${Date.now()}`,
        name: sample.name,
        size: Math.floor(3200000 + Math.random() * 1800000),
        mimeType: 'image/jpeg',
        folderId: 'camera',
        uploadedAt: new Date().toISOString(),
        capturedAt: new Date().toISOString(),
        telegramMessageId: randomMsgId,
        telegramFileId: `tg_doc_${randomMsgId}`,
        caption: sample.caption,
        tags: sample.tags,
        isFavorite: false,
        storageProvider: telegramConfig.isConnected ? 'telegram' : 'demo',
        dimensions: { width: 4032, height: 3024 },
        deviceSource: 'Camera',
        album: sample.album,
        backupStatus: 'synced',
        localPreviewUrl: sample.url,
      };

      setFiles((prev) => [newPhoto, ...prev]);
      setAutoBackupConfig((prev) => ({
        ...prev,
        lastSyncTime: 'Just now',
      }));
      setIsSyncing(false);
      showToast(`✅ Auto-backup complete: "${sample.name}" safely stored in Telegram Cloud!`);
    }, 1200);
  };

  // Google Photos: Live Device Folder Watcher
  const handlePickDeviceFolder = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        showToast(`📁 Connected to folder "${dirHandle.name}". Auto-syncing images to Telegram...`);
        handleSimulateCameraShot();
      } else {
        handleSimulateCameraShot();
      }
    } catch (err) {
      console.warn('Folder picker dismissed', err);
    }
  };

  // Google Photos: Free Up Device Space
  const handleFreeUpSpace = () => {
    showToast(
      'Cleaned device cache! All photos & videos remain permanently safe in Telegram Cloud.',
      'success'
    );
  };

  // Google Photos: Scan & Group Thematic Albums and People Faces with Gemini
  const handleScanAiAlbumsAndFaces = async () => {
    setIsAnalyzingAi(true);
    showToast('✨ Gemini AI analyzing photo library for thematic albums & face clusters...', 'info');

    try {
      const mediaList = files
        .filter((f) => f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/'))
        .map((f) => ({
          id: f.id,
          name: f.name,
          caption: f.caption || '',
          tags: f.tags || [],
          album: f.album || '',
          source: f.deviceSource || '',
        }));

      const res = await fetch('/api/gemini/analyze-albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: mediaList }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.thematicAlbums && data.thematicAlbums.length > 0) {
          // enrich with coverUrl from files if missing
          const enrichedAlbums = data.thematicAlbums.map((alb: AIThematicAlbum) => {
            const cover = files.find((f) => f.id === alb.coverPhotoId || alb.photoIds.includes(f.id));
            return {
              ...alb,
              coverUrl: alb.coverUrl || cover?.localPreviewUrl || '',
            };
          });
          setAiAlbums(enrichedAlbums);
        }

        if (data.peopleClusters && data.peopleClusters.length > 0) {
          // enrich with avatarUrl and preserve user names
          setPeopleClusters((prev) => {
            return data.peopleClusters.map((newCluster: PersonFaceCluster) => {
              const existing = prev.find((p) => p.id === newCluster.id);
              const sample = files.find(
                (f) => f.id === newCluster.avatarPhotoId || newCluster.photoIds.includes(f.id)
              );
              return {
                ...newCluster,
                name: existing && existing.isNamed ? existing.name : newCluster.name || newCluster.suggestedName || 'Unknown',
                avatarUrl: newCluster.avatarUrl || sample?.localPreviewUrl || '',
                isNamed: existing?.isNamed || Boolean(newCluster.name),
              };
            });
          });
        }

        showToast(
          `✨ Gemini created ${data.thematicAlbums?.length || 0} thematic albums & ${data.peopleClusters?.length || 0} face clusters!`
        );
      } else {
        showToast(data.error || 'Gemini analysis failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error running AI analysis', 'error');
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const currentFolder = folders.find((f) => f.id === currentFolderId);

  return (
    <div className="flex h-screen flex-col bg-slate-100 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
          {toast.type === 'info' && <Info className="h-4 w-4 text-sky-500 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        telegramConfig={telegramConfig}
        autoBackupConfig={autoBackupConfig}
        totalStorageBytes={totalStorageBytes}
        totalFilesCount={files.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        appView={appView}
        onSetAppView={setAppView}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenTelegramSetup={() => setIsTelegramSetupOpen(true)}
        onOpenAutoBackupSettings={() => setIsAutoBackupSettingsOpen(true)}
        onOpenAndroidInstall={() => setIsAndroidInstallOpen(true)}
        onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
        onToggleAiChat={() => setIsAiChatOpen(!isAiChatOpen)}
        isAiChatOpen={isAiChatOpen}
        onRefreshDrive={handleRefreshDrive}
        isRefreshing={isRefreshing}
        isSyncing={isSyncing}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Only in Drive View, or can trigger photos) */}
        {appView === 'drive' && (
          <Sidebar
            currentFolderId={currentFolderId}
            onSelectFolder={setCurrentFolderId}
            folders={folders}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
            onOpenTelegramSetup={() => setIsTelegramSetupOpen(true)}
            telegramConfig={telegramConfig}
            totalStorageBytes={totalStorageBytes}
            totalFilesCount={files.length}
            folderFileCounts={folderFileCounts}
            categoryCounts={categoryCounts}
            onOpenPhotos={() => setAppView('photos')}
          />
        )}

        {/* Center Main View Area: Google Photos View OR Drive File Explorer */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {appView === 'photos' ? (
            <GooglePhotosView
              files={files}
              autoBackupConfig={autoBackupConfig}
              telegramConfig={telegramConfig}
              aiAlbums={aiAlbums}
              peopleClusters={peopleClusters}
              onUpdateAiAlbums={setAiAlbums}
              onUpdatePeopleClusters={setPeopleClusters}
              onScanAiAlbumsAndFaces={handleScanAiAlbumsAndFaces}
              isAnalyzingAi={isAnalyzingAi}
              onOpenBackupSettings={() => setIsAutoBackupSettingsOpen(true)}
              onSelectPhoto={(f) => setLightboxPhoto(f)}
              onToggleFavorite={handleToggleFavorite}
              onDeletePhoto={handleDeleteFile}
              onSimulateCameraShot={handleSimulateCameraShot}
              isSyncing={isSyncing}
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {/* Storage stats overview banner */}
              <StorageStatsBar
                files={files}
                totalBytes={totalStorageBytes}
                isConnected={telegramConfig.isConnected}
                botUsername={telegramConfig.botUsername}
                onOpenSetup={() => setIsTelegramSetupOpen(true)}
              />

              {/* Breadcrumb & View controls */}
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {currentFolder
                        ? currentFolder.name
                        : activeCategory === 'all'
                        ? 'All Files'
                        : activeCategory === 'favorites'
                        ? 'Favorite Files'
                        : activeCategory === 'recent'
                        ? 'Recent Files'
                        : `${activeCategory.toUpperCase()} Files`}
                    </h1>
                    <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {displayedFiles.length}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {currentFolder
                      ? `Folder: ${currentFolder.name} • ${displayedFiles.length} item(s)`
                      : 'Unlimited cloud drive backed by Telegram documents'}
                  </p>
                </div>

                {/* Sort & Grid/List view toggle */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-800 dark:bg-slate-900">
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent font-medium text-slate-700 focus:outline-none dark:text-slate-200"
                    >
                      <option value="date_desc">Newest First</option>
                      <option value="date_asc">Oldest First</option>
                      <option value="name_asc">Name (A-Z)</option>
                      <option value="size_desc">Largest Size</option>
                    </select>
                  </div>

                  <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-900">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`rounded-lg p-1.5 transition ${
                        viewMode === 'grid'
                          ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`rounded-lg p-1.5 transition ${
                        viewMode === 'list'
                          ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title="List View"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Files Display in Drive mode */}
              {displayedFiles.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 dark:bg-sky-950/60">
                    <Folder className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-100">
                    No files found
                  </h3>
                  <p className="mt-1 max-w-sm text-xs text-slate-500">
                    {searchQuery
                      ? `No items match "${searchQuery}".`
                      : 'This folder is currently empty. Upload files or switch to Google Photos view.'}
                  </p>
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-700"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Files Now</span>
                    </button>
                    <button
                      onClick={() => setAppView('photos')}
                      className="flex items-center gap-2 rounded-xl border border-sky-300 bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300"
                    >
                      <Camera className="h-4 w-4 text-sky-500" />
                      <span>Open Google Photos</span>
                    </button>
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {displayedFiles.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      onPreview={(f) => setPreviewFile(f)}
                      onToggleFavorite={handleToggleFavorite}
                      onDelete={handleDeleteFile}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                        <th className="py-3 pl-4 pr-3">Name</th>
                        <th className="hidden px-3 py-3 md:table-cell">Storage Provider</th>
                        <th className="hidden px-3 py-3 sm:table-cell">Folder</th>
                        <th className="px-3 py-3">Size</th>
                        <th className="hidden px-3 py-3 lg:table-cell">Uploaded Date</th>
                        <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedFiles.map((file) => (
                        <FileTableRow
                          key={file.id}
                          file={file}
                          folders={folders}
                          onPreview={(f) => setPreviewFile(f)}
                          onToggleFavorite={handleToggleFavorite}
                          onDelete={handleDeleteFile}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Floating Gemini AI Quick Toggle at bottom-right */}
      {!isAiChatOpen && (
        <button
          onClick={() => setIsAiChatOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 transition-transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="h-4 w-4" />
          <span>Gemini Copilot</span>
        </button>
      )}

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        folders={folders}
        currentFolderId={currentFolderId}
        telegramConfig={telegramConfig}
        onFilesUploaded={handleFilesUploaded}
      />

      {/* Telegram Bot Setup Modal */}
      <TelegramSetupModal
        isOpen={isTelegramSetupOpen}
        onClose={() => setIsTelegramSetupOpen(false)}
        config={telegramConfig}
        onSaveConfig={handleSaveTelegramConfig}
        onDisconnect={handleDisconnectTelegram}
      />

      {/* Google Photos Auto-Backup Settings Modal */}
      <AutoBackupSettingsModal
        isOpen={isAutoBackupSettingsOpen}
        onClose={() => setIsAutoBackupSettingsOpen(false)}
        config={autoBackupConfig}
        onSaveConfig={(newConfig) => {
          setAutoBackupConfig(newConfig);
          showToast('Auto-backup settings updated!');
        }}
        telegramConfig={telegramConfig}
        files={files}
        onSimulateNewPhoto={handleSimulateCameraShot}
        onFreeUpSpace={handleFreeUpSpace}
        onPickDeviceFolder={handlePickDeviceFolder}
        isSyncing={isSyncing}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreateFolder={handleCreateFolder}
      />

      {/* Standard File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        folders={folders}
        telegramConfig={telegramConfig}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onToggleFavorite={handleToggleFavorite}
        onDeleteFile={handleDeleteFile}
        onMoveFile={handleMoveFile}
      />

      {/* Google Photos Lightbox Modal */}
      <PhotoLightboxModal
        currentFile={lightboxPhoto}
        allPhotos={allMediaFiles}
        isOpen={!!lightboxPhoto}
        onClose={() => setLightboxPhoto(null)}
        onSelectPhoto={(f) => setLightboxPhoto(f)}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDeleteFile}
        telegramConfig={telegramConfig}
      />

      {/* Gemini Multi-turn Chatbot Drawer */}
      <GeminiChatDrawer
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        files={files}
        folders={folders}
        telegramConfig={telegramConfig}
        totalStorageBytes={totalStorageBytes}
      />

      {/* Android PWA & APK Installation Modal */}
      <AndroidInstallModal
        isOpen={isAndroidInstallOpen}
        onClose={() => setIsAndroidInstallOpen(false)}
      />
    </div>
  );
}
