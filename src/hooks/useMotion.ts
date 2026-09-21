import { useEffect, useState, useRef, useCallback } from 'react';
import {
  isReducedMotion,
  isTouchDevice,
  setupCard3DTilt,
  observeScrollReveal,
  animateButtonPress,
  animateButtonIconGlide,
  createScope,
} from '../utils/motion';

/**
 * React hook to reactively track user's prefers-reduced-motion preference.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => isReducedMotion());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => {
      setReduced(e.matches);
    };

    setReduced(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * React hook to bind 3D perspective mouse tilt with spring reset on pointer leave.
 * Automatically disables on touch screens and reduced motion.
 */
export function useCardTilt<T extends HTMLElement = HTMLDivElement>(
  options: { maxTilt?: number; spotlight?: boolean } = {}
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isTouchDevice() || isReducedMotion()) return;

    const cleanup = setupCard3DTilt(el, options);
    return cleanup;
  }, [options.maxTilt, options.spotlight]);

  return ref;
}

/**
 * React hook to observe elements entering the viewport and trigger Anime.js reveals.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: {
    staggerMs?: number;
    distance?: number;
    selector?: string;
  } = {}
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const targets = options.selector
      ? container.querySelectorAll(options.selector)
      : [container];

    const cleanup = observeScrollReveal(targets, {
      staggerMs: options.staggerMs ?? 60,
      distance: options.distance ?? 18,
    });

    return cleanup;
  }, [options.staggerMs, options.distance, options.selector]);

  return ref;
}

/**
 * React hook creating an isolated Anime.js v4 scope that automatically reverts on unmount.
 */
export function useAnimeScope<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = useRef<T | null>(null);
  const scopeRef = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      scopeRef.current = createScope({ root: containerRef.current });
    }

    return () => {
      if (scopeRef.current) {
        scopeRef.current.revert();
        scopeRef.current = null;
      }
    };
  }, []);

  return { containerRef, scope: scopeRef };
}

/**
 * Micro-interaction helper callbacks for buttons.
 */
export function useButtonMotion() {
  const handlePress = useCallback((e: React.MouseEvent<HTMLElement>) => {
    animateButtonPress(e.currentTarget);
  }, []);

  const handleIconEnter = useCallback((iconEl: HTMLElement | null) => {
    if (iconEl) animateButtonIconGlide(iconEl, true);
  }, []);

  const handleIconLeave = useCallback((iconEl: HTMLElement | null) => {
    if (iconEl) animateButtonIconGlide(iconEl, false);
  }, []);

  return { handlePress, handleIconEnter, handleIconLeave };
}

