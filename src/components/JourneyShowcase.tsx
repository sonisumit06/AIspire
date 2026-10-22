import React, { useEffect, useMemo, useRef } from 'react';
import type { RoadmapStep } from '../types';

/* ------------------------------------------------------------------ */
/*  Geometry                                                           */
/* ------------------------------------------------------------------ */

type Pt = { x: number; y: number };

const W = 1024;
const H = 560;
const ROAD_W = 84;
const LANE_OFFSET = 19;

// Centre-line of the road (enters bottom-left, loops, exits top-right)
const CONTROL: Pt[] = [
  [-70, 590],
  [20, 535],
  [120, 478],
  [205, 425],
  [238, 352],
  [226, 278],
  [262, 218],
  [335, 208],
  [425, 268],
  [510, 322],
  [590, 354],
  [665, 346],
  [702, 298],
  [676, 232],
  [616, 188],
  [592, 140],
  [622, 98],
  [700, 96],
  [790, 124],
  [880, 98],
  [948, 50],
  [1012, -6],
  [1070, -44],
].map(([x, y]) => ({ x, y }));

function buildRoad() {
  const c = CONTROL;
  const pts: Pt[] = [];

  for (let i = 0; i < c.length - 1; i++) {
    const p0 = c[Math.max(0, i - 1)];
    const p1 = c[i];
    const p2 = c[i + 1];
    const p3 = c[Math.min(c.length - 1, i + 2)];
    const steps = Math.max(8, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / 3));

    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      pts.push({
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  pts.push(c[c.length - 1]);

  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }

  const inside = (p: Pt) => p.x >= 0 && p.x <= W && p.y >= 0 && p.y <= H;
  let first = 0;
  while (first < pts.length - 1 && !inside(pts[first])) first++;
  let last = pts.length - 1;
  while (last > 0 && !inside(pts[last])) last--;

  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  return { pts, cum, d, visStart: cum[first], visEnd: cum[last] };
}

const ROAD = buildRoad();

function sampleAt(length: number) {
  const { pts, cum } = ROAD;
  const s = Math.min(Math.max(length, 0), cum[cum.length - 1]);
  let lo = 0;
  let hi = cum.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= s) lo = mid;
    else hi = mid;
  }
  const segLen = cum[hi] - cum[lo] || 1;
  const f = (s - cum[lo]) / segLen;
  const x = pts[lo].x + (pts[hi].x - pts[lo].x) * f;
  const y = pts[lo].y + (pts[hi].y - pts[lo].y) * f;

  const a = pts[Math.max(0, lo - 4)];
  const b = pts[Math.min(pts.length - 1, hi + 4)];
  const tx = b.x - a.x;
  const ty = b.y - a.y;
  const len = Math.hypot(tx, ty) || 1;
  return { x, y, tx: tx / len, ty: ty / len };
}

function distToRoad(x: number, y: number) {
  let best = Infinity;
  const { pts } = ROAD;
  for (let i = 0; i < pts.length; i += 2) {
    const dx = pts[i].x - x;
    const dy = pts[i].y - y;
    const d = dx * dx + dy * dy;
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}

/* ------------------------------------------------------------------ */
/*  Scenery (generated once, deterministic)                            */
/* ------------------------------------------------------------------ */

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TONES: [string, string, string][] = [
  ['#a9e27c', '#5aa23c', '#2f6e2b'],
  ['#9ad46d', '#4e9137', '#2a6226'],
  ['#c6d86c', '#82a03b', '#4d6a28'],
  ['#86c765', '#3f8a3b', '#235a2a'],
  ['#b7e38c', '#6aaa45', '#38752e'],
];

interface Lobe {
  dx: number;
  dy: number;
  r: number;
}

type Plant =
  | { kind: 'bush'; x: number; y: number; r: number; tone: number; lobes: Lobe[] }
  | { kind: 'spruce'; x: number; y: number; s: number }
  | { kind: 'maple'; x: number; y: number; outer: string; inner: string };

const FLOWER_COLORS = ['#ffffff', '#f4e64a', '#86b7f2', '#f08cb0', '#f2933f'];

function buildScene() {
  const rnd = rng(20261020);
  const plants: Plant[] = [];
  const placed: { x: number; y: number; r: number }[] = [];

  const tryPlace = (x: number, y: number, r: number) => {
    if (distToRoad(x, y) < ROAD_W / 2 + r * 0.85 + 4) return false;
    for (const p of placed) {
      if (Math.hypot(p.x - x, p.y - y) < (r + p.r) * 0.55) return false;
    }
    placed.push({ x, y, r });
    return true;
  };

  const mapleShape = (R: number) => {
    const n = 16;
    const out: string[] = [];
    const inner: string[] = [];
    for (let i = 0; i < n * 2; i++) {
      const ang = (i * Math.PI) / n + rnd() * 0.08;
      const rad = (i % 2 === 0 ? R : R * 0.55) * (0.9 + rnd() * 0.2);
      out.push(`${(Math.cos(ang) * rad).toFixed(1)},${(Math.sin(ang) * rad).toFixed(1)}`);
      inner.push(`${(Math.cos(ang) * rad * 0.62).toFixed(1)},${(Math.sin(ang) * rad * 0.62).toFixed(1)}`);
    }
    return { outer: out.join(' '), inner: inner.join(' ') };
  };

  // Two red maples, as in the reference
  [
    { x: 808, y: 333, R: 27 },
    { x: 740, y: 503, R: 30 },
  ].forEach(({ x, y, R }) => {
    placed.push({ x, y, r: R });
    const shape = mapleShape(R);
    plants.push({ kind: 'maple', x, y, ...shape });
  });

  for (let i = 0; i < 3200 && plants.length < 340; i++) {
    const x = rnd() * (W + 20) - 10;
    const y = rnd() * (H + 20) - 10;
    const k = rnd();

    if (k < 0.62 || k >= 0.8) {
      const r = k >= 0.8 ? 7 + rnd() * 8 : 13 + Math.pow(rnd(), 1.4) * 24;
      if (!tryPlace(x, y, r)) continue;
      const n = 5 + Math.floor(rnd() * 3);
      const lobes: Lobe[] = [{ dx: 0, dy: 0, r: r * 0.62 }];
      const off = rnd() * Math.PI * 2;
      for (let j = 0; j < n; j++) {
        const a = off + (j * Math.PI * 2) / n + rnd() * 0.4;
        lobes.push({ dx: Math.cos(a) * r * 0.5, dy: Math.sin(a) * r * 0.5, r: r * (0.45 + rnd() * 0.2) });
      }
      plants.push({ kind: 'bush', x, y, r, tone: Math.floor(rnd() * TONES.length), lobes });
    } else {
      const s = 0.7 + rnd() * 0.45;
      if (!tryPlace(x, y - 24 * s, 22 * s)) continue;
      plants.push({ kind: 'spruce', x, y, s });
    }
  }
  plants.sort((a, b) => a.y - b.y);

  // Grass blades
  const blades = { light: '', mid: '', dark: '' };
  for (let i = 0; i < 1100; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    if (distToRoad(x, y) < ROAD_W / 2 + 3) continue;
    const h = 4 + rnd() * 5;
    const lean = (rnd() - 0.5) * 5;
    const seg = `M${x.toFixed(1)} ${y.toFixed(1)}q${(lean * 0.4).toFixed(1)} ${(-h * 0.6).toFixed(1)} ${lean.toFixed(1)} ${(-h).toFixed(1)}`;
    const c = rnd();
    if (c < 0.45) blades.light += seg;
    else if (c < 0.8) blades.mid += seg;
    else blades.dark += seg;
  }

  // Wild flowers in clusters
  const flowers: string[] = FLOWER_COLORS.map(() => '');
  for (let i = 0; i < 120; i++) {
    const cx = rnd() * W;
    const cy = rnd() * H;
    const n = 4 + Math.floor(rnd() * 6);
    for (let j = 0; j < n; j++) {
      const x = cx + (rnd() - 0.5) * 28;
      const y = cy + (rnd() - 0.5) * 24;
      if (distToRoad(x, y) < ROAD_W / 2 + 4) continue;
      const r = 1.1 + rnd() * 1;
      const ci = Math.floor(rnd() * FLOWER_COLORS.length);
      flowers[ci] += `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(2 * r).toFixed(1)} 0a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(-2 * r).toFixed(1)} 0`;
    }
  }

  // Soft mottling on the grass
  const blobs = Array.from({ length: 46 }).map(() => ({
    x: rnd() * W,
    y: rnd() * H,
    rx: 30 + rnd() * 60,
    ry: 20 + rnd() * 40,
    light: rnd() > 0.5,
  }));

  return { plants, blades, flowers, blobs };
}

const SCENE = buildScene();

const Scenery = React.memo(function Scenery() {
  const { blades, flowers, blobs } = SCENE;
  return (
    <g>
      <rect width={W} height={H} fill="#4b8c36" />
      {blobs.map((b, i) => (
        <ellipse key={i} cx={b.x} cy={b.y} rx={b.rx} ry={b.ry} fill={b.light ? '#74b24c' : '#336c2a'} opacity={0.22} />
      ))}
      <g fill="none" strokeLinecap="round" strokeWidth={1}>
        <path d={blades.dark} stroke="#2c6f29" opacity={0.8} />
        <path d={blades.mid} stroke="#6fb84c" opacity={0.85} />
        <path d={blades.light} stroke="#a6e878" opacity={0.85} />
      </g>
      {flowers.map((d, i) => (
        <path key={i} d={d} fill={FLOWER_COLORS[i]} opacity={0.95} />
      ))}
    </g>
  );
});

const Plants = React.memo(function Plants() {
  return (
    <g>
      {SCENE.plants.map((p, i) => {
        if (p.kind === 'bush') {
          return (
            <g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>
              <ellipse cx={p.r * 0.12} cy={p.r * 0.22} rx={p.r * 1.05} ry={p.r * 0.95} fill="rgba(5,35,10,0.3)" />
              {p.lobes.map((l, j) => (
                <circle key={j} cx={l.dx} cy={l.dy} r={l.r} fill={`url(#bush-${p.tone})`} />
              ))}
            </g>
          );
        }
        if (p.kind === 'spruce') {
          return (
            <g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${p.s.toFixed(2)})`}>
              <ellipse cx={7} cy={2} rx={19} ry={6} fill="rgba(0,0,0,0.28)" />
              <rect x={-2} y={-4} width={4} height={8} fill="#4a2f1f" />
              <polygon points="-21,0 21,0 0,-30" fill="#1f5a3c" />
              <polygon points="-16,-18 16,-18 0,-46" fill="#266b46" />
              <polygon points="-11,-36 11,-36 0,-64" fill="#2f7d52" />
              <polygon points="0,-64 -11,-36 0,-36" fill="rgba(255,255,255,0.14)" />
              <polygon points="0,-46 -16,-18 0,-18" fill="rgba(255,255,255,0.1)" />
              <polygon points="0,-30 -21,0 0,0" fill="rgba(255,255,255,0.08)" />
            </g>
          );
        }
        return (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <polygon points={p.outer} fill="#cf231d" stroke="#8c1512" strokeWidth={1} transform="translate(2 3)" opacity={0.35} />
            <polygon points={p.outer} fill="#d3251f" stroke="#8c1512" strokeWidth={1} strokeLinejoin="round" />
            <polygon points={p.inner} fill="#ee4a3a" opacity={0.85} />
          </g>
        );
      })}
    </g>
  );
});

/* ------------------------------------------------------------------ */
/*  Car                                                                */
/* ------------------------------------------------------------------ */

const Car: React.FC = () => (
  <g>
    {/* shadow */}
    <rect x={-37} y={-15} width={82} height={42} rx={13} fill="#000" opacity={0.35} filter="url(#car-blur)" />
    {/* wheels */}
    {[-25, 25].map((wx) =>
      [-21, 21].map((wy) => (
        <rect key={`${wx}${wy}`} x={wx - 7} y={wy - 3.5} width={14} height={7} rx={2.5} fill="#111" />
      )),
    )}
    {/* body */}
    <path
      d="M-40 -12 Q-40 -19 -31 -19 L27 -19 Q41 -17 42 -8 L42 8 Q41 17 27 19 L-31 19 Q-40 19 -40 12 Z"
      fill="url(#car-body)"
      stroke="#6e0b0f"
      strokeWidth={1}
    />
    {/* hood + trunk shine */}
    <path d="M20 -15 L38 -9 L38 9 L20 15 Z" fill="#ff5a5a" opacity={0.22} />
    <path d="M-36 -14 L-30 -14 L-30 14 L-36 14 Z" fill="#000" opacity={0.12} />
    {/* windshield */}
    <path d="M7 -15 L21 -12.5 L21 12.5 L7 15 Z" fill="#cfe3ea" stroke="#5a0a0d" strokeWidth={0.8} opacity={0.92} />
    {/* roof */}
    <rect x={-23} y={-14} width={30} height={28} rx={5} fill="#b9141a" stroke="#6e0b0f" strokeWidth={0.8} />
    <rect x={-20} y={-11} width={22} height={9} rx={4} fill="#ffffff" opacity={0.14} />
    {/* rear window */}
    <path d="M-23 -13 L-31 -10.5 L-31 10.5 L-23 13 Z" fill="#a9c1c9" stroke="#5a0a0d" strokeWidth={0.8} opacity={0.9} />
    {/* mirrors */}
    <rect x={8} y={-23} width={6} height={4} rx={1.5} fill="#a8131a" />
    <rect x={8} y={19} width={6} height={4} rx={1.5} fill="#a8131a" />
    {/* lights */}
    <rect x={39} y={-14} width={4} height={6} rx={1.5} fill="#fff6c2" />
    <rect x={39} y={8} width={4} height={6} rx={1.5} fill="#fff6c2" />
    <rect x={-42} y={-14} width={3} height={6} rx={1} fill="#ff2b2b" />
    <rect x={-42} y={8} width={3} height={6} rx={1} fill="#ff2b2b" />
  </g>
);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface JourneyShowcaseProps {
  steps: RoadmapStep[];
  activeIndex: number;
  completed: number[];
  onSelect: (index: number) => void;
}

export const JourneyShowcase: React.FC<JourneyShowcaseProps> = ({
  steps,
  activeIndex,
  completed,
  onSelect,
}) => {
  const carRef = useRef<SVGGElement>(null);
  const progressRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  const pinLengths = useMemo(() => {
    const n = Math.max(steps.length, 2);
    return steps.map(
      (_, i) => ROAD.visStart + (ROAD.visEnd - ROAD.visStart) * (0.07 + (0.86 * i) / (n - 1)),
    );
  }, [steps]);

  const pinPoints = useMemo(() => pinLengths.map((l) => sampleAt(l)), [pinLengths]);

  const placeCar = (length: number) => {
    const el = carRef.current;
    if (!el) return;
    const { x, y, tx, ty } = sampleAt(length);
    const cx = x - ty * LANE_OFFSET;
    const cy = y + tx * LANE_OFFSET;
    const angle = (Math.atan2(ty, tx) * 180) / Math.PI;
    el.setAttribute('transform', `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(${angle.toFixed(2)})`);
  };

  useEffect(() => {
    if (!pinLengths.length) return;
    const target = pinLengths[Math.min(activeIndex, pinLengths.length - 1)];
    const from = progressRef.current ?? ROAD.visStart;
    cancelAnimationFrame(rafRef.current);

    const reduce =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || from === target) {
      progressRef.current = target;
      placeCar(target);
      return;
    }

    const duration = Math.min(2400, 800 + Math.abs(target - from) * 2.2);
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = -(Math.cos(Math.PI * t) - 1) / 2;
      const current = from + (target - from) * eased;
      progressRef.current = current;
      placeCar(current);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, pinLengths]);

  const activeStep = steps[Math.min(activeIndex, steps.length - 1)];

  const infoCard = activeStep ? (
    <div className="rounded-2xl border border-[#C9B79C]/40 bg-[#201914]/90 p-3 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-2 pb-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#6B4F3A] text-[10px] font-black text-[#FAF7F2]">
          {activeStep.stepNumber}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C9B79C]">{activeStep.phase}</div>
      </div>
      <h3 className="text-sm font-extrabold leading-snug text-[#FAF7F2]">{activeStep.title}</h3>
      <p className="mt-1 text-[11px] leading-relaxed text-[#E2D5C3]">{activeStep.description}</p>
    </div>
  ) : null;

  return (
    <div className="w-full">
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-[#6B523E] bg-[#4b8c36]"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Winding road showing your roadmap progress"
        >
          <defs>
            {TONES.map((t, i) => (
              <radialGradient key={i} id={`bush-${i}`} cx="0.38" cy="0.32" r="0.78">
                <stop offset="0" stopColor={t[0]} />
                <stop offset="0.55" stopColor={t[1]} />
                <stop offset="1" stopColor={t[2]} />
              </radialGradient>
            ))}
            <linearGradient id="car-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ee2d33" />
              <stop offset="0.5" stopColor="#d3181f" />
              <stop offset="1" stopColor="#a30f15" />
            </linearGradient>
            <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
              <stop offset="0.6" stopColor="#0b2a0d" stopOpacity="0" />
              <stop offset="1" stopColor="#0b2a0d" stopOpacity="0.28" />
            </radialGradient>
            <filter id="car-blur" x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          <Scenery />

          {/* Road */}
          <g fill="none" strokeLinejoin="round">
            <path d={ROAD.d} stroke="#1f3a1c" strokeOpacity={0.35} strokeWidth={ROAD_W + 12} />
            <path d={ROAD.d} stroke="#4a4a4a" strokeWidth={ROAD_W + 4} />
            <path d={ROAD.d} stroke="#f0f0f0" strokeWidth={ROAD_W} />
            <path d={ROAD.d} stroke="#6c6c6c" strokeWidth={ROAD_W - 5} />
            <path d={ROAD.d} stroke="#777777" strokeWidth={ROAD_W - 28} opacity={0.4} />
            <path d={ROAD.d} stroke="#5a5a5a" strokeWidth={ROAD_W - 12} strokeDasharray="1.5 7" opacity={0.35} />
            <path d={ROAD.d} stroke="#d9b73a" strokeWidth={6.5} />
            <path d={ROAD.d} stroke="#6c6c6c" strokeWidth={2.6} />
          </g>

          <Plants />
          <rect width={W} height={H} fill="url(#vignette)" pointerEvents="none" />

          {/* Step pins */}
          {steps.map((step, i) => {
            const p = pinPoints[i];
            if (!p) return null;
            const isActive = i === activeIndex;
            const isDone = completed.includes(step.stepNumber);
            return (
              <g
                key={step.stepNumber}
                transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer', outline: 'none' }}
                onClick={() => onSelect(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(i);
                  }
                }}
              >
                <title>{`Step ${step.stepNumber}: ${step.title}`}</title>
                {isActive && (
                  <circle r={22} fill="none" stroke="#FAF7F2" strokeWidth={2}>
                    <animate attributeName="r" values="21;31;21" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.85;0;0.85" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  r={isActive ? 19 : 15}
                  fill={isDone ? '#C9B79C' : isActive ? '#6B4F3A' : '#281D15'}
                  stroke="#FAF7F2"
                  strokeWidth={2.5}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isActive ? 15 : 13}
                  fontWeight={800}
                  fill={isDone ? '#231A12' : '#FAF7F2'}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {isDone ? '✓' : step.stepNumber}
                </text>
              </g>
            );
          })}

          {/* Car */}
          <g ref={carRef} transform="translate(-100 -100)">
            <Car />
          </g>
        </svg>

        {infoCard && (
          <div className="pointer-events-none absolute bottom-[5%] right-[3%] hidden w-[250px] sm:block">
            {infoCard}
          </div>
        )}
      </div>

      {infoCard && <div className="mt-3 sm:hidden">{infoCard}</div>}
    </div>
  );
};
