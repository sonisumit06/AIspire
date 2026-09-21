import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Brain,
  Palette,
  Cpu,
  HeartHandshake,
  Briefcase,
  Microscope,
  MessageSquareQuote,
  Sparkles,
  Award,
} from 'lucide-react';
import { animate, cubicBezier } from 'animejs';
import type { DimensionKey, DimensionScores } from '../types';
import { DIMENSIONS } from '../data/questions';
import { isReducedMotion } from '../utils/motion';
import { useCardTilt } from '../hooks/useMotion';

const EASE_LUXURY = cubicBezier(0.16, 1, 0.3, 1);

interface InteractiveRadarSignatureProps {
  scores?: DimensionScores | null;
  className?: string;
  onSelectDimension?: (dim: DimensionKey) => void;
  compact?: boolean;
}

// Map dimensions to top related careers for dynamic readout
const DIMENSION_CAREER_MAP: Record<DimensionKey, string> = {
  analytical: 'FinTech Quant & Data Scientist',
  creative: 'Product Designer & UI/UX Visionary',
  technical: 'Full-Stack AI & ML Engineer',
  socialHealthcare: 'Physician & Clinical Health Innovator',
  management: 'Tech Entrepreneur & Product Manager',
  research: 'Biotechnology & Genetic Research Scientist',
  communication: 'Tech Entrepreneur & Strategic Policy',
};

const DIMENSION_ICONS: Record<DimensionKey, React.ComponentType<{ className?: string }>> = {
  analytical: Brain,
  creative: Palette,
  technical: Cpu,
  socialHealthcare: HeartHandshake,
  management: Briefcase,
  research: Microscope,
  communication: MessageSquareQuote,
};

export const InteractiveRadarSignature: React.FC<InteractiveRadarSignatureProps> = ({
  scores,
  className = '',
  onSelectDimension,
  compact = false,
}) => {
  const cardRef = useCardTilt<HTMLDivElement>({ maxTilt: compact ? 3 : 5, spotlight: true });
  const [activeDimension, setActiveDimension] = useState<DimensionKey>('analytical');
  const polygonRef = useRef<SVGPolygonElement>(null);
  const vertexCirclesRef = useRef<(SVGCircleElement | null)[]>([]);
  const vertexPulseRefs = useRef<(SVGCircleElement | null)[]>([]);
  const pillRef = useRef<HTMLDivElement>(null);

  // Radar geometry constants
  const size = 440;
  const center = size / 2;
  const radius = compact ? 115 : 135;
  const numDimensions = DIMENSIONS.length; // 7

  // Normalized scores (fallback to 50% for neutral state before test)
  const normalizedScores = useMemo<Record<DimensionKey, number>>(() => {
    const result: Record<string, number> = {};
    DIMENSIONS.forEach((dim) => {
      const val = scores ? scores[dim.key] : 50;
      result[dim.key] = typeof val === 'number' && !isNaN(val) ? Math.max(12, Math.min(100, val)) : 50;
    });
    return result as Record<DimensionKey, number>;
  }, [scores]);

  // Overall average cognitive score
  const overallAverage = useMemo(() => {
    const vals = Object.values(normalizedScores);
    return Math.round(vals.reduce((acc, v) => acc + v, 0) / vals.length);
  }, [normalizedScores]);

  // Target points for each vertex at 100% progress
  const targetPoints = useMemo(() => {
    return DIMENSIONS.map((dim, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numDimensions;
      const score = normalizedScores[dim.key];
      const r = (score / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        angle,
        score,
        dim,
      };
    });
  }, [normalizedScores, center, radius, numDimensions]);

  // Concentric guide polygon points (at levels 0.2, 0.4, 0.6, 0.8, 1.0)
  const guidePolygons = useMemo(() => {
    const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
    return levels.map((lvl) => {
      const pts = DIMENSIONS.map((_, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numDimensions;
        const r = lvl * radius;
        return `${(center + r * Math.cos(angle)).toFixed(1)},${(center + r * Math.sin(angle)).toFixed(1)}`;
      }).join(' ');
      return { level: Math.round(lvl * 100), points: pts };
    });
  }, [center, radius, numDimensions]);

  // Spokes from center to outer boundary
  const spokes = useMemo(() => {
    return DIMENSIONS.map((dim, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numDimensions;
      return {
        key: dim.key,
        x1: center,
        y1: center,
        x2: center + radius * Math.cos(angle),
        y2: center + radius * Math.sin(angle),
        labelX: center + (radius + (compact ? 24 : 32)) * Math.cos(angle),
        labelY: center + (radius + (compact ? 24 : 32)) * Math.sin(angle),
        dim,
      };
    });
  }, [center, radius, numDimensions, compact]);

  // Helper to construct points string from an interpolated progress [0..1]
  const computePointsString = useCallback((progress: number) => {
    return targetPoints
      .map((pt) => {
        const r = ((pt.score / 100) * radius) * progress;
        const x = center + r * Math.cos(pt.angle);
        const y = center + r * Math.sin(pt.angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [targetPoints, center, radius]);

  // Trigger smooth, direct-DOM Anime.js v4 geometry animation on mount / score change
  useEffect(() => {
    const finalPointsStr = computePointsString(1);

    if (isReducedMotion()) {
      if (polygonRef.current) {
        polygonRef.current.setAttribute('points', finalPointsStr);
      }
      targetPoints.forEach((pt, i) => {
        const circle = vertexCirclesRef.current[i];
        if (circle) {
          circle.setAttribute('cx', pt.x.toFixed(1));
          circle.setAttribute('cy', pt.y.toFixed(1));
        }
        const pulse = vertexPulseRefs.current[i];
        if (pulse) {
          pulse.setAttribute('cx', pt.x.toFixed(1));
          pulse.setAttribute('cy', pt.y.toFixed(1));
        }
      });
      return;
    }

    const animObj = { progress: 0 };
    const anim = animate(animObj, {
      progress: 1,
      duration: 950,
      ease: EASE_LUXURY,
      onUpdate: () => {
        const currentProgress = animObj.progress;
        if (polygonRef.current) {
          polygonRef.current.setAttribute('points', computePointsString(currentProgress));
        }
        targetPoints.forEach((pt, i) => {
          const r = ((pt.score / 100) * radius) * currentProgress;
          const x = (center + r * Math.cos(pt.angle)).toFixed(1);
          const y = (center + r * Math.sin(pt.angle)).toFixed(1);

          const circle = vertexCirclesRef.current[i];
          if (circle) {
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
          }
          const pulse = vertexPulseRefs.current[i];
          if (pulse) {
            pulse.setAttribute('cx', x);
            pulse.setAttribute('cy', y);
          }
        });
      },
      onComplete: () => {
        if (polygonRef.current) {
          polygonRef.current.setAttribute('points', finalPointsStr);
        }
      },
    });

    return () => {
      anim.revert();
    };
  }, [computePointsString, targetPoints, radius, center]);

  // Micro-transition on dynamic pill when activeDimension switches
  const selectDimension = useCallback((dimKey: DimensionKey) => {
    setActiveDimension(dimKey);
    onSelectDimension?.(dimKey);

    if (pillRef.current && !isReducedMotion()) {
      animate(pillRef.current, {
        opacity: [0.65, 1],
        translateY: [3, 0],
        duration: 260,
        ease: EASE_LUXURY,
      });
    }
  }, [onSelectDimension]);

  const activeDimInfo = DIMENSIONS.find((d) => d.key === activeDimension) || DIMENSIONS[0];
  const activeScore = Math.round(normalizedScores[activeDimInfo.key]);
  const ActiveIcon = DIMENSION_ICONS[activeDimInfo.key] || Brain;

  // Keyboard navigation between vertices
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (index + 1) % numDimensions;
      selectDimension(DIMENSIONS[nextIdx].key);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (index - 1 + numDimensions) % numDimensions;
      selectDimension(DIMENSIONS[prevIdx].key);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectDimension(DIMENSIONS[index].key);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`relative bg-[#231A12] border border-[#6B523E] rounded-2xl p-4 sm:p-6 shadow-2xl transition-all duration-300 select-none overflow-hidden w-full max-w-full min-w-0 ${className}`}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Background ambient luxury glow */}
      <div
        className="absolute -top-24 -right-24 w-64 h-64 bg-[#6B4F3A]/25 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#C9B79C]/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Header with High-Contrast Typography */}
      <div className="flex items-center justify-between gap-3 border-b border-[#6B523E] pb-3.5 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#523A28] border border-[#C9B79C]/50 flex items-center justify-center text-[#FAF7F2] shadow-xs">
            <Sparkles className="w-4 h-4 text-[#FAF7F2]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#FAF7F2] tracking-tight">
              7D Cognitive Radar Signature
            </h2>
            <p className="text-xs text-[#E2D5C3] font-medium">
              Interactive multidimensional cognitive topology
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#4A3728] text-[#FAF7F2] border border-[#C9B79C]/60 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#FAF7F2] animate-pulse" />
            <span>Index: {overallAverage}%</span>
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex items-center justify-center my-2 w-full max-w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[320px] sm:max-w-[400px] h-auto aspect-square overflow-visible focus:outline-none"
          role="img"
          aria-label="Interactive 7-Dimensional Cognitive Profile Radar Chart"
        >
          <defs>
            {/* Radar area linear gradient */}
            <linearGradient id="radarFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9B79C" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#6B4F3A" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#2B2118" stopOpacity="0.20" />
            </linearGradient>

            {/* Glowing filter for vertices */}
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Active vertex pulsing glow */}
            <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Concentric guide rings with visible high-contrast strokes */}
          {guidePolygons.map((guide, idx) => (
            <g key={guide.level}>
              <polygon
                points={guide.points}
                fill="none"
                stroke="#7D604A"
                strokeWidth={idx === guidePolygons.length - 1 ? '1.4' : '0.9'}
                strokeDasharray={idx === guidePolygons.length - 1 ? undefined : '3,3'}
                strokeOpacity={idx === guidePolygons.length - 1 ? 0.7 : 0.45}
              />
              {/* Level labels along the top spoke (high contrast) */}
              <text
                x={center + 6}
                y={center - (guide.level / 100) * radius + 4}
                fill="#FAF7F2"
                fontSize="9.5"
                fontWeight="bold"
                fontFamily="sans-serif"
                opacity={0.85}
              >
                {guide.level}
              </text>
            </g>
          ))}

          {/* 2. Radial spokes */}
          {spokes.map((spoke) => {
            const isActive = activeDimension === spoke.key;
            return (
              <line
                key={spoke.key}
                x1={spoke.x1}
                y1={spoke.y1}
                x2={spoke.x2}
                y2={spoke.y2}
                stroke={isActive ? '#FAF7F2' : '#7D604A'}
                strokeWidth={isActive ? 2.2 : 1.0}
                strokeOpacity={isActive ? 1.0 : 0.45}
                className="transition-all duration-300"
              />
            );
          })}

          {/* 3. Data Polygon (Animated smoothly via ref) */}
          <polygon
            ref={polygonRef}
            points={computePointsString(1)}
            fill="url(#radarFillGrad)"
            stroke="#FAF7F2"
            strokeWidth="2.4"
            strokeLinejoin="round"
            filter="url(#radarGlow)"
            className="transition-all duration-150"
          />

          {/* 4. Interactive Vertices */}
          {targetPoints.map((pt, i) => {
            const dim = DIMENSIONS[i];
            const isActive = activeDimension === dim.key;
            const scoreVal = Math.round(normalizedScores[dim.key]);

            return (
              <g
                key={dim.key}
                className="cursor-pointer group focus:outline-none"
                tabIndex={0}
                role="button"
                aria-label={`${dim.label}: ${scoreVal} percent. Press Enter to view insights.`}
                onMouseEnter={() => selectDimension(dim.key)}
                onFocus={() => selectDimension(dim.key)}
                onClick={() => selectDimension(dim.key)}
                onKeyDown={(e) => handleKeyDown(e, i)}
              >
                {/* Touch / pointer hitbox extender */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={18}
                  fill="transparent"
                />

                {/* SVG Native Pulsing Ring (Cross-browser GPU stable) */}
                {isActive && (
                  <circle
                    ref={(el) => { vertexPulseRefs.current[i] = el; }}
                    cx={pt.x}
                    cy={pt.y}
                    r={9}
                    fill="none"
                    stroke="#FAF7F2"
                    strokeWidth="1.6"
                    opacity="0.9"
                  >
                    <animate attributeName="r" values="7;17;7" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0;0.9" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Core vertex circle */}
                <circle
                  ref={(el) => { vertexCirclesRef.current[i] = el; }}
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? 7 : 4.5}
                  fill={isActive ? '#FAF7F2' : '#C9B79C'}
                  stroke="#2B2118"
                  strokeWidth="2"
                  filter={isActive ? 'url(#activeGlow)' : undefined}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}

          {/* 5. Dimension Labels around perimeter (High-contrast typography) */}
          {spokes.map((spoke) => {
            const isActive = activeDimension === spoke.key;
            const scoreVal = Math.round(normalizedScores[spoke.key]);
            const textAnchor =
              Math.abs(spoke.labelX - center) < 15
                ? 'middle'
                : spoke.labelX > center
                ? 'start'
                : 'end';

            return (
              <g
                key={`label-${spoke.key}`}
                className="cursor-pointer transition-opacity duration-300"
                onClick={() => selectDimension(spoke.key)}
                onMouseEnter={() => selectDimension(spoke.key)}
              >
                <text
                  x={spoke.labelX}
                  y={spoke.labelY}
                  textAnchor={textAnchor}
                  fill={isActive ? '#FAF7F2' : '#E2D5C3'}
                  fontSize={compact ? '10.5' : '11.5'}
                  fontWeight={isActive ? '800' : '600'}
                  letterSpacing="0.02em"
                  className="transition-all duration-300"
                >
                  {spoke.dim.label.split('&')[0].trim()}
                </text>
                <text
                  x={spoke.labelX}
                  y={spoke.labelY + 13}
                  textAnchor={textAnchor}
                  fill={isActive ? '#FAF7F2' : '#D8C7B0'}
                  fontSize="10"
                  fontWeight="bold"
                >
                  {scoreVal}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dynamic Score Readout Pill (High Contrast & Animated on Switch) */}
      <div
        ref={pillRef}
        className="mt-3 p-3.5 sm:p-4 rounded-xl bg-[#281D15] border border-[#6B523E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner transition-all duration-300 w-full max-w-full min-w-0"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#523A28] border border-[#C9B79C]/50 flex items-center justify-center text-[#FAF7F2] flex-shrink-0 shadow-xs">
            <ActiveIcon className="w-5 h-5 text-[#FAF7F2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-[#FAF7F2]">
                {activeDimInfo.label}
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-[#6B4F3A] text-[#FAF7F2] border border-[#C9B79C]/50 shadow-xs">
                {activeScore}%
              </span>
            </div>
            <p className="text-xs text-[#E2D5C3] font-medium leading-relaxed line-clamp-1 mt-0.5">
              {activeDimInfo.shortDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#E2D5C3] bg-[#1E150F] px-3 py-1.5 rounded-lg border border-[#6B523E] flex-shrink-0 shadow-xs max-w-full">
          <Award className="w-4 h-4 text-[#FAF7F2] flex-shrink-0" />
          <span className="truncate max-w-[190px] sm:max-w-[220px]">
            Key in: <strong className="text-[#FAF7F2]">{DIMENSION_CAREER_MAP[activeDimInfo.key]}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
