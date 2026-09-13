import React, { useRef, useState, useCallback } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { recognizeAlphabetGesture, Point, RecognizedLetter } from '../utils/alphabetGesture';
import { soundFx } from '../utils/audio';

interface AlphabetGestureLayerProps {
  onReward: (letter: string, points: number) => void;
  canReward?: boolean;
  onTapMascot: (touchPoints: { clientX: number; clientY: number }[]) => void;
  energy: number;
  isPressingMascot: boolean;
  setIsPressingMascot: (val: boolean) => void;
  setTilt: (tilt: { x: number; y: number }) => void;
  children: React.ReactNode;
}

interface SecretRewardToast {
  id: string;
  letter: string;
  points: number;
  x: number;
  y: number;
}

export const AlphabetGestureLayer: React.FC<AlphabetGestureLayerProps> = ({
  onReward,
  canReward = true,
  onTapMascot,
  energy,
  setIsPressingMascot,
  setTilt,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Gesture state (invisible tracking)
  const isPointerDownRef = useRef(false);
  const isGesturingRef = useRef(false);
  const startedOnMascotRef = useRef(false);
  const startPosRef = useRef<Point>({ x: 0, y: 0 });
  const currentStrokeRef = useRef<Point[]>([]);
  const completedStrokesRef = useRef<Point[][]>([]);
  const gestureTimeoutRef = useRef<number | null>(null);

  // Floating secret reward discovery toasts
  const [activeToasts, setActiveToasts] = useState<SecretRewardToast[]>([]);

  // Clear gesture tracking
  const resetStrokes = useCallback(() => {
    completedStrokesRef.current = [];
    currentStrokeRef.current = [];
  }, []);

  // Process completed gesture strokes and recognize letter invisibly
  // If player has already used their 2x allocation in 24 hours, it locks off silently
  const evaluateGesture = useCallback(() => {
    const strokes = completedStrokesRef.current;
    if (strokes.length === 0) return;

    // Silent 24-hour lock off: after 2x rewards in 24h, gestures yield no rewards
    if (!canReward) {
      resetStrokes();
      return;
    }

    const result: RecognizedLetter | null = recognizeAlphabetGesture(strokes);

    if (result && result.points > 0) {
      // Secret gesture successfully recognized!
      soundFx.playReward();

      // Reward points calculation: Letter A = 100k, B = 200k, ... Z = 2.6M
      onReward(result.letter, result.points);

      // Create floating celebration notification badge at gesture center
      const toastId = `${Date.now()}-${Math.random()}`;
      const newToast: SecretRewardToast = {
        id: toastId,
        letter: result.letter,
        points: result.points,
        x: result.center.x,
        y: result.center.y,
      };

      setActiveToasts((prev) => [...prev, newToast]);

      // Remove toast after animation duration
      setTimeout(() => {
        setActiveToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 3000);
    }

    resetStrokes();
  }, [onReward, resetStrokes]);

  // Pointer / Touch Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If clicked on an interactive button, input, or balance boost hold trigger, let it handle directly
    const target = e.target as HTMLElement | null;
    const isInteractive =
      target?.closest('button') ||
      target?.closest('a') ||
      target?.closest('input') ||
      target?.closest('#user-coin-balance-container') ||
      target?.closest('.balance-hold-trigger');
    if (isInteractive) {
      return;
    }

    isPointerDownRef.current = true;
    isGesturingRef.current = false;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    startPosRef.current = { x, y };

    // Check if the touch started on the mascot container
    const isMascot = target?.closest('#tap-mascot-container');
    startedOnMascotRef.current = !!isMascot;

    if (startedOnMascotRef.current && energy > 0) {
      setIsPressingMascot(true);
      // Mascot tilt
      const mascotRect = target?.closest('#tap-mascot-container')?.getBoundingClientRect();
      if (mascotRect) {
        const mx = e.clientX - mascotRect.left;
        const my = e.clientY - mascotRect.top;
        const cx = mascotRect.width / 2;
        const cy = mascotRect.height / 2;
        const rx = Math.max(-12, Math.min(12, ((my - cy) / cy) * -12));
        const ry = Math.max(-12, Math.min(12, ((mx - cx) / cx) * 12));
        setTilt({ x: rx, y: ry });
      }
    }

    // Clear any pending gesture evaluation timer if drawing another stroke
    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current);
      gestureTimeoutRef.current = null;
    }

    currentStrokeRef.current = [{ x, y }];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const distFromStart = Math.hypot(x - startPosRef.current.x, y - startPosRef.current.y);

    // If movement exceeds threshold, this is a drawing gesture
    if (!isGesturingRef.current && distFromStart > 18) {
      isGesturingRef.current = true;
      // Revert mascot press state so regular taps don't waste energy while gesturing
      setIsPressingMascot(false);
      setTilt({ x: 0, y: 0 });
    }

    if (isGesturingRef.current) {
      // Record gesture points silently (invisible to player)
      currentStrokeRef.current.push({ x, y });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    if (isGesturingRef.current) {
      // Completed a stroke of an invisible gesture
      if (currentStrokeRef.current.length > 3) {
        completedStrokesRef.current.push([...currentStrokeRef.current]);
      }
      currentStrokeRef.current = [];
      isGesturingRef.current = false;

      // Allow 420ms for multi-stroke letters (like A, H, T, X, E) before evaluating
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
      }
      gestureTimeoutRef.current = window.setTimeout(() => {
        evaluateGesture();
      }, 420);
    } else {
      // Regular tap on mascot
      setIsPressingMascot(false);
      setTilt({ x: 0, y: 0 });

      if (startedOnMascotRef.current && energy > 0) {
        onTapMascot([{ clientX: e.clientX, clientY: e.clientY }]);
      }
      currentStrokeRef.current = [];
    }
  };

  const handlePointerCancel = () => {
    isPointerDownRef.current = false;
    isGesturingRef.current = false;
    setIsPressingMascot(false);
    setTilt({ x: 0, y: 0 });
    resetStrokes();
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className="relative w-full h-full flex flex-col items-center justify-between select-none overflow-hidden touch-none"
    >
      {/* Underlying Tap Exchange Content */}
      {children}

      {/* Secret Alphabet Gesture Discovery Floating Celebration Overlay (shown only upon recognition) */}
      {activeToasts.map((toast) => {
        const letterIndex = toast.letter.charCodeAt(0) - 64;
        const multiplierText = letterIndex > 1 ? `x${letterIndex}` : 'Base';

        return (
          <div
            key={toast.id}
            style={{
              left: Math.max(20, Math.min(window.innerWidth - 260, toast.x - 120)),
              top: Math.max(60, Math.min(window.innerHeight - 200, toast.y - 70)),
            }}
            className="fixed z-50 pointer-events-none animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-300 flex flex-col items-center"
          >
            {/* Glowing Aura Ring */}
            <div className="relative px-4 py-3 rounded-2xl bg-[#0e131d]/95 border-2 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.6)] backdrop-blur-md flex flex-col items-center text-center">
              {/* Header Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                <span>Secret ABCD Gesture</span>
                <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
              </div>

              {/* Letter Icon & Multiplier */}
              <div className="flex items-center gap-2 my-0.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-black font-black text-2xl font-['Rajdhani',sans-serif] shadow-lg border border-yellow-200">
                  {toast.letter}
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-slate-300">
                    Letter {toast.letter} ({multiplierText})
                  </div>
                  <div className="text-base sm:text-lg font-black text-amber-300 font-['Rajdhani',sans-serif] tracking-wide drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]">
                    +{toast.points.toLocaleString()} PTS
                  </div>
                </div>
              </div>

              {/* Instant Credit Subtext */}
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-1">
                <Zap className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                <span>Added directly to balance!</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
