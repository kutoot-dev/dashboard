import { useCallback, useEffect, useRef, useState } from "react";

const SCROLL_BOTTOM_THRESHOLD_PX = 40;

function isScrolledToBottom(el: HTMLElement): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_BOTTOM_THRESHOLD_PX;
}

/**
 * Tracks whether a scroll container has been scrolled to the bottom.
 * Auto-enables when content fits without overflow (no scroll event fires).
 */
export function useScrollToBottom(active: boolean, contentKey?: string | number | null) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active) {
      setScrolledToBottom(false);
    }
  }, [active, contentKey]);

  const checkScrollPosition = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    if (isScrolledToBottom(el)) {
      setScrolledToBottom(true);
    }
  }, []);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      checkScrollPosition(e.currentTarget);
    },
    [checkScrollPosition],
  );

  useEffect(() => {
    if (!active) return;
    const el = scrollRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => checkScrollPosition(el));
    return () => cancelAnimationFrame(raf);
  }, [active, contentKey, checkScrollPosition]);

  useEffect(() => {
    if (!active) return;
    const onResize = () => checkScrollPosition(scrollRef.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, checkScrollPosition]);

  useEffect(() => {
    if (!active) return;
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => checkScrollPosition(el));
    observer.observe(el);
    for (const child of el.children) {
      observer.observe(child);
    }
    return () => observer.disconnect();
  }, [active, contentKey, checkScrollPosition]);

  return { scrolledToBottom, scrollRef, handleScroll };
}
