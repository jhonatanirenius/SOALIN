import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, MessageCircle, ChevronUp } from 'lucide-react';
import { AlinAvatar } from './AlinAvatar';
import { AlinProfile, Question } from '../../types';
import { getLevelInfo } from './AlinFamiliarityBadge';

interface AlinFloatingButtonProps {
  isOpen: boolean;
  isMinimized: boolean;
  onOpen: () => void;
  onRestore: () => void;
  questionContext?: Question | null;
  alinProfile: AlinProfile | null;
}

const STORAGE_KEY_X = 'alinPositionX';
const STORAGE_KEY_Y = 'alinPositionY';
const DRAG_THRESHOLD = 7; // pixels to distinguish click vs drag

export const AlinFloatingButton: React.FC<AlinFloatingButtonProps> = ({
  isOpen,
  isMinimized,
  onOpen,
  onRestore,
  questionContext,
  alinProfile,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  // Drag tracking refs (prevent re-renders during micro pointer movements before threshold)
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    elemX: number;
    elemY: number;
  } | null>(null);
  const hasMovedRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);

  // Helper to calculate default position (bottom-right above mobile nav)
  const getDefaultPosition = useCallback(() => {
    if (typeof window === 'undefined') return { x: 100, y: 100 };
    const w = containerRef.current?.offsetWidth || 190;
    const h = containerRef.current?.offsetHeight || 60;
    const isMobile = window.innerWidth < 768;
    const paddingRight = 24;
    const paddingBottom = isMobile ? 80 : 24;

    const x = Math.max(12, window.innerWidth - w - paddingRight);
    const y = Math.max(12, window.innerHeight - h - paddingBottom);
    return { x, y };
  }, []);

  // Initialize position from localStorage or default
  useEffect(() => {
    try {
      const savedX = localStorage.getItem(STORAGE_KEY_X);
      const savedY = localStorage.getItem(STORAGE_KEY_Y);

      if (savedX !== null && savedY !== null) {
        const parsedX = parseFloat(savedX);
        const parsedY = parseFloat(savedY);

        if (!isNaN(parsedX) && !isNaN(parsedY)) {
          const w = containerRef.current?.offsetWidth || 190;
          const h = containerRef.current?.offsetHeight || 60;
          const maxX = Math.max(0, window.innerWidth - w);
          const maxY = Math.max(0, window.innerHeight - h);

          setPosition({
            x: Math.max(0, Math.min(parsedX, maxX)),
            y: Math.max(0, Math.min(parsedY, maxY)),
          });
          return;
        }
      }
    } catch {
      // localStorage may fail in private mode
    }

    setPosition(getDefaultPosition());
  }, [getDefaultPosition]);

  // Adjust boundaries when window is resized or rotated
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        const w = containerRef.current?.offsetWidth || 190;
        const h = containerRef.current?.offsetHeight || 60;
        const maxX = Math.max(0, window.innerWidth - w);
        const maxY = Math.max(0, window.innerHeight - h);
        return {
          x: Math.max(0, Math.min(prev.x, maxX)),
          y: Math.max(0, Math.min(prev.y, maxY)),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Pointer event handlers for cross-platform Drag & Move
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with primary pointer (left click or single touch)
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const currentPos = position || getDefaultPosition();
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      elemX: currentPos.x,
      elemY: currentPos.y,
    };
    hasMovedRef.current = false;
    isDraggingRef.current = false;

    // Capture pointer events so dragging outside the button continues smoothly
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;
    const dist = Math.hypot(dx, dy);

    // If movement is larger than threshold, engage drag mode
    if (dist > DRAG_THRESHOLD) {
      hasMovedRef.current = true;
      isDraggingRef.current = true;

      const w = containerRef.current?.offsetWidth || 190;
      const h = containerRef.current?.offsetHeight || 60;
      const maxX = Math.max(0, window.innerWidth - w);
      const maxY = Math.max(0, window.innerHeight - h);

      const targetX = Math.max(0, Math.min(dragStartRef.current.elemX + dx, maxX));
      const targetY = Math.max(0, Math.min(dragStartRef.current.elemY + dy, maxY));

      setPosition({ x: targetX, y: targetY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const moved = hasMovedRef.current;
    dragStartRef.current = null;
    isDraggingRef.current = false;

    if (moved && position) {
      // Save last position to localStorage
      try {
        localStorage.setItem(STORAGE_KEY_X, String(position.x));
        localStorage.setItem(STORAGE_KEY_Y, String(position.y));
      } catch {}
    } else {
      // Click / Tap occurred: trigger open/restore action
      if (isMinimized) {
        onRestore();
      } else {
        onOpen();
      }
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      dragStartRef.current = null;
      isDraggingRef.current = false;
    }
  };

  // If window is open and not minimized, do not render button
  if (isOpen && !isMinimized) return null;

  const level = alinProfile?.familiarity_level || 0;
  const levelInfo = getLevelInfo(level);

  // Position styles: inline pixel placement clamped to viewport
  const positionStyle: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
      }
    : {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        touchAction: 'none',
      };

  // If in minimized pill mode:
  if (isMinimized) {
    return (
      <div
        ref={containerRef}
        id="alin-minimized-draggable-pill"
        style={positionStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="z-40 select-none cursor-grab active:cursor-grabbing animate-in slide-in-from-bottom-5 duration-300"
      >
        <button
          type="button"
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-400 dark:border-indigo-600 shadow-xl hover:shadow-2xl hover:scale-105 transition-transform text-slate-800 dark:text-slate-100 group pointer-events-none"
          title="Tahan & geser untuk memindahkan, atau ketuk untuk buka kembali ALIN"
        >
          <AlinAvatar size="xs" expression="happy" showBadge={false} />
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className="tracking-tight text-indigo-600 dark:text-indigo-400">ALIN</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300">
              Lv.{level}
            </span>
          </div>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </button>
      </div>
    );
  }

  // Standard Floating Button (100% same visual design, now Draggable with Pointer Events)
  return (
    <div
      ref={containerRef}
      id="alin-draggable-floating-button"
      style={positionStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className="z-40 select-none cursor-grab active:cursor-grabbing"
    >
      <div
        className="group relative flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-xl hover:shadow-2xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-shadow duration-300"
        title="Tahan & geser untuk memindahkan ALIN ke posisi mana pun di layar"
      >
        {/* Subtle breathing glow */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${levelInfo.color} opacity-20 blur-md group-hover:opacity-40 transition-opacity pointer-events-none`}
        />

        {/* Chibi Avatar with Online dot */}
        <div className="relative pointer-events-none">
          <AlinAvatar
            size="md"
            expression={questionContext ? 'excited' : 'happy'}
            showBadge={true}
          />
          {/* Online green indicator badge */}
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs" />
        </div>

        {/* Label and Subtitle */}
        <div className="text-left pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              ALIN
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              Lv.{level}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            {questionContext ? (
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                <span>Bahas Soal Ini</span>
              </span>
            ) : (
              <span>Teman Belajar</span>
            )}
          </div>
        </div>

        {/* Notification indicator if question context is active */}
        {questionContext && (
          <span className="absolute -top-1.5 -right-1 flex h-3 w-3 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600" />
          </span>
        )}
      </div>
    </div>
  );
};
