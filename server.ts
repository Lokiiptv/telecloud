import express, { Request, Response } from 'express';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Configure multer for file handling in memory (limit 50MB, matching Telegram standard bot upload limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Server-side Gemini client initialization with mandatory telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ----------------------------------------------------
// SOURCE CODE ZIP DOWNLOAD
// ----------------------------------------------------
app.get('/api/download-zip', (_req: Request, res: Response) => {
  const zipPath = path.resolve('public/telecloud-source-code.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'telecloud-source-code.zip');
  } else {
    res.status(404).json({ error: 'Zip file not found' });
  }
});

// ----------------------------------------------------
// TELEGRAM STORAGE API PROXIES
// ----------------------------------------------------

// Verify bot token and fetch bot info
app.post('/api/telegram/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      res.status(400).json({ success: false, error: 'Bot token is required' });
      return;
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${token.trim()}/getMe`);
    const data = await tgRes.json();

    if (!data.ok) {
      res.status(400).json({ success: false, error: data.description || 'Invalid Telegram Bot Token' });
      return;
    }

    res.json({
      success: true,
      bot: {
        id: data.result.id,
        is_bot: data.result.is_bot,
        first_name: data.result.first_name,
        username: data.result.username,
        can_join_groups: data.result.can_join_groups,
        can_read_all_group_messages: data.result.can_read_all_group_messages,
      },
    });
  } catch (err: any) {
    console.error('Telegram verify error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to verify bot token' });
  }
});

// Auto-detect chat ID from recent messages / updates
app.post('/api/telegram/detect-chat', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, error: 'Token is required' });
      return;
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${token.trim()}/getUpdates?limit=50`);
    const data = await tgRes.json();

    if (!data.ok) {
      res.status(400).json({ success: false, error: data.description || 'Could not fetch updates' });
      return;
    }

    const candidates: Array<{
      id: number | string;
      title: string;
      type: string;
      username?: string;
      lastActive: number;
    }> = [];

    const seenIds = new Set<string>();

    for (const update of data.result || []) {
      const msg = update.message || update.channel_post || update.my_chat_member;
      const chat = msg?.chat;
      if (chat && !seenIds.has(String(chat.id))) {
        seenIds.add(String(chat.id));
        candidates.push({
          id: chat.id,
          title: chat.title || chat.first_name || (chat.username ? `@${chat.username}` : `Chat ${chat.id}`),
          type: chat.type,
          username: chat.username,
          lastActive: msg?.date || Date.now() / 1000,
        });
      }
    }

    res.json({
      success: true,
      chats: candidates,
    });
  } catch (err: any) {
    console.error('Telegram detect-chat error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to detect chats' });
  }
});

// Upload file directly into Telegram Storage
app.post('/api/telegram/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const token = req.body.token?.trim();
    const chatId = req.body.chatId?.trim();
    const caption = req.body.caption || '';
    const folderId = req.body.folderId || 'root';

    if (!token || !chatId) {
      res.status(400).json({ success: false, error: 'Token and Chat ID are required' });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    // Build standard multipart request to sendDocument
    const formData = new FormData();
    formData.append('chat_id', chatId);
    if (caption) {
      formData.append('caption', caption);
    }

    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
    formData.append('document', blob, file.originalname);

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: formData,
    });

    const data = await tgRes.json();

    if (!data.ok) {
      res.status(400).json({
        success: false,
        error: data.description || 'Telegram rejected document upload. Ensure your bot has permission to post in this chat.',
      });
      return;
    }

    const doc = data.result.document;
    const fileId = doc ? doc.file_id : data.result.message_id;

    res.json({
      success: true,
      file: {
        id: `tg_${data.result.message_id}_${Date.now()}`,
        name: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        telegramMessageId: data.result.message_id,
        telegramFileId: doc ? doc.file_id : null,
        telegramFileUniqueId: doc ? doc.file_unique_id : null,
        uploadedAt: new Date(data.result.date * 1000).toISOString(),
        folderId: folderId,
        caption: caption,
        storageProvider: 'telegram',
      },
    });
  } catch (err: any) {
    console.error('Telegram upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'Upload to Telegram failed' });
  }
});

// Resolve Telegram File ID to playable/downloadable file path
app.post('/api/telegram/get-file-url', async (req: Request, res: Response) => {
  try {
    const { token, fileId } = req.body;
    if (!token || !fileId) {
      res.status(400).json({ success: false, error: 'Token and fileId are required' });
      return;
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${token.trim()}/getFile?file_id=${fileId}`);
    const data = await tgRes.json();

    if (!data.ok) {
      res.status(400).json({ success: false, error: data.description || 'Failed to fetch Telegram file URL' });
      return;
    }

    const filePath = data.result.file_path;
    const streamUrl = `/api/telegram/stream?token=${encodeURIComponent(token.trim())}&filePath=${encodeURIComponent(filePath)}`;
    const directTelegramUrl = `https://api.telegram.org/file/bot${token.trim()}/${filePath}`;

    res.json({
      success: true,
      filePath,
      streamUrl,
      directTelegramUrl,
    });
  } catch (err: any) {
    console.error('Telegram get-file-url error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to get file URL' });
  }
});

// Stream file content directly to client (supports audio, video, image, PDF, docs)
app.get('/api/telegram/stream', async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    const filePath = req.query.filePath as string;
    const filename = (req.query.filename as string) || path.basename(filePath || 'download');

    if (!token || !filePath) {
      res.status(400).send('Missing token or filePath parameter');
      return;
    }

    const tgUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
    const tgRes = await fetch(tgUrl);

    if (!tgRes.ok || !tgRes.body) {
      res.status(tgRes.status).send(`Failed to stream file from Telegram (${tgRes.statusText})`);
      return;
    }

    // Pass through content-type and headers
    const contentType = tgRes.headers.get('content-type') || 'application/octet-stream';
    const contentLength = tgRes.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // Convert Web ReadableStream to Node stream
    const reader = tgRes.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          break;
        }
        res.write(value);
      }
    };
    await pump();
  } catch (err: any) {
    console.error('Telegram stream error:', err);
    if (!res.headersSent) {
      res.status(500).send(err.message || 'Stream error');
    }
  }
});

// Delete message/file from Telegram chat
app.post('/api/telegram/delete', async (req: Request, res: Response) => {
  try {
    const { token, chatId, messageId } = req.body;
    if (!token || !chatId || !messageId) {
      res.status(400).json({ success: false, error: 'Token, chatId, and messageId are required' });
      return;
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${token.trim()}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        message_id: messageId,
      }),
    });

    const data = await tgRes.json();
    res.json({ success: true, result: data });
  } catch (err: any) {
    console.error('Telegram delete error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to delete file from Telegram' });
  }
});

// ----------------------------------------------------
// GEMINI MULTI-TURN DRIVE CHATBOT API
// ----------------------------------------------------
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    if (!geminiApiKey) {
      res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is set in Secrets.',
      });
      return;
    }

    const { messages, modelChoice = 'gemini-3.8-flash', driveContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ success: false, error: 'Messages array is required' });
      return;
    }

    // Map model selection
    let selectedModel = 'gemini-3.8-flash';
    if (modelChoice === 'gemini-3.1-flash-lite') {
      selectedModel = 'gemini-3.1-flash-lite';
    } else if (modelChoice === 'gemini-3.5-flash' || modelChoice === 'gemini-3.1-pro-preview') {
      selectedModel = 'gemini-3.5-flash';
    }

    // System instruction defining the role and drive context
    const systemInstruction = `You are TeleCloud Copilot, an expert AI Cloud Drive Assistant embedded inside a Telegram-powered Cloud Drive application.
Your core mission is to help the user manage, organize, summarize, search, and analyze their cloud storage files backed by Telegram's unlimited cloud infrastructure.

CURRENT CLOUD DRIVE CONTEXT:
- Total Files: ${driveContext?.totalFiles ?? 0}
- Total Storage Used: ${driveContext?.totalSizeFormatted ?? '0 B'}
- Active Folders: ${driveContext?.folders?.map((f: any) => `"${f.name}" (${f.fileCount} files)`).join(', ') || 'Root only'}
- Storage Breakdown:
  • Documents: ${driveContext?.breakdown?.documents ?? 0}
  • Images & Photos: ${driveContext?.breakdown?.images ?? 0}
  • Videos & Media: ${driveContext?.breakdown?.videos ?? 0}
  • Audio & Music: ${driveContext?.breakdown?.audio ?? 0}
  • Archives & Code: ${driveContext?.breakdown?.archives ?? 0}
- Telegram Connection Status: ${driveContext?.connected ? `Connected to @${driveContext.botUsername}` : 'Demo / Standby Mode'}
- Recent/Indexed Files in Drive:
${
  driveContext?.files && driveContext.files.length > 0
    ? driveContext.files
        .slice(0, 30)
        .map(
          (f: any, idx: number) =>
            `  ${idx + 1}. "${f.name}" | Size: ${f.sizeFormatted} | Folder: ${f.folderName || 'Root'} | Type: ${f.mimeType} | Date: ${f.uploadedAt}`
        )
        .join('\n')
    : '  (No files currently stored)'
}

CAPABILITIES:
1. File Search & Discovery: Answer questions about files stored in the drive, identify files by extensions, keywords, or topics.
2. Organization Suggestions: Recommend logical folders, tagging systems, and cleanup routines.
3. Storage Insights: Explain how Telegram storage works (unlimited cloud messages, 50MB-2GB bot limits, privacy, channels as drives).
4. File Content Discussion: Help draft descriptions, captions, and summarize documents or code.
5. Markdown Formatting: Format responses clearly using markdown bolding, bullet points, and code blocks where helpful.
6. Tone: Friendly, efficient, technically sharp, and security-minded.`;

    // Format contents according to @google/genai guidelines
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text || '' }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    res.json({
      success: true,
      text: response.text || "I'm here to help manage your Telegram Cloud Drive.",
      modelUsed: selectedModel,
    });
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate response from Gemini AI',
    });
  }
});

// ----------------------------------------------------
// GEMINI AI ALBUMS & FACE CLUSTERING (Google Photos style)
// ----------------------------------------------------
app.post('/api/gemini/analyze-albums', async (req: Request, res: Response) => {
  try {
    if (!geminiApiKey) {
      res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is set in Secrets.',
      });
      return;
    }

    const { photos } = req.body;
    if (!Array.isArray(photos) || photos.length === 0) {
      res.status(400).json({ success: false, error: 'Photos array is required' });
      return;
    }

    const prompt = `You are the Google Photos & Telegram Cloud AI Vision Engine.
Analyze these ${photos.length} photos and videos.
Your task:
1. Automatically group photos into thematic albums based on visual content, metadata, captions, and tags (such as 'Vacation & Travel', 'Food & Dining', 'Pets & Animals', 'City & Architecture', 'Nature & Sunsets', 'Work & Tech').
2. Identify distinct People and Pets ("People & Pets" face clusters like Google Photos) appearing across the photos.

Photos Data:
${JSON.stringify(photos, null, 2)}

Return a JSON object containing:
- "thematicAlbums": Array of objects:
  • "id": string (e.g. "ai-vacation", "ai-food", "ai-pets")
  • "title": string (e.g. "Vacation & Escapes", "Food & Delights", "Pets & Companions")
  • "category": string ('vacation' | 'food' | 'pets' | 'nature' | 'city' | 'work' | 'other')
  • "description": string (short 1-line description of the theme)
  • "emoji": string (single emoji for badge, e.g. "🌴", "🥐", "🐾", "🏙️")
  • "coverPhotoId": string (must be one of the provided photo ids)
  • "photoIds": string[] (list of photo IDs that belong to this theme)
  • "confidence": number (between 0.85 and 0.99)
- "peopleClusters": Array of objects:
  • "id": string (e.g. "face-1", "face-2")
  • "suggestedName": string (e.g. "Sarah", "Alex", "Max (Pet)", "Unknown Person")
  • "type": "person" | "pet"
  • "avatarPhotoId": string (must be one of the provided photo ids)
  • "photoIds": string[] (list of photo IDs containing this person/pet)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      thematicAlbums: parsed.thematicAlbums || [],
      peopleClusters: parsed.peopleClusters || [],
    });
  } catch (err: any) {
    console.error('Gemini analyze-albums error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to auto-group albums with Gemini',
    });
  }
});

// ----------------------------------------------------
// FRONTEND SERVING (Vite in dev, dist in prod)
// ----------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[TeleCloud] Full-stack Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
