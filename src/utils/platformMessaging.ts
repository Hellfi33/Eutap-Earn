import { PlatformMessage } from '../types';

const LOCAL_MESSAGES_KEY = 'eutap_real_platform_messages_v4';

// Wipe any previous mockups and fake test contacts from storage
export function clearOldMockups(): void {
  try {
    localStorage.removeItem('eutap_direct_contacts_v3');
    localStorage.removeItem('eutap_global_messages_v2');
    localStorage.removeItem('eutap_mockup_contacts');
    localStorage.removeItem('eutap_chat_threads');
  } catch {}
}

// Immediately run cleanup of mockups on module load
clearOldMockups();

type MessageCallback = (msg: PlatformMessage) => void;
const messageListeners: Set<MessageCallback> = new Set();

let broadcastChannel: BroadcastChannel | null = null;
if (typeof BroadcastChannel !== 'undefined') {
  try {
    broadcastChannel = new BroadcastChannel('eutap_platform_real_channel');
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'NEW_MESSAGE') {
        const msg: PlatformMessage = event.data.message;
        saveLocalMessage(msg);
        messageListeners.forEach((listener) => listener(msg));
      }
    };
  } catch {}
}

export function getStoredLocalMessages(): PlatformMessage[] {
  try {
    const saved = localStorage.getItem(LOCAL_MESSAGES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Double check no mockup messages sneak through
        return parsed.filter(
          (m: PlatformMessage) =>
            m &&
            m.userId &&
            !['Nova_Tapper', 'ApexHunter', 'Elena_Tap', 'SolanaKing', 'Satoshi_Miner'].includes(m.username)
        );
      }
    }
  } catch {}
  return [];
}

export function saveLocalMessage(msg: PlatformMessage): void {
  try {
    const current = getStoredLocalMessages();
    if (current.some((m) => m.id === msg.id)) return;
    const updated = [...current, msg].slice(-150);
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updated));
  } catch {}
}

export function subscribeToPlatformMessages(callback: MessageCallback): () => void {
  messageListeners.add(callback);
  return () => {
    messageListeners.delete(callback);
  };
}

// Fetch messages from server API with local fallback
export async function fetchPlatformMessages(): Promise<PlatformMessage[]> {
  try {
    const res = await fetch('/api/messages');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        const filtered = data.messages.filter(
          (m: PlatformMessage) =>
            m &&
            m.userId &&
            !['Nova_Tapper', 'ApexHunter', 'Elena_Tap', 'SolanaKing', 'Satoshi_Miner'].includes(m.username)
        );
        try {
          localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(filtered.slice(-150)));
        } catch {}
        return filtered;
      }
    }
  } catch (e) {
    // Server route may be initializing or client is offline
  }
  return getStoredLocalMessages();
}

// Post a new message to the platform
export async function postPlatformMessage(messageData: {
  text: string;
  userId: string;
  username: string;
  userLevel: number;
  userStage: number;
  avatarColor: string;
  badge?: string;
}): Promise<PlatformMessage> {
  const localMsg: PlatformMessage = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    userId: messageData.userId,
    username: messageData.username,
    userLevel: messageData.userLevel,
    userStage: messageData.userStage,
    avatarColor: messageData.avatarColor,
    badge: messageData.badge,
    text: messageData.text.trim(),
    timestamp: Date.now(),
    isSelf: true,
  };

  saveLocalMessage(localMsg);

  // Broadcast to other tabs on same device
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'NEW_MESSAGE', message: localMsg });
    } catch {}
  }

  // Attempt server post
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.message) {
        return { ...data.message, isSelf: true };
      }
    }
  } catch (e) {
    // Handled locally
  }

  return localMsg;
}

// Connect to Server-Sent Events stream
export function initPlatformSSE(onNewMessage: (msg: PlatformMessage) => void): () => void {
  let eventSource: EventSource | null = null;
  let retryTimeout: any = null;
  let isClosed = false;

  function connect() {
    if (isClosed) return;
    try {
      eventSource = new EventSource('/api/messages/stream');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_MESSAGE' && data.message) {
            const msg: PlatformMessage = data.message;
            saveLocalMessage(msg);
            onNewMessage(msg);
            messageListeners.forEach((l) => l(msg));
          }
        } catch {}
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (!isClosed) {
          retryTimeout = setTimeout(connect, 5000);
        }
      };
    } catch (e) {
      if (!isClosed) {
        retryTimeout = setTimeout(connect, 5000);
      }
    }
  }

  connect();

  return () => {
    isClosed = true;
    if (retryTimeout) clearTimeout(retryTimeout);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}
