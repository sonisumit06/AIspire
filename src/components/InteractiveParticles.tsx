import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  baseAlpha: number;
}

export const InteractiveParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useApp();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates for interactive attraction
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 140,
    };

    const isLightMode = () => document.documentElement.classList.contains('light-mode');

    // Generate responsive particle count
    const particleCount = Math.min(100, Math.max(40, Math.floor((width * height) / 14000)));

    const getColors = () => {
      if (isLightMode()) {
        return [
          'rgba(107, 79, 58, ',  // Warm Mocha (#6B4F3A)
          'rgba(201, 183, 156, ', // Warm Sand (#C9B79C)
          'rgba(43, 33, 24, ',   // Deep Espresso (#2B2118)
        ];
      }
      return [
        'rgba(201, 183, 156, ', // Warm Sand (#C9B79C)
        'rgba(250, 247, 242, ', // Cream Alabaster (#FAF7F2)
        'rgba(107, 79, 58, ',   // Warm Mocha (#6B4F3A)
        'rgba(217, 157, 85, ',  // Warm Honey Amber
      ];
    };

    let colors = getColors();

    const particles: (Particle & { phase: number; phaseSpeed: number })[] = [];
    for (let i = 0; i < particleCount; i++) {
      const colorPrefix = colors[Math.floor(Math.random() * colors.length)];
      const baseAlpha = 0.2 + Math.random() * 0.45;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        radius: 1.2 + Math.random() * 2.2,
        color: colorPrefix,
        baseAlpha,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.015 + Math.random() * 0.025,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      colors = getColors();
      const light = isLightMode();

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.phaseSpeed;

        // Bounce gently off boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Twinkling alpha calculation
        const twinkle = Math.sin(p.phase) * 0.15;
        const currentAlpha = Math.max(0.1, Math.min(0.85, p.baseAlpha + twinkle));

        // Interactive mouse connection / gentle nudge
        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < mouse.radius) {
          const force = (mouse.radius - distMouse) / mouse.radius;
          const lineAlpha = light ? force * 0.22 : force * 0.38;
          ctx.strokeStyle = light
            ? `rgba(107, 79, 58, ${lineAlpha})`
            : `rgba(201, 183, 156, ${lineAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();

          // Gentle orbital attraction toward cursor
          p.x += (dxMouse / distMouse) * force * 0.65;
          p.y += (dyMouse / distMouse) * force * 0.65;
        }

        // Draw particle dot with soft glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${currentAlpha})`;
        ctx.fill();

        // Connect nearby particles with constellation lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 95;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (light ? 0.08 : 0.14);
            ctx.strokeStyle = light
              ? `rgba(107, 79, 58, ${alpha})`
              : `rgba(201, 183, 156, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-0 w-full h-full transition-opacity duration-500"
      style={{ opacity: 0.9 }}
      aria-hidden="true"
    />
  );
};

