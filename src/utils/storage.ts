import {
  CloudFile,
  CloudFolder,
  TelegramConfig,
  AutoBackupConfig,
  PhotoAlbum,
  AIThematicAlbum,
  PersonFaceCluster,
} from '../types';

export const INITIAL_FOLDERS: CloudFolder[] = [
  { id: 'camera', name: 'Camera Roll', parentId: null, color: 'blue', createdAt: '2026-09-15T10:00:00Z' },
  { id: 'docs', name: 'Documents & Notes', parentId: null, color: 'purple', createdAt: '2026-09-15T10:00:00Z' },
  { id: 'media', name: 'Photos & Videos', parentId: null, color: 'emerald', createdAt: '2026-09-16T14:30:00Z' },
  { id: 'projects', name: 'Work & Code Vault', parentId: null, color: 'amber', createdAt: '2026-09-18T09:15:00Z' },
  { id: 'backups', name: 'Cloud Backups', parentId: null, color: 'cyan', createdAt: '2026-09-20T16:45:00Z' },
];

export const INITIAL_FILES: CloudFile[] = [
  // Today's Photos & Videos (Google Photos style)
  {
    id: 'photo-today-1',
    name: 'IMG_20260929_141203.jpg',
    size: 4210000,
    mimeType: 'image/jpeg',
    folderId: 'camera',
    uploadedAt: '2026-09-29T14:12:00Z',
    capturedAt: '2026-09-29T14:10:00Z',
    telegramMessageId: 1061,
    telegramFileId: 'AgACAgIAAxkBAAIEQm...',
    caption: 'Golden hour sunset over mountain ridge',
    tags: ['Sunset', 'Mountains', 'Nature', 'AutoBackup'],
    isFavorite: true,
    storageProvider: 'demo',
    dimensions: { width: 4032, height: 3024 },
    deviceSource: 'Camera',
    backupStatus: 'synced',
    album: 'Travel',
    localPreviewUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'photo-today-2',
    name: 'VID_20260929_110540.mp4',
    size: 19800000,
    mimeType: 'video/mp4',
    folderId: 'camera',
    uploadedAt: '2026-09-29T11:06:00Z',
    capturedAt: '2026-09-29T11:04:00Z',
    telegramMessageId: 1062,
    telegramFileId: 'BAACAgIAAxkBAAIERm...',
    caption: 'Drone hyperlapse of city coast',
    tags: ['Video', 'Travel', '4K', 'AutoBackup'],
    isFavorite: true,
    storageProvider: 'demo',
    duration: 18,
    dimensions: { width: 3840, height: 2160 },
    deviceSource: 'Camera',
    backupStatus: 'synced',
    album: 'Videos',
    localPreviewUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'photo-today-3',
    name: 'IMG_20260929_092015.jpg',
    size: 3150000,
    mimeType: 'image/jpeg',
    folderId: 'camera',
    uploadedAt: '2026-09-29T09:21:00Z',
    capturedAt: '2026-09-29T09:18:00Z',
    telegramMessageId: 1063,
    telegramFileId: 'AgACAgIAAxkBAAIESm...',
    caption: 'Espresso & croissant breakfast by the window',
    tags: ['Cafe', 'Food', 'Morning', 'AutoBackup'],
    storageProvider: 'demo',
    dimensions: { width: 4032, height: 3024 },
    deviceSource: 'Camera',
    backupStatus: 'synced',
    album: 'Favorites',
    localPreviewUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
  },

  // Yesterday's Photos
  {
    id: 'photo-yest-1',
    name: 'IMG_20260928_183022.jpg',
    size: 3840000,
    mimeType: 'image/jpeg',
    folderId: 'camera',
    uploadedAt: '2026-09-28T18:31:00Z',
    capturedAt: '2026-09-28T18:29:00Z',
    telegramMessageId: 1059,
    telegramFileId: 'AgACAgIAAxkBAAIETm...',
    caption: 'Neon illuminated city street night reflections',
    tags: ['City', 'Night', 'Neon', 'AutoBackup'],
    isFavorite: true,
    storageProvider: 'demo',
    dimensions: { width: 4032, height: 3024 },
    deviceSource: 'Camera',
    backupStatus: 'synced',
    album: 'City Life',
    localPreviewUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'photo-yest-2',
    name: 'Screenshot_20260928_142010.png',
    size: 1420000,
    mimeType: 'image/png',
    folderId: 'media',
    uploadedAt: '2026-09-28T14:21:00Z',
    capturedAt: '2026-09-28T14:20:00Z',
    telegramMessageId: 1060,
    caption: 'Flight booking itinerary confirmation',
    tags: ['Screenshot', 'Flight', 'Travel'],
    storageProvider: 'demo',
    dimensions: { width: 1170, height: 2532 },
    deviceSource: 'Screenshots',
    backupStatus: 'synced',
    album: 'Screenshots',
    localPreviewUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
  },

  // Earlier this week / September
  {
    id: 'photo-earlier-1',
    name: 'IMG_20260925_164512.jpg',
    size: 4950000,
    mimeType: 'image/jpeg',
    folderId: 'camera',
    uploadedAt: '2026-09-25T16:46:00Z',
    capturedAt: '2026-09-25T16:44:00Z',
    telegramMessageId: 1053,
    caption: 'Emerald alpine lake with pine trees reflection',
    tags: ['Nature', 'Lake', 'Landscape', 'AutoBackup'],
    isFavorite: true,
    storageProvider: 'demo',
    dimensions: { width: 4032, height: 3024 },
    deviceSource: 'Camera',
    backupStatus: 'synced',
    album: 'Travel',
    localPreviewUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'photo-earlier-2',
    name: 'IMG_20260924_121045.jpg',
    size: 2900000,
    mimeType: 'image/jpeg',
    folderId: 'camera',
    uploadedAt: '2026-09-24T12:11:00Z',
    capturedAt: '2026-09-24T12:09:00Z',
    telegramMessageId: 1052,
    caption: 'Golden retriever running in park grass',
    tags: ['Pets', 'Dog', 'Cute', 'AutoBackup'],
    storageProvider: 'demo',
    dimensions: { width: 4032, height: 3024 },
    deviceSource: 'Camera',
    backupStatus: 'synced',
    album: 'Favorites',
    localPreviewUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'photo-earlier-3',
    name: 'VID_20260922_194510.mp4',
    size: 32400000,
    mimeType: 'video/mp4',
    folderId: 'camera',
    uploadedAt: '2026-09-22T19:46:00Z',
    capturedAt: '2026-09-22T19:43:00Z',
    telegramMessageId: 1050,
    caption: 'Campfire acoustic jam session',
    tags: ['Video', 'Music', 'Campfire'],
    storageProvider: 'demo',
    duration: 35,
    dimensions: { width: 1920, height: 1080 },
    deviceSource: 'Camera',
    backupStatus: 'synced',
    album: 'Videos',
    localPreviewUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1200&q=80',
  },

  // Documents and archives from drive
  {
    id: 'seed-1',
    name: 'Project_Roadmap_2026.pdf',
    size: 2450000,
    mimeType: 'application/pdf',
    folderId: 'docs',
    uploadedAt: '2026-09-26T14:20:00Z',
    telegramMessageId: 1042,
    telegramFileId: 'BQACAgIAAxkBAAIEMm...',
    caption: 'Q3/Q4 Strategic Roadmap & Milestones',
    tags: ['Work', 'Roadmap', 'Planning'],
    isPinned: true,
    isFavorite: true,
    storageProvider: 'demo',
  },
  {
    id: 'seed-2',
    name: 'telegram_cloud_architecture.png',
    size: 1820000,
    mimeType: 'image/png',
    folderId: 'media',
    uploadedAt: '2026-09-27T08:12:00Z',
    telegramMessageId: 1045,
    telegramFileId: 'AgACAgIAAxkBAAIEM2...',
    caption: 'Architecture blueprint showing Telegram Bot API document bridge',
    tags: ['Architecture', 'Diagram', 'Telegram'],
    storageProvider: 'demo',
    localPreviewUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'seed-3',
    name: 'Client_Contract_Executed.docx',
    size: 780000,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    folderId: 'docs',
    uploadedAt: '2026-09-28T11:05:00Z',
    telegramMessageId: 1048,
    caption: 'Signed vendor enterprise contract',
    tags: ['Legal', 'Contract'],
    storageProvider: 'demo',
  },
  {
    id: 'seed-4',
    name: 'api_server_backup.tar.gz',
    size: 14500000,
    mimeType: 'application/gzip',
    folderId: 'backups',
    uploadedAt: '2026-09-28T19:30:00Z',
    telegramMessageId: 1051,
    caption: 'Automated nightly server config & database snapshot',
    tags: ['Backup', 'Archive', 'Nightly'],
    storageProvider: 'demo',
  },
  {
    id: 'seed-6',
    name: 'database_schema.sql',
    size: 145000,
    mimeType: 'text/x-sql',
    folderId: 'projects',
    uploadedAt: '2026-09-29T09:40:00Z',
    telegramMessageId: 1058,
    caption: 'PostgreSQL migration definitions for storage indexes',
    tags: ['Code', 'SQL', 'Database'],
    storageProvider: 'demo',
  },
];

export const INITIAL_ALBUMS: PhotoAlbum[] = [
  { id: 'all', title: 'All Photos & Videos', count: 8, type: 'system' },
  { id: 'favorites', title: 'Favorites', count: 4, type: 'system' },
  { id: 'videos', title: 'Videos', count: 2, type: 'system' },
  { id: 'camera', title: 'Camera Roll', count: 6, type: 'system' },
  { id: 'screenshots', title: 'Screenshots', count: 1, type: 'system' },
  { id: 'travel', title: 'Travel & Nature', count: 2, type: 'custom' },
  { id: 'city', title: 'City Life', count: 1, type: 'custom' },
];

export const DEFAULT_AUTO_BACKUP_CONFIG: AutoBackupConfig = {
  enabled: true,
  quality: 'original',
  backupVideos: true,
  backupOnWifiOnly: false,
  monitoredSources: ['Camera', 'Screenshots', 'WhatsApp', 'Downloads'],
  lastSyncTime: 'Just now',
  autoTagWithAi: true,
  isSimulatingLiveBackup: false,
};

export const INITIAL_AI_ALBUMS: AIThematicAlbum[] = [
  {
    id: 'ai-vacation',
    title: 'Vacation & Travel',
    category: 'vacation',
    emoji: '🌴',
    description: 'Scenic escapes, turquoise coastlines, lakes, and mountain horizons',
    coverPhotoId: 'photo-today-1',
    coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    photoIds: ['photo-today-1', 'photo-today-2', 'photo-earlier-1', 'photo-yest-2'],
    confidence: 0.96,
  },
  {
    id: 'ai-pets',
    title: 'Pets & Animals',
    category: 'pets',
    emoji: '🐾',
    description: 'Beloved four-legged friends, playful dogs, and puppies',
    coverPhotoId: 'photo-earlier-2',
    coverUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
    photoIds: ['photo-earlier-2'],
    confidence: 0.98,
  },
  {
    id: 'ai-food',
    title: 'Food & Dining',
    category: 'food',
    emoji: '🥐',
    description: 'Artisanal morning coffee, pastries, and dining moments',
    coverPhotoId: 'photo-today-3',
    coverUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    photoIds: ['photo-today-3'],
    confidence: 0.94,
  },
  {
    id: 'ai-city',
    title: 'City & Architecture',
    category: 'city',
    emoji: '🏙️',
    description: 'Urban architecture, evening neon lights, and city skylines',
    coverPhotoId: 'photo-yest-1',
    coverUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    photoIds: ['photo-yest-1', 'photo-today-2', 'seed-2'],
    confidence: 0.92,
  },
];

export const INITIAL_PEOPLE_CLUSTERS: PersonFaceCluster[] = [
  {
    id: 'face-1',
    name: 'Alex',
    type: 'person',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    avatarPhotoId: 'photo-today-1',
    photoIds: ['photo-today-1', 'photo-today-3'],
    isNamed: true,
  },
  {
    id: 'face-2',
    name: 'Sarah',
    type: 'person',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    avatarPhotoId: 'photo-today-3',
    photoIds: ['photo-today-3', 'photo-yest-1'],
    isNamed: true,
  },
  {
    id: 'face-3',
    name: 'Max (Golden Retriever)',
    type: 'pet',
    avatarUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80',
    avatarPhotoId: 'photo-earlier-2',
    photoIds: ['photo-earlier-2'],
    isNamed: true,
  },
  {
    id: 'face-4',
    name: 'Add name...',
    type: 'person',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    avatarPhotoId: 'photo-earlier-3',
    photoIds: ['photo-earlier-3'],
    isNamed: false,
  },
];

const STORAGE_KEY_FILES = 'telecloud_files_v2';
const STORAGE_KEY_FOLDERS = 'telecloud_folders_v2';
const STORAGE_KEY_CONFIG = 'telecloud_config_v2';
const STORAGE_KEY_AUTO_BACKUP = 'telecloud_autobackup_v2';
const STORAGE_KEY_AI_ALBUMS = 'telecloud_ai_albums_v2';
const STORAGE_KEY_PEOPLE = 'telecloud_people_clusters_v2';

export function loadAiAlbums(): AIThematicAlbum[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AI_ALBUMS);
    if (!raw) return INITIAL_AI_ALBUMS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_AI_ALBUMS;
  }
}

export function saveAiAlbums(albums: AIThematicAlbum[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_AI_ALBUMS, JSON.stringify(albums));
  } catch (err) {
    console.warn('Failed to save AI albums', err);
  }
}

export function loadPeopleClusters(): PersonFaceCluster[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PEOPLE);
    if (!raw) return INITIAL_PEOPLE_CLUSTERS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_PEOPLE_CLUSTERS;
  }
}

export function savePeopleClusters(people: PersonFaceCluster[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PEOPLE, JSON.stringify(people));
  } catch (err) {
    console.warn('Failed to save people clusters', err);
  }
}

export function loadFiles(): CloudFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FILES);
    if (!raw) return INITIAL_FILES;
    return JSON.parse(raw);
  } catch {
    return INITIAL_FILES;
  }
}

export function saveFiles(files: CloudFile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
  } catch (err) {
    console.warn('Failed to save files to localStorage', err);
  }
}

export function loadFolders(): CloudFolder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOLDERS);
    if (!raw) return INITIAL_FOLDERS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_FOLDERS;
  }
}

export function saveFolders(folders: CloudFolder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
  } catch (err) {
    console.warn('Failed to save folders to localStorage', err);
  }
}

export function loadTelegramConfig(): TelegramConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) {
      return {
        botToken: '',
        chatId: '',
        isConnected: false,
        autoSync: true,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      botToken: '',
      chatId: '',
      isConnected: false,
      autoSync: true,
    };
  }
}

export function saveTelegramConfig(config: TelegramConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save config to localStorage', err);
  }
}

export function loadAutoBackupConfig(): AutoBackupConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTO_BACKUP);
    if (!raw) return DEFAULT_AUTO_BACKUP_CONFIG;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_AUTO_BACKUP_CONFIG;
  }
}

export function saveAutoBackupConfig(config: AutoBackupConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUTO_BACKUP, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save auto backup config to localStorage', err);
  }
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export type FileCategory = 'document' | 'image' | 'video' | 'audio' | 'code' | 'archive' | 'other';

export function getFileCategory(mimeType: string, filename: string): FileCategory {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic'].includes(ext)) {
    return 'image';
  }
  if (mimeType.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
    return 'video';
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
    return 'audio';
  }
  if (
    mimeType.includes('pdf') ||
    mimeType.includes('document') ||
    mimeType.includes('msword') ||
    mimeType.includes('sheet') ||
    mimeType.includes('presentation') ||
    ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'txt', 'rtf', 'md', 'csv'].includes(ext)
  ) {
    return 'document';
  }
  if (
    ['json', 'js', 'ts', 'tsx', 'jsx', 'py', 'html', 'css', 'go', 'rs', 'java', 'c', 'cpp', 'sql', 'sh', 'yaml', 'yml'].includes(ext)
  ) {
    return 'code';
  }
  if (
    ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext) ||
    mimeType.includes('zip') ||
    mimeType.includes('tar')
  ) {
    return 'archive';
  }
  return 'other';
}

// Group photos into timeline sections like Google Photos
export interface PhotoDateGroup {
  dateKey: string;
  displayTitle: string;
  subtitle: string;
  files: CloudFile[];
}

export function groupPhotosByDate(files: CloudFile[]): PhotoDateGroup[] {
  // Only include images and videos
  const mediaFiles = files.filter((f) => {
    const cat = getFileCategory(f.mimeType, f.name);
    return cat === 'image' || cat === 'video';
  });

  // Sort descending by capturedAt or uploadedAt
  mediaFiles.sort((a, b) => {
    const timeA = new Date(a.capturedAt || a.uploadedAt).getTime();
    const timeB = new Date(b.capturedAt || b.uploadedAt).getTime();
    return timeB - timeA;
  });

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const groupsMap = new Map<string, CloudFile[]>();

  for (const file of mediaFiles) {
    const dateObj = new Date(file.capturedAt || file.uploadedAt);
    const dateKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    if (!groupsMap.has(dateKey)) {
      groupsMap.set(dateKey, []);
    }
    groupsMap.get(dateKey)!.push(file);
  }

  const result: PhotoDateGroup[] = [];

  for (const [dateKey, groupFiles] of groupsMap.entries()) {
    const dateObj = new Date(`${dateKey}T12:00:00Z`);
    let displayTitle = '';
    let subtitle = '';

    if (dateKey === todayStr) {
      displayTitle = 'Today';
      subtitle = dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    } else if (dateKey === yesterdayStr) {
      displayTitle = 'Yesterday';
      subtitle = dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    } else {
      displayTitle = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      subtitle = dateObj.toLocaleDateString(undefined, { year: 'numeric' });
    }

    result.push({
      dateKey,
      displayTitle,
      subtitle,
      files: groupFiles,
    });
  }

  return result;
}
