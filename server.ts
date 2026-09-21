import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface PlatformMessage {
  id: string;
  userId: string;
  username: string;
  userLevel: number;
  userStage: number;
  avatarColor: string;
  badge?: string;
  text: string;
  timestamp: number;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent messages file
const MESSAGES_FILE = path.join(process.cwd(), 'messages_data.json');
let platformMessages: PlatformMessage[] = [];

try {
  if (fs.existsSync(MESSAGES_FILE)) {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      // Filter out any mockups that might have been saved before
      platformMessages = parsed.filter(
        (m: PlatformMessage) =>
          m &&
          m.text &&
          m.userId &&
          !['Satoshi_Miner', 'Elena_Tap', 'Nova_Tapper', 'ApexHunter', 'SolanaKing'].includes(m.username)
      );
    }
  }
} catch (e) {
  platformMessages = [];
}

function saveMessagesToFile() {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(platformMessages.slice(-250)), 'utf-8');
  } catch (e) {
    // Ignore error
  }
}

// Active SSE Connections
type SSEClient = {
  id: string;
  res: Response;
};
let sseClients: SSEClient[] = [];

// Periodic ping to keep SSE connections open through proxies
setInterval(() => {
  const pingPayload = `event: ping\ndata: ${Date.now()}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(pingPayload);
    } catch (e) {
      // Client closed
    }
  });
}, 20000);

// API Endpoints
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    time: Date.now(),
    clients: sseClients.length,
    messagesCount: platformMessages.length,
  });
});

app.get('/api/messages', (req: Request, res: Response) => {
  res.json({
    messages: platformMessages,
    timestamp: Date.now(),
  });
});

app.post('/api/messages', (req: Request, res: Response) => {
  const { text, userId, username, userLevel, userStage, avatarColor, badge } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Message text cannot be empty' });
  }

  const cleanText = text.trim().slice(0, 300);
  const cleanUserId = typeof userId === 'string' && userId.trim() ? userId.trim().slice(0, 20) : '#EU-PLAYER';
  const cleanUsername = typeof username === 'string' && username.trim() ? username.trim().slice(0, 25) : 'Player';

  const newMessage: PlatformMessage = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    userId: cleanUserId,
    username: cleanUsername,
    userLevel: typeof userLevel === 'number' ? userLevel : 1,
    userStage: typeof userStage === 'number' ? userStage : 1,
    avatarColor: avatarColor || 'from-cyan-500 to-blue-600',
    badge: badge || undefined,
    text: cleanText,
    timestamp: Date.now(),
  };

  platformMessages.push(newMessage);
  if (platformMessages.length > 300) {
    platformMessages = platformMessages.slice(-300);
  }
  saveMessagesToFile();

  // Broadcast to all active clients on the platform
  const payload = `data: ${JSON.stringify({ type: 'NEW_MESSAGE', message: newMessage })}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch (e) {}
  });

  return res.json({ success: true, message: newMessage });
});

// Real-time SSE Stream
app.get('/api/messages/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const clientId = 'client-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const client: SSEClient = { id: clientId, res };
  sseClients.push(client);

  // Send greeting event
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// Clear all messages (for administrative / cleanup purpose)
app.post('/api/messages/clear', (req: Request, res: Response) => {
  platformMessages = [];
  saveMessagesToFile();
  const payload = `data: ${JSON.stringify({ type: 'CLEAR_MESSAGES' })}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch (e) {}
  });
  res.json({ success: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
