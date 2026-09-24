import { useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { refreshAppData } from '@/lib/appRefresh';

const THRESHOLD = 70;
const MAX_PULL = 110;
const MIN_SPIN_MS = 700;
const MAX_SPIN_MS = 8000;

function pageScrollTop(): number {
  return document.scrollingElement?.scrollTop ?? window.scrollY ?? 0;
}

/** Only start a pull when neither the page nor any scrollable box under the finger is scrolled down. */
function canStartPull(target: EventTarget | null): boolean {
  if (pageScrollTop() > 0) return false;
  let el = target instanceof HTMLElement ? target : null;
  while (el && el !== document.body) {
    if (el.dataset.noPullRefresh !== undefined || el.getAttribute('role') === 'dialog') return false;
    if (el.scrollTop > 0 && el.scrollHeight > el.clientHeight) {
      const overflowY = getComputedStyle(el).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') return false;
    }
    el = el.parentElement;
  }
  return true;
}

export function PullToRefresh() {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  useEffect(() => {
    let startY: number | null = null;
    let distance = 0;

    const reset = () => {
      startY = null;
      distance = 0;
      if (!refreshingRef.current) setPull(0);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (refreshingRef.current || event.touches.length !== 1 || !canStartPull(event.target)) {
        startY = null;
        return;
      }
      startY = event.touches[0].clientY;
      distance = 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (startY === null) return;
      const dy = event.touches[0].clientY - startY;
      if (dy <= 0 || pageScrollTop() > 0) {
        distance = 0;
        setPull(0);
        return;
      }
      distance = Math.min(MAX_PULL, dy * 0.5);
      setPull(distance);
    };

    const onTouchEnd = async () => {
      if (startY === null) return;
      const shouldRefresh = distance >= THRESHOLD;
      startY = null;
      distance = 0;
      if (!shouldRefresh) {
        setPull(0);
        return;
      }

      refreshingRef.current = true;
      setRefreshing(true);
      setPull(THRESHOLD);
      const started = Date.now();
      try {
        await Promise.race([
          refreshAppData(),
          new Promise((resolve) => window.setTimeout(resolve, MAX_SPIN_MS)),
        ]);
      } finally {
        const wait = Math.max(0, MIN_SPIN_MS - (Date.now() - started));
        window.setTimeout(() => {
          refreshingRef.current = false;
          setRefreshing(false);
          setPull(0);
        }, wait);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', reset);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', reset);
    };
  }, []);

  if (pull <= 0 && !refreshing) return null;

  const ready = pull >= THRESHOLD;
  const progress = Math.min(1, pull / THRESHOLD);
  const label = refreshing ? 'Refreshing…' : ready ? 'Release to refresh' : 'Pull to refresh';

  return (
    <div
      className="fixed left-0 right-0 z-[60] flex justify-center pointer-events-none"
      style={{ top: `calc(env(safe-area-inset-top, 0px) + ${Math.max(8, pull - 40)}px)` }}
      role="status"
      aria-live="polite"
      data-testid="pull-to-refresh"
    >
      <div
        className="flex items-center gap-2 rounded-full bg-[#ffffff] px-4 py-2 shadow-lg ring-1 ring-amber-200 text-sm font-semibold text-[#1f4aa6]"
        style={{ opacity: refreshing ? 1 : 0.4 + progress * 0.6 }}
      >
        {refreshing ? (
          <Loader2 className="w-4 h-4 animate-spin" color="#1f4aa6" />
        ) : (
          <RefreshCw
            className="w-4 h-4 transition-transform"
            color="#1f4aa6"
            style={{ transform: `rotate(${progress * 270}deg)` }}
          />
        )}
        <span className="text-[#1f4aa6]">{label}</span>
      </div>
    </div>
  );
}
