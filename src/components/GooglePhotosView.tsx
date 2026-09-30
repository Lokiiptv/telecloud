import React, { useState, useMemo } from 'react';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  FolderSync,
  Play,
  Star,
  Check,
  Smartphone,
  Sparkles,
  Search,
  Grid,
  Maximize2,
  Calendar,
  Layers,
  Heart,
  Video,
  Image as ImageIcon,
  Share2,
  Download,
  Trash2,
  Send,
  Camera,
  Zap,
  Users,
  Edit2,
  UserCheck,
  Tag,
  Loader2,
  Compass,
} from 'lucide-react';
import {
  AutoBackupConfig,
  CloudFile,
  PhotoAlbum,
  TelegramConfig,
  AIThematicAlbum,
  PersonFaceCluster,
} from '../types';
import {
  groupPhotosByDate,
  formatBytes,
  formatDuration,
  INITIAL_ALBUMS,
} from '../utils/storage';

interface GooglePhotosViewProps {
  files: CloudFile[];
  autoBackupConfig: AutoBackupConfig;
  telegramConfig: TelegramConfig;
  aiAlbums: AIThematicAlbum[];
  peopleClusters: PersonFaceCluster[];
  onUpdateAiAlbums: (albums: AIThematicAlbum[]) => void;
  onUpdatePeopleClusters: (people: PersonFaceCluster[]) => void;
  onScanAiAlbumsAndFaces: () => Promise<void>;
  isAnalyzingAi?: boolean;
  onOpenBackupSettings: () => void;
  onSelectPhoto: (file: CloudFile) => void;
  onToggleFavorite: (fileId: string) => void;
  onDeletePhoto: (file: CloudFile) => void;
  onSimulateCameraShot: () => void;
  isSyncing?: boolean;
}

export const GooglePhotosView: React.FC<GooglePhotosViewProps> = ({
  files,
  autoBackupConfig,
  telegramConfig,
  aiAlbums,
  peopleClusters,
  onUpdateAiAlbums,
  onUpdatePeopleClusters,
  onScanAiAlbumsAndFaces,
  isAnalyzingAi = false,
  onOpenBackupSettings,
  onSelectPhoto,
  onToggleFavorite,
  onDeletePhoto,
  onSimulateCameraShot,
  isSyncing,
}) => {
  const [activeTab, setActiveTab] = useState<
    'photos' | 'ai_albums' | 'people' | 'albums' | 'videos' | 'favorites'
  >('photos');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedAiAlbumId, setSelectedAiAlbumId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [gridSize, setGridSize] = useState<'normal' | 'compact' | 'large'>('normal');
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  // Editing person name state
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editingPersonName, setEditingPersonName] = useState('');

  // Filter media files (images and videos only)
  const mediaFiles = useMemo(() => {
    return files.filter((f) => {
      const isMedia = f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/');
      if (!isMedia) return false;

      // Tab filter
      if (activeTab === 'videos' && !f.mimeType.startsWith('video/')) return false;
      if (activeTab === 'favorites' && !f.isFavorite) return false;

      // Selected AI Thematic Album filter
      if (selectedAiAlbumId) {
        const album = aiAlbums.find((a) => a.id === selectedAiAlbumId);
        if (album && !album.photoIds.includes(f.id)) return false;
      }

      // Selected Person Face filter
      if (selectedPersonId) {
        const person = peopleClusters.find((p) => p.id === selectedPersonId);
        if (person && !person.photoIds.includes(f.id)) return false;
      }

      // Standard Album filter
      if (selectedAlbumId) {
        if (selectedAlbumId === 'videos' && !f.mimeType.startsWith('video/')) return false;
        if (selectedAlbumId === 'favorites' && !f.isFavorite) return false;
        if (selectedAlbumId === 'camera' && f.deviceSource !== 'Camera') return false;
        if (selectedAlbumId === 'screenshots' && f.deviceSource !== 'Screenshots') return false;
        if (selectedAlbumId === 'travel' && f.album !== 'Travel') return false;
        if (selectedAlbumId === 'city' && f.album !== 'City Life') return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesCaption = f.caption?.toLowerCase().includes(q);
        const matchesTags = f.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesAlbum = f.album?.toLowerCase().includes(q);
        if (!matchesName && !matchesCaption && !matchesTags && !matchesAlbum) return false;
      }

      return true;
    });
  }, [
    files,
    activeTab,
    selectedAlbumId,
    selectedPersonId,
    selectedAiAlbumId,
    aiAlbums,
    peopleClusters,
    searchQuery,
  ]);

  const dateGroups = useMemo(() => {
    return groupPhotosByDate(mediaFiles);
  }, [mediaFiles]);

  // Selection actions
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectGroup = (groupFiles: CloudFile[]) => {
    const allSelected = groupFiles.every((f) => selectedFileIds.has(f.id));
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      groupFiles.forEach((f) => {
        if (allSelected) next.delete(f.id);
        else next.add(f.id);
      });
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedFileIds(new Set());
  };

  const handleSavePersonName = (personId: string) => {
    if (!editingPersonName.trim()) return;
    const updated = peopleClusters.map((p) =>
      p.id === personId ? { ...p, name: editingPersonName.trim(), isNamed: true } : p
    );
    onUpdatePeopleClusters(updated);
    setEditingPersonId(null);
    setEditingPersonName('');
  };

  // Google Photos Memories Stories Carousel
  const memories = useMemo(() => {
    const withCovers = files.filter((f) => f.localPreviewUrl && f.mimeType.startsWith('image/'));
    return [
      {
        id: 'mem-1',
        title: '✨ Best of Today',
        subtitle: 'Highlights',
        coverUrl: withCovers[0]?.localPreviewUrl || '',
      },
      {
        id: 'mem-2',
        title: '🌲 Trip to Nature',
        subtitle: 'September 2026',
        coverUrl: withCovers[4]?.localPreviewUrl || withCovers[1]?.localPreviewUrl || '',
      },
      {
        id: 'mem-3',
        title: '🏙️ City Lights',
        subtitle: 'Recent Nights',
        coverUrl: withCovers[3]?.localPreviewUrl || withCovers[2]?.localPreviewUrl || '',
      },
      {
        id: 'mem-4',
        title: '☕ Cozy Cafe Moments',
        subtitle: '1 week ago',
        coverUrl: withCovers[2]?.localPreviewUrl || '',
      },
    ];
  }, [files]);

  const selectedAiAlbum = aiAlbums.find((a) => a.id === selectedAiAlbumId);
  const selectedPerson = peopleClusters.find((p) => p.id === selectedPersonId);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Top Google Photos Navigation & Auto-Backup Status Strip */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/90 bg-white/95 px-6 py-2.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        {/* Navigation Tabs (Photos, AI Albums, People & Pets, Albums, Videos, Favorites) */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => {
              setActiveTab('photos');
              setSelectedAlbumId(null);
              setSelectedAiAlbumId(null);
              setSelectedPersonId(null);
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
              activeTab === 'photos' && !selectedAlbumId && !selectedAiAlbumId && !selectedPersonId
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            Photos
          </button>

          {/* AI Albums Tab with Sparkles */}
          <button
            onClick={() => {
              setActiveTab('ai_albums');
              setSelectedAlbumId(null);
              setSelectedPersonId(null);
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
              activeTab === 'ai_albums'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm'
                : 'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Albums</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
              {aiAlbums.length}
            </span>
          </button>

          {/* People & Pets Tab (Google Photos Face Find) */}
          <button
            onClick={() => {
              setActiveTab('people');
              setSelectedAlbumId(null);
              setSelectedAiAlbumId(null);
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
              activeTab === 'people'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                : 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>People & Pets</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
              {peopleClusters.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('albums');
              setSelectedAiAlbumId(null);
              setSelectedPersonId(null);
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
              activeTab === 'albums'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            Folders
          </button>

          <button
            onClick={() => {
              setActiveTab('videos');
              setSelectedAlbumId(null);
              setSelectedAiAlbumId(null);
              setSelectedPersonId(null);
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
              activeTab === 'videos'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            Videos
          </button>

          <button
            onClick={() => {
              setActiveTab('favorites');
              setSelectedAlbumId(null);
              setSelectedAiAlbumId(null);
              setSelectedPersonId(null);
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
              activeTab === 'favorites'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            Favorites
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {/* AI Trigger button */}
          <button
            onClick={onScanAiAlbumsAndFaces}
            disabled={isAnalyzingAi}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1 text-xs font-bold text-indigo-700 shadow-sm transition hover:from-indigo-100 hover:to-purple-100 dark:border-indigo-800 dark:from-indigo-950/60 dark:to-purple-950/50 dark:text-indigo-300 disabled:opacity-50"
            title="Automatically group photos into Vacation, Food, Pets, and detect faces using Gemini"
          >
            {isAnalyzingAi ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            )}
            <span className="hidden sm:inline">
              {isAnalyzingAi ? 'Gemini Analyzing...' : 'Run AI Grouping'}
            </span>
          </button>

          {/* Auto-backup status chip */}
          <button
            onClick={onOpenBackupSettings}
            className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50/80 px-2.5 py-1 text-xs font-semibold text-sky-800 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
          >
            {isSyncing ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-sky-600" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            )}
            <span className="hidden md:inline">Auto-Backup</span>
          </button>

          {/* Grid density selector */}
          <div className="hidden rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-800 lg:flex">
            <button
              onClick={() => setGridSize('compact')}
              className={`rounded-lg px-2 py-1 text-[11px] font-semibold ${
                gridSize === 'compact'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setGridSize('normal')}
              className={`rounded-lg px-2 py-1 text-[11px] font-semibold ${
                gridSize === 'normal'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setGridSize('large')}
              className={`rounded-lg px-2 py-1 text-[11px] font-semibold ${
                gridSize === 'large'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500'
              }`}
            >
              Large
            </button>
          </div>
        </div>
      </div>

      {/* Multi-selection sticky banner */}
      {selectedFileIds.size > 0 && (
        <div className="sticky top-12 z-20 flex items-center justify-between border-b border-sky-300 bg-sky-500 px-6 py-2 text-white shadow-md animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">{selectedFileIds.size} selected</span>
            <button
              onClick={clearSelection}
              className="rounded-lg bg-sky-600 px-2.5 py-1 text-xs hover:bg-sky-700"
            >
              Deselect all
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Downloaded ${selectedFileIds.size} photos`)}
              className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={() => {
                selectedFileIds.forEach((id) => {
                  const f = files.find((item) => item.id === id);
                  if (f) onDeletePhoto(f);
                });
                clearSelection();
              }}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold hover:bg-red-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Active Filter Banner (When an AI album, Face person, or Device album is active) */}
        {(selectedAiAlbum || selectedPerson || selectedAlbumId) && (
          <div className="flex items-center justify-between rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 to-purple-50/80 p-4 shadow-sm dark:border-indigo-900/50 dark:from-indigo-950/40 dark:to-purple-950/30">
            <div className="flex items-center gap-3">
              {selectedPerson?.avatarUrl ? (
                <img
                  src={selectedPerson.avatarUrl}
                  alt={selectedPerson.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500 shadow-md"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-lg text-white shadow-md">
                  {selectedAiAlbum?.emoji || '📁'}
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedPerson
                    ? `Photos of ${selectedPerson.name}`
                    : selectedAiAlbum
                    ? `${selectedAiAlbum.emoji || '✨'} ${selectedAiAlbum.title}`
                    : `Album: ${selectedAlbumId?.toUpperCase()}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedPerson
                    ? `${selectedPerson.photoIds.length} photos found with this ${selectedPerson.type}`
                    : selectedAiAlbum?.description || 'Thematic collection'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedAiAlbumId(null);
                setSelectedPersonId(null);
                setSelectedAlbumId(null);
              }}
              className="rounded-xl border border-indigo-300 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300"
            >
              Clear Filter & View All
            </button>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 1: AI THEMATIC ALBUMS TAB ('Vacation', 'Food', 'Pets', etc.) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'ai_albums' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    ✨ Gemini Thematic Albums
                  </h2>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Auto-Grouped
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gemini analyzes photo visuals, metadata, and captions to generate smart thematic
                  collections.
                </p>
              </div>

              <button
                onClick={onScanAiAlbumsAndFaces}
                disabled={isAnalyzingAi}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/25 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
              >
                {isAnalyzingAi ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>{isAnalyzingAi ? 'Grouping with Gemini...' : 'Re-group with Gemini AI'}</span>
              </button>
            </div>

            {/* AI Thematic Albums Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {aiAlbums.map((album) => {
                const coverPhoto = files.find(
                  (f) => f.id === album.coverPhotoId || album.photoIds.includes(f.id)
                );
                const coverUrl = album.coverUrl || coverPhoto?.localPreviewUrl || '';

                return (
                  <div
                    key={album.id}
                    onClick={() => {
                      setSelectedAiAlbumId(album.id);
                      setSelectedPersonId(null);
                      setSelectedAlbumId(null);
                      setActiveTab('photos');
                    }}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
                  >
                    {/* Cover Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={album.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}

                      {/* Emoji category badge */}
                      <div className="absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-base backdrop-blur-md">
                        {album.emoji || '✨'}
                      </div>

                      {/* Count badge */}
                      <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                        {album.photoIds.length} photos
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                          {album.title}
                        </h4>
                        {album.confidence && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {Math.round(album.confidence * 100)}% match
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {album.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 2: PEOPLE & PETS (Google Photos Face Recognition) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'people' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    👥 People & Pets (Google Photos Face Find)
                  </h2>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Face Clusters
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Google Photos-style facial recognition: Find people and pets across your Telegram
                  vault and create personal albums.
                </p>
              </div>

              <button
                onClick={onScanAiAlbumsAndFaces}
                disabled={isAnalyzingAi}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/25 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {isAnalyzingAi ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                <span>{isAnalyzingAi ? 'Scanning Faces...' : 'Scan Faces with Gemini'}</span>
              </button>
            </div>

            {/* Circular Face Avatars Grid (Signature Google Photos look) */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {peopleClusters.map((person) => {
                const samplePhoto = files.find(
                  (f) => f.id === person.avatarPhotoId || person.photoIds.includes(f.id)
                );
                const avatar = person.avatarUrl || samplePhoto?.localPreviewUrl || '';
                const isEditing = editingPersonId === person.id;

                return (
                  <div
                    key={person.id}
                    onClick={() => {
                      if (isEditing) return;
                      setSelectedPersonId(person.id);
                      setSelectedAiAlbumId(null);
                      setSelectedAlbumId(null);
                      setActiveTab('photos');
                    }}
                    className="group flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white p-4 text-center shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
                  >
                    {/* Circular Avatar */}
                    <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-slate-100 transition-transform duration-300 group-hover:scale-105 group-hover:ring-blue-400 dark:ring-slate-800">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={person.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-500 font-bold">
                          {person.name[0] || 'U'}
                        </div>
                      )}

                      {person.type === 'pet' && (
                        <span className="absolute bottom-0 right-0 rounded-full bg-amber-500 p-1 text-[10px] text-white shadow">
                          🐾
                        </span>
                      )}
                    </div>

                    {/* Name & Rename field */}
                    <div className="mt-3 w-full" onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            autoFocus
                            value={editingPersonName}
                            onChange={(e) => setEditingPersonName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSavePersonName(person.id);
                              if (e.key === 'Escape') setEditingPersonId(null);
                            }}
                            className="w-full rounded-lg border border-blue-400 bg-blue-50/50 px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none dark:bg-slate-800 dark:text-white"
                          />
                          <button
                            onClick={() => handleSavePersonName(person.id)}
                            className="rounded-lg bg-blue-600 p-1 text-white hover:bg-blue-700"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <h4
                            className={`text-xs font-bold truncate ${
                              person.isNamed
                                ? 'text-slate-900 dark:text-white'
                                : 'italic text-blue-600 dark:text-blue-400 underline decoration-dashed'
                            }`}
                          >
                            {person.name}
                          </h4>
                          <button
                            onClick={() => {
                              setEditingPersonId(person.id);
                              setEditingPersonName(person.name === 'Add name...' ? '' : person.name);
                            }}
                            className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-blue-600 transition"
                            title="Edit person name"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {person.photoIds.length} photos
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 3: STANDARD ALBUMS TAB */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'albums' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Device Folders & Sources
              </h2>
              <span className="text-xs text-slate-500">
                Backed up from Camera, WhatsApp, and Telegram
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {INITIAL_ALBUMS.map((album) => {
                const coverPhoto = files.find((f) => {
                  if (album.id === 'videos') return f.mimeType.startsWith('video/');
                  if (album.id === 'favorites') return f.isFavorite;
                  if (album.id === 'camera') return f.deviceSource === 'Camera';
                  if (album.id === 'screenshots') return f.deviceSource === 'Screenshots';
                  if (album.id === 'travel') return f.album === 'Travel';
                  return f.mimeType.startsWith('image/');
                });

                return (
                  <div
                    key={album.id}
                    onClick={() => {
                      setSelectedAlbumId(album.id);
                      setSelectedAiAlbumId(null);
                      setSelectedPersonId(null);
                      setActiveTab('photos');
                    }}
                    className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      {coverPhoto?.localPreviewUrl ? (
                        <img
                          src={coverPhoto.localPreviewUrl}
                          alt={album.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="mt-2.5">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 dark:text-white">
                        {album.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">{album.count} items • Backed up</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 4: TIMELINE PHOTOS (Google Photos Core View) */}
        {/* ---------------------------------------------------- */}
        {(activeTab === 'photos' || activeTab === 'videos' || activeTab === 'favorites') && (
          <div className="space-y-6">
            {/* Memories carousel only shown on main photos tab without filters */}
            {activeTab === 'photos' &&
              !selectedAlbumId &&
              !selectedAiAlbumId &&
              !selectedPersonId && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Memories & Highlights
                    </span>
                    <span className="text-xs text-slate-400">Rediscover past moments</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {memories.map((mem) => (
                      <div
                        key={mem.id}
                        onClick={() => {
                          const sample = files.find((f) => f.localPreviewUrl === mem.coverUrl);
                          if (sample) onSelectPhoto(sample);
                        }}
                        className="group relative h-44 overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-slate-800 cursor-pointer"
                      >
                        <img
                          src={mem.coverUrl}
                          alt={mem.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">
                            {mem.subtitle}
                          </p>
                          <h4 className="text-xs font-bold leading-snug drop-shadow-sm">
                            {mem.title}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Timeline Sections */}
            {dateGroups.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 dark:bg-sky-950/60">
                  <ImageIcon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-100">
                  No photos or videos match this filter
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Try clearing filters or taking a new photo with auto-backup.
                </p>
                <button
                  onClick={() => {
                    setSelectedAiAlbumId(null);
                    setSelectedPersonId(null);
                    setSelectedAlbumId(null);
                  }}
                  className="mt-4 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700"
                >
                  View All Photos
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {dateGroups.map((group) => (
                  <div key={group.dateKey} className="space-y-3">
                    {/* Date Header with Select All checkmark */}
                    <div className="sticky top-14 z-10 flex items-center justify-between bg-slate-100/90 py-1.5 backdrop-blur-md dark:bg-slate-950/90">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSelectGroup(group.files)}
                          className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                            group.files.every((f) => selectedFileIds.has(f.id))
                              ? 'border-sky-500 bg-sky-500 text-white'
                              : 'border-slate-300 hover:border-slate-400 dark:border-slate-700'
                          }`}
                          title="Select all photos from this day"
                        >
                          {group.files.every((f) => selectedFileIds.has(f.id)) && (
                            <Check className="h-3 w-3" />
                          )}
                        </button>
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {group.displayTitle}
                          </span>
                          <span className="ml-2 text-xs text-slate-400">{group.subtitle}</span>
                        </div>
                      </div>

                      <span className="text-xs text-slate-400 font-medium">
                        {group.files.length} item(s)
                      </span>
                    </div>

                    {/* Photos Grid */}
                    <div
                      className={`grid gap-2.5 ${
                        gridSize === 'compact'
                          ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8'
                          : gridSize === 'large'
                          ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                      }`}
                    >
                      {group.files.map((file) => {
                        const isVideo = file.mimeType.startsWith('video/');
                        const isSelected = selectedFileIds.has(file.id);

                        return (
                          <div
                            key={file.id}
                            onClick={() => onSelectPhoto(file)}
                            className={`group relative aspect-square overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md ${
                              isSelected ? 'ring-4 ring-sky-500 scale-[0.98]' : ''
                            }`}
                          >
                            {/* Image/Thumbnail */}
                            {file.localPreviewUrl ? (
                              <img
                                src={file.localPreviewUrl}
                                alt={file.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                {isVideo ? <Video className="h-8 w-8" /> : <ImageIcon className="h-8 w-8" />}
                              </div>
                            )}

                            {/* Video Duration Badge */}
                            {isVideo && (
                              <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                                <Play className="h-2.5 w-2.5 fill-white" />
                                <span>{file.duration ? formatDuration(file.duration) : 'VID'}</span>
                              </div>
                            )}

                            {/* Top Left: Selection Checkbox */}
                            <div
                              onClick={(e) => toggleSelect(file.id, e)}
                              className={`absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full transition ${
                                isSelected
                              ? 'bg-sky-500 text-white shadow-md'
                              : 'opacity-0 group-hover:opacity-100 bg-black/40 text-white backdrop-blur-sm hover:bg-black/60'
                              }`}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </div>

                            {/* Top Right: Telegram Backed up Badge & Favorite Star */}
                            <div className="absolute top-2 right-2 flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFavorite(file.id);
                                }}
                                className={`rounded-full p-1 transition ${
                                  file.isFavorite
                                    ? 'bg-black/40 text-amber-400'
                                    : 'opacity-0 group-hover:opacity-100 bg-black/40 text-white/80 hover:text-white'
                                }`}
                              >
                                <Star
                                  className={`h-3.5 w-3.5 ${file.isFavorite ? 'fill-amber-400' : ''}`}
                                />
                              </button>

                              <div
                                className="flex items-center gap-0.5 rounded-full bg-sky-600/80 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm backdrop-blur-sm"
                                title="Safely backed up in Telegram Cloud"
                              >
                                <Send className="h-2.5 w-2.5" />
                              </div>
                            </div>

                            {/* Bottom subtle label on hover */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="truncate text-[10px] font-medium text-white">{file.name}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
