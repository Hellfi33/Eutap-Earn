import { useState, useEffect, useCallback, useRef } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: number;
  latencyMs: number | null;
  checkConnection: () => Promise<boolean>;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<number>(Date.now());
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const isMountedRef = useRef<boolean>(true);

  // Active probe to ensure real internet / server connectivity
  const checkConnection = useCallback(async (): Promise<boolean> => {
    // If browser itself reports offline, immediately declare offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (isMountedRef.current) {
        setIsOnline(false);
        setIsChecking(false);
        setLatencyMs(null);
        setLastChecked(Date.now());
      }
      return false;
    }

    if (isMountedRef.current) {
      setIsChecking(true);
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      // Ping our lightweight health endpoint with cache busting
      const response = await fetch(`/api/health?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const elapsed = Date.now() - startTime;
      const online = response.ok;

      if (isMountedRef.current) {
        setIsOnline(online);
        setIsChecking(false);
        setLastChecked(Date.now());
        setLatencyMs(online ? elapsed : null);
      }
      return online;
    } catch {
      clearTimeout(timeoutId);

      // In case /api/health had an issue, fallback probe to root / favicon to confirm general connectivity
      try {
        const fallbackController = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), 3000);
        const fbRes = await fetch(`/?ping=${Date.now()}`, {
          method: 'HEAD',
          cache: 'no-store',
          signal: fallbackController.signal,
        });
        clearTimeout(fallbackTimeout);

        const online = fbRes.ok || fbRes.status < 500;
        if (isMountedRef.current) {
          setIsOnline(online);
          setIsChecking(false);
          setLastChecked(Date.now());
          setLatencyMs(online ? Date.now() - startTime : null);
        }
        return online;
      } catch {
        if (isMountedRef.current) {
          setIsOnline(false);
          setIsChecking(false);
          setLastChecked(Date.now());
          setLatencyMs(null);
        }
        return false;
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const handleBrowserOnline = () => {
      // Re-verify with active probe
      checkConnection();
    };

    const handleBrowserOffline = () => {
      if (isMountedRef.current) {
        setIsOnline(false);
        setLatencyMs(null);
        setLastChecked(Date.now());
      }
    };

    window.addEventListener('online', handleBrowserOnline);
    window.addEventListener('offline', handleBrowserOffline);

    // Initial probe on mount
    checkConnection();

    // Periodic network heartbeat check every 12 seconds
    const interval = setInterval(() => {
      checkConnection();
    }, 12000);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('online', handleBrowserOnline);
      window.removeEventListener('offline', handleBrowserOffline);
      clearInterval(interval);
    };
  }, [checkConnection]);

  return {
    isOnline,
    isChecking,
    lastChecked,
    latencyMs,
    checkConnection,
  };
}
