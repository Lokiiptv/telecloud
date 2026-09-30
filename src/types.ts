export interface CloudFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  folderId: string;
  uploadedAt: string;
  capturedAt?: string;
  telegramMessageId?: number;
  telegramFileId?: string;
  telegramFileUniqueId?: string;
  caption?: string;
  tags?: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  storageProvider: 'telegram' | 'demo';
  localPreviewUrl?: string; // used for demo or cached uploads
  dimensions?: { width: number; height: number };
  duration?: number; // duration in seconds for video
  album?: string;
  deviceSource?: 'Camera' | 'Screenshots' | 'WhatsApp' | 'Downloads' | 'Web';
  backupStatus?: 'synced' | 'backing_up' | 'queued' | 'failed';
}

export interface AutoBackupConfig {
  enabled: boolean;
  quality: 'original' | 'saver';
  backupVideos: boolean;
  backupOnWifiOnly: boolean;
  monitoredSources: Array<'Camera' | 'Screenshots' | 'WhatsApp' | 'Downloads'>;
  lastSyncTime?: string;
  autoTagWithAi: boolean;
  isSimulatingLiveBackup?: boolean;
}

export interface AIThematicAlbum {
  id: string;
  title: string;
  category: 'vacation' | 'food' | 'pets' | 'nature' | 'city' | 'work' | 'other';
  description: string;
  coverPhotoId?: string;
  coverUrl?: string;
  photoIds: string[];
  emoji?: string;
  confidence?: number;
}

export interface PersonFaceCluster {
  id: string;
  name: string;
  suggestedName?: string;
  type: 'person' | 'pet';
  avatarPhotoId?: string;
  avatarUrl?: string;
  photoIds: string[];
  isNamed: boolean;
}

export interface PhotoAlbum {
  id: string;
  title: string;
  coverUrl?: string;
  count: number;
  type?: 'system' | 'custom' | 'ai_thematic' | 'face';
}

export interface CloudFolder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
  icon?: string;
  createdAt: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  chatTitle?: string;
  botUsername?: string;
  botName?: string;
  isConnected: boolean;
  autoSync: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

