import {
  animate,
  createTimeline,
  stagger,
  spring,
  cubicBezier,
  splitText,
  createScope,
  createDrawable,
} from 'animejs';
import type { JSAnimation, Timeline } from 'animejs';

/**
 * AIspire Motion Architecture powered by Anime.js v4 (4.5.0)
 * 
 * Hierarchy:
 * - PRIMARY: Hero Choreography, Interactive 7D Radar, Top Career Reveals, Page Transitions
 * - SECONDARY: Viewport Section Reveals (IntersectionObserver), 3D Interactive Card Tilts, SVG Path Tracing
 * - TERTIARY: Spring Button Micro-Interactions, Hover Icon Translation, Copy/Audio Feedback
 */

/* ==============================================================================
   1. Accessibility & Easing System
   ============================================================================== */

export const isReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Custom cubic bezier easing curves (v4 function syntax)
export const EASE_LUXURY = cubicBezier(0.16, 1, 0.3, 1);
export const EASE_SNAPPY = cubicBezier(0.25, 1, 0.5, 1);
export const EASE_GENTLE = cubicBezier(0.33, 1, 0.68, 1);

// Physical spring instances
export const SPRING_SUBTLE = spring({ bounce: 0.15, duration: 380 });
export const SPRING_BOUNCE = spring({ bounce: 0.28, duration: 420 });

/* ==============================================================================
   2. PRIMARY: Hero Sequence & Split-Text Choreography
   ============================================================================== */

export interface HeroEntranceOptions {
  headingSelector?: string;
  badgeSelector?: string;
  subtitleSelector?: string;
  cardsSelector?: string;
  onComplete?: () => void;
}

/**
 * Orchestrated timeline for primary hero entrances.
 * Coordinates background glow, split-character typography cascade, subtitle reveal, and cards.
 */
export function animateHeroSequence(
  container: HTMLElement | null,
  options: HeroEntranceOptions = {}
): { timeline: Timeline | null; revert: () => void } {
  if (!container) return { timeline: null, revert: () => {} };

  if (isReducedMotion()) {
    // Reveal all immediately with zero transform
    const all = container.querySelectorAll('*');
    all.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
    return { timeline: null, revert: () => {} };
  }

  let textSplitter: ReturnType<typeof splitText> | null = null;
  const headingEl = options.headingSelector
    ? container.querySelector(options.headingSelector) as HTMLElement
    : container.querySelector('h1') as HTMLElement;

  if (headingEl) {
    try {
      textSplitter = splitText(headingEl, {
        words: true,
        chars: true,
        accessible: true,
      });
    } catch {
      // Fallback if splitText fails on non-standard DOM
      textSplitter = null;
    }
  }

  const tl = createTimeline({
    onComplete: options.onComplete,
  });

  // 1. Badge / pill entrance
  const badgeEl = options.badgeSelector
    ? container.querySelector(options.badgeSelector)
    : container.querySelector('.hero-badge');
  if (badgeEl) {
    tl.add(badgeEl, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 400,
      ease: EASE_LUXURY,
    }, 0);
  }

  // 2. Heading characters stagger
  if (textSplitter && textSplitter.chars && textSplitter.chars.length > 0) {
    tl.add(textSplitter.chars, {
      opacity: [0, 1],
      translateY: [18, 0],
      rotate: [-2, 0],
      scale: [0.94, 1],
      duration: 550,
      delay: stagger(18),
      ease: EASE_LUXURY,
    }, badgeEl ? 120 : 0);
  } else if (headingEl) {
    tl.add(headingEl, {
      opacity: [0, 1],
      translateY: [18, 0],
      duration: 600,
      ease: EASE_LUXURY,
    }, 50);
  }

  // 3. Subtitle / paragraph cascade
  const subtitleEl = options.subtitleSelector
    ? container.querySelector(options.subtitleSelector)
    : container.querySelector('p');
  if (subtitleEl) {
    tl.add(subtitleEl, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 500,
      ease: EASE_LUXURY,
    }, '-=300');
  }

  // 4. Hero cards / CTA buttons
  const cards = options.cardsSelector
    ? container.querySelectorAll(options.cardsSelector)
    : container.querySelectorAll('.hero-card, .hero-cta');
  if (cards.length > 0) {
    tl.add(cards, {
      opacity: [0, 1],
      translateY: [16, 0],
      scale: [0.97, 1],
      duration: 600,
      delay: stagger(60),
      ease: EASE_LUXURY,
    }, '-=250');
  }

  return {
    timeline: tl,
    revert: () => {
      tl.revert();
      if (textSplitter) {
        textSplitter.revert();
      }
    },
  };
}

/**
 * Split-text typography reveal with screen-reader accessibility preserved.
 */
export function animateTextSplit(
  element: HTMLElement | null,
  options: { staggerMs?: number; duration?: number; onComplete?: () => void } = {}
): { revert: () => void } {
  if (!element) return { revert: () => {} };

  if (isReducedMotion()) {
    element.style.opacity = '1';
    return { revert: () => {} };
  }

  try {
    const splitter = splitText(element, {
      words: true,
      chars: true,
      accessible: true,
    });

    const anim = animate(splitter.chars, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: options.duration ?? 500,
      delay: stagger(options.staggerMs ?? 20),
      ease: EASE_LUXURY,
      ...(options.onComplete ? { onComplete: options.onComplete } : {}),
    });

    return {
      revert: () => {
        anim.revert();
        splitter.revert();
      },
    };
  } catch {
    const anim = animate(element, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: options.duration ?? 500,
      ease: EASE_LUXURY,
      ...(options.onComplete ? { onComplete: options.onComplete } : {}),
    });
    return {
      revert: () => anim.revert(),
    };
  }
}

/* ==============================================================================
   3. SECONDARY: Scroll-Triggered Viewport Reveals & 3D Interactive Card Tilts
   ============================================================================== */

/**
 * Viewport IntersectionObserver that animates cards and sections once on scroll.
 */
export function observeScrollReveal(
  elements: NodeListOf<Element> | Element[] | HTMLElement,
  options: { staggerMs?: number; distance?: number; onReveal?: (el: Element) => void } = {}
): () => void {
  if (typeof window === 'undefined') return () => {};

  const targetList = elements instanceof HTMLElement
    ? [elements]
    : Array.from(elements);

  if (targetList.length === 0) return () => {};

  if (isReducedMotion()) {
    targetList.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
    return () => {};
  }

  // Hide initially
  targetList.forEach((el) => {
    if (el instanceof HTMLElement) {
      el.style.opacity = '0';
      el.style.transform = `translateY(${options.distance ?? 18}px)`;
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length === 0) return;

      visibleEntries.forEach((entry, idx) => {
        const target = entry.target as HTMLElement;
        observer.unobserve(target);

        animate(target, {
          opacity: [0, 1],
          translateY: [options.distance ?? 18, 0],
          duration: 600,
          delay: (idx * (options.staggerMs ?? 60)),
          ease: EASE_LUXURY,
          onComplete: () => {
            if (options.onReveal) options.onReveal(target);
          },
        });
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  targetList.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}

/**
 * 3D perspective tilt and dynamic cursor spotlight physics for interactive cards.
 * Automatically disabled on touch screens and reduced-motion environments.
 */
export function setupCard3DTilt(
  card: HTMLElement | null,
  options: { maxTilt?: number; spotlight?: boolean } = {}
): () => void {
  if (!card || isTouchDevice() || isReducedMotion()) return () => {};

  const maxTilt = options.maxTilt ?? 6; // Max rotation in degrees
  let rafId: number | null = null;

  const onPointerMove = (e: PointerEvent) => {
    if (rafId) cancelAnimationFrame(rafId);

    rafId = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Normalized coordinates: -1 to +1
      const normX = (x - centerX) / centerX;
      const normY = (y - centerY) / centerY;

      const tiltX = -normY * maxTilt;
      const tiltY = normX * maxTilt;

      card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-2px)`;

      if (options.spotlight !== false) {
        card.style.setProperty('--mouse-x', `${Math.round(x)}px`);
        card.style.setProperty('--mouse-y', `${Math.round(y)}px`);
      }
    });
  };

  const onPointerLeave = () => {
    if (rafId) cancelAnimationFrame(rafId);

    animate(card, {
      rotateX: 0,
      rotateY: 0,
      translateY: 0,
      duration: 400,
      ease: SPRING_SUBTLE,
      onComplete: () => {
        card.style.transform = '';
      },
    });
  };

  card.addEventListener('pointermove', onPointerMove, { passive: true });
  card.addEventListener('pointerleave', onPointerLeave, { passive: true });

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    card.removeEventListener('pointermove', onPointerMove);
    card.removeEventListener('pointerleave', onPointerLeave);
    card.style.transform = '';
  };
}

/* ==============================================================================
   4. TERTIARY: Micro-Interactions (Buttons, Badges, Icons)
   ============================================================================== */

/**
 * Tactile spring press feedback on buttons and interactive chips.
 */
export function animateButtonPress(button: HTMLElement | null): JSAnimation | null {
  if (!button || isReducedMotion()) return null;

  return animate(button, {
    scale: [1, 0.96, 1],
    duration: 320,
    ease: SPRING_SUBTLE,
  });
}

/**
 * Independent hover icon translation within buttons.
 */
export function animateButtonIconGlide(
  icon: HTMLElement | null,
  isEntering: boolean
): JSAnimation | null {
  if (!icon || isReducedMotion()) return null;

  return animate(icon, {
    translateX: isEntering ? 3 : 0,
    duration: 220,
    ease: EASE_SNAPPY,
  });
}

/* ==============================================================================
   5. Odometer Counter & Numerical Metric Interpolation
   ============================================================================== */

export function animateCounterV4(
  element: HTMLElement | null,
  endValue: number,
  options: { duration?: number; suffix?: string } = {}
): JSAnimation | null {
  if (!element) return null;

  const suffix = options.suffix ?? '%';
  if (isReducedMotion()) {
    element.textContent = `${Math.round(endValue)}${suffix}`;
    return null;
  }

  const obj = { val: 0 };

  return animate(obj, {
    val: endValue,
    duration: options.duration ?? 850,
    ease: 'outExpo',
    onUpdate: () => {
      if (element) {
        element.textContent = `${Math.round(obj.val)}${suffix}`;
      }
    },
  });
}

/* ==============================================================================
   6. SVG Path Tracing & Drawable Geometry
   ============================================================================== */

export function animateSvgDraw(
  pathElement: SVGGeometryElement | null,
  options: { duration?: number; delay?: number; onComplete?: () => void } = {}
): JSAnimation | null {
  if (!pathElement) return null;

  if (isReducedMotion()) {
    pathElement.style.strokeDashoffset = '0';
    return null;
  }

  try {
    const drawables = createDrawable(pathElement);
    return animate(drawables, {
      draw: [0, 1],
      duration: options.duration ?? 900,
      delay: options.delay ?? 0,
      ease: EASE_LUXURY,
      ...(options.onComplete ? { onComplete: options.onComplete } : {}),
    });
  } catch {
    // Standard stroke-dashoffset fallback
    const length = pathElement.getTotalLength ? pathElement.getTotalLength() : 100;
    pathElement.style.strokeDasharray = `${length}`;
    pathElement.style.strokeDashoffset = `${length}`;

    return animate(pathElement, {
      strokeDashoffset: [length, 0],
      duration: options.duration ?? 900,
      delay: options.delay ?? 0,
      ease: EASE_LUXURY,
      ...(options.onComplete ? { onComplete: options.onComplete } : {}),
    });
  }
}

/* ==============================================================================
   7. Smooth View Page Transitions
   ============================================================================== */

export function animatePageTransition(
  element: HTMLElement | null,
  onComplete?: () => void
): JSAnimation | null {
  if (!element) return null;

  if (isReducedMotion()) {
    element.style.opacity = '1';
    element.style.transform = 'none';
    if (onComplete) onComplete();
    return null;
  }

  return animate(element, {
    opacity: [0, 1],
    translateY: [12, 0],
    duration: 380,
    ease: EASE_LUXURY,
    ...(onComplete ? { onComplete } : {}),
  });
}

export { createScope };
