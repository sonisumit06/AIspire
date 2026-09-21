import { animate, stagger } from 'animejs';
import type { JSAnimation, TargetsParam } from 'animejs';
import {
  EASE_LUXURY,
  SPRING_SUBTLE,
  SPRING_BOUNCE,
  isReducedMotion,
  animateCounterV4,
} from './motion';

/**
 * AIspire Animation Layer — Migrated to Anime.js v4.5.0
 * Provides backward-compatible, high-performance, accessible motion helpers.
 */

export interface EntranceOptions {
  delay?: number;
  stagger?: number;
  translateY?: number | [number, number];
  opacity?: [number, number];
  duration?: number;
  easing?: string;
}

/**
 * Animates elements entering the viewport with a fluid staggered reveal.
 */
export function animateEntrance(
  targets: TargetsParam,
  options: EntranceOptions = {}
): JSAnimation | null {
  if (!targets) return null;

  if (isReducedMotion()) {
    return animate(targets, {
      opacity: [1, 1],
      translateY: [0, 0],
      duration: 0,
    });
  }

  return animate(targets, {
    translateY: options.translateY ?? [16, 0],
    opacity: options.opacity ?? [0, 1],
    delay: options.stagger ? stagger(options.stagger, { start: options.delay ?? 0 }) : (options.delay ?? 0),
    duration: options.duration ?? 650,
    ease: EASE_LUXURY,
  });
}

/**
 * Animates a numeric counter smoothly from start to end (e.g., match score: 0% -> 94%).
 */
export function animateCounter(
  element: HTMLElement | null,
  endValue: number,
  options: { duration?: number; suffix?: string; round?: number } = {}
): JSAnimation | null {
  return animateCounterV4(element, endValue, options);
}

/**
 * Animates a progress bar smoothly to target width percentage.
 */
export function animateBarWidth(
  element: HTMLElement | null,
  targetPercent: number,
  duration = 800
): JSAnimation | null {
  if (!element) return null;

  if (isReducedMotion()) {
    element.style.width = `${Math.max(0, Math.min(100, targetPercent))}%`;
    return null;
  }

  return animate(element, {
    width: [`0%`, `${Math.max(0, Math.min(100, targetPercent))}%`],
    duration,
    ease: EASE_LUXURY,
  });
}

/**
 * Tactile pop feedback for buttons, checkboxes, and bookmarks.
 */
export function animatePop(targets: TargetsParam): JSAnimation | null {
  if (!targets || isReducedMotion()) return null;

  return animate(targets, {
    scale: [1, 1.12, 0.97, 1],
    duration: 320,
    ease: SPRING_SUBTLE,
  });
}

/**
 * Smooth horizontal slide transition between questions or views.
 */
export function animateSlideTransition(
  element: HTMLElement | null,
  direction: 'left' | 'right' = 'left',
  duration = 420
): JSAnimation | null {
  if (!element) return null;

  if (isReducedMotion()) {
    element.style.opacity = '1';
    element.style.transform = 'none';
    return null;
  }

  const startX = direction === 'left' ? 24 : -24;

  return animate(element, {
    translateX: [startX, 0],
    opacity: [0, 1],
    duration,
    ease: EASE_LUXURY,
  });
}

/**
 * Gentle breathing pulse for active milestone pills or floating buttons.
 */
export function animatePulse(targets: TargetsParam): JSAnimation | null {
  if (!targets || isReducedMotion()) return null;

  return animate(targets, {
    scale: [1, 1.04, 1],
    opacity: [0.88, 1, 0.88],
    duration: 2600,
    loop: true,
    ease: 'inOutSine',
  });
}

/**
 * Animated 3-dot sinusoidal wave for the AI thinking/streaming state.
 */
export function animateTypingWave(targets: TargetsParam): JSAnimation | null {
  if (!targets || isReducedMotion()) return null;

  return animate(targets, {
    translateY: [-4, 3],
    opacity: [0.35, 1],
    delay: stagger(120),
    duration: 480,
    alternate: true,
    loop: true,
    ease: 'inOutSine',
  });
}

/**
 * Fluid physical entrance for incoming chat message bubbles.
 */
export function animateMessageIn(targets: TargetsParam): JSAnimation | null {
  if (!targets) return null;

  if (isReducedMotion()) {
    return animate(targets, {
      opacity: [1, 1],
      translateY: [0, 0],
      duration: 0,
    });
  }

  return animate(targets, {
    translateY: [12, 0],
    opacity: [0, 1],
    scale: [0.98, 1],
    duration: 380,
    ease: EASE_LUXURY,
  });
}

/**
 * Staggered grid ripple reveal for AI prompt suggestion cards.
 */
export function animatePromptCards(targets: TargetsParam): JSAnimation | null {
  if (!targets) return null;

  if (isReducedMotion()) {
    return animate(targets, {
      opacity: [1, 1],
      translateY: [0, 0],
      duration: 0,
    });
  }

  return animate(targets, {
    translateY: [14, 0],
    scale: [0.96, 1],
    opacity: [0, 1],
    delay: stagger(60),
    duration: 480,
    ease: EASE_LUXURY,
  });
}

/**
 * Continuous subtle rotation for glowing AI emblems or background haloes.
 */
export function animateAuraSpin(targets: TargetsParam): JSAnimation | null {
  if (!targets || isReducedMotion()) return null;

  return animate(targets, {
    rotate: [0, 360],
    duration: 28000,
    loop: true,
    ease: 'linear',
  });
}

/**
 * Elastic tactile feedback when a user copies a response or prompts a chip.
 */
export function animateCopySuccess(targets: TargetsParam): JSAnimation | null {
  if (!targets || isReducedMotion()) return null;

  return animate(targets, {
    scale: [1, 1.2, 0.96, 1],
    duration: 340,
    ease: SPRING_BOUNCE,
  });
}
