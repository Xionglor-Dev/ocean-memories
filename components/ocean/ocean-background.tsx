"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

type CreatureType = "dolphin" | "jellyfish" | "turtle" | "starfish" | "shell";

type Bubble = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  sway: number;
  phase: number;
  opacity: number;
};

type Particle = {
  x: number;
  y: number;
  phase: number;
  size: number;
  opacity: number;
};

type Reflection = {
  y: number;
  length: number;
  phase: number;
  speed: number;
  opacity: number;
};

// Keep decorative motion near the edges so the timeline/cards stay clean.
const edgeWeightedX = (index: number) => {
  const side = index % 2 === 0 ? 0.06 : 0.94;
  const drift = ((index * 37) % 22) / 100;

  return index % 2 === 0 ? side + drift : side - drift;
};

// Fixed fields make the animation feel organic without changing on every render.
const bubbleField: Bubble[] = Array.from({ length: 34 }, (_, index) => ({
  x: edgeWeightedX(index),
  y: ((index * 31 + 11) % 100) / 100,
  radius: 4 + ((index * 7) % 17),
  speed: 9 + ((index * 5) % 18),
  sway: 12 + ((index * 3) % 24),
  phase: index * 0.73,
  opacity: 0.12 + (index % 5) * 0.035,
}));

const particleField: Particle[] = Array.from({ length: 64 }, (_, index) => ({
  x: ((index * 29 + 7) % 100) / 100,
  y: ((index * 43 + 13) % 100) / 100,
  phase: index * 0.41,
  size: 0.9 + (index % 5) * 0.45,
  opacity: 0.06 + (index % 6) * 0.018,
}));

const reflections: Reflection[] = Array.from({ length: 13 }, (_, index) => ({
  y: 0.16 + index * 0.06,
  length: 92 + ((index * 17) % 90),
  phase: index * 0.76,
  speed: 0.22 + index * 0.018,
  opacity: 0.08 + (index % 4) * 0.025,
}));

const edgeGlows = [
  { id: 1, className: "left-[-14%] top-[8%] h-72 w-72", delay: 0 },
  { id: 2, className: "right-[-12%] top-[24%] h-80 w-80", delay: 4 },
  { id: 3, className: "left-[-10%] bottom-[7%] h-64 w-64", delay: 8 },
  { id: 4, className: "right-[-16%] bottom-[-4%] h-96 w-96", delay: 2 },
];

const creatures: Array<{
  id: number;
  type: CreatureType;
  side: "left" | "right";
  top: string;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}> = [
  { id: 1, type: "dolphin", side: "left", top: "14%", size: 104, delay: 0, duration: 44, opacity: 0.24 },
  { id: 2, type: "jellyfish", side: "right", top: "27%", size: 78, delay: 10, duration: 52, opacity: 0.2 },
  { id: 3, type: "turtle", side: "right", top: "62%", size: 92, delay: 20, duration: 58, opacity: 0.18 },
  { id: 4, type: "starfish", side: "left", top: "78%", size: 60, delay: 7, duration: 50, opacity: 0.15 },
  { id: 5, type: "shell", side: "right", top: "84%", size: 56, delay: 17, duration: 54, opacity: 0.17 },
];

const twoPi = Math.PI * 2;

export function OceanBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      // Cap the canvas pixel ratio so high-density phones stay smooth.
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawGradient = () => {
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#DFF6FF");
      gradient.addColorStop(0.5, "#C9EEFF");
      gradient.addColorStop(1, "#AEE2FF");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      const topGlow = context.createRadialGradient(width * 0.5, 0, 0, width * 0.5, 0, height * 0.8);
      topGlow.addColorStop(0, "rgba(255,255,255,0.54)");
      topGlow.addColorStop(0.42, "rgba(255,255,255,0.12)");
      topGlow.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = topGlow;
      context.fillRect(0, 0, width, height);

      const sideGlow = context.createRadialGradient(width * 0.06, height * 0.42, 0, width * 0.06, height * 0.42, width * 0.42);
      sideGlow.addColorStop(0, "rgba(255,255,255,0.22)");
      sideGlow.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = sideGlow;
      context.fillRect(0, 0, width, height);
    };

    const drawWaveFill = (
      time: number,
      baseY: number,
      amplitude: number,
      wavelength: number,
      speed: number,
      color: string,
      phase = 0,
    ) => {
      context.beginPath();
      context.moveTo(-40, height + 60);

      for (let x = -40; x <= width + 40; x += 16) {
        const y =
          baseY +
          Math.sin(x / wavelength + time * speed + phase) * amplitude +
          Math.sin(x / (wavelength * 0.47) - time * speed * 0.65 + phase) *
            amplitude *
            0.34;
        context.lineTo(x, y);
      }

      context.lineTo(width + 40, height + 60);
      context.closePath();
      context.fillStyle = color;
      context.fill();
    };

    const drawWaveLine = (
      time: number,
      y: number,
      amplitude: number,
      wavelength: number,
      speed: number,
      color: string,
      lineWidth: number,
      phase = 0,
    ) => {
      context.beginPath();

      for (let x = -60; x <= width + 60; x += 14) {
        const waveY =
          y +
          Math.sin(x / wavelength + time * speed + phase) * amplitude +
          Math.sin(x / (wavelength * 0.58) - time * speed * 0.52 + phase) *
            amplitude *
            0.35;

        if (x === -60) {
          context.moveTo(x, waveY);
        } else {
          context.lineTo(x, waveY);
        }
      }

      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.lineCap = "round";
      context.stroke();
    };

    const drawLightRays = (time: number) => {
      context.save();
      context.globalCompositeOperation = "screen";
      context.filter = "blur(10px)";

      for (let index = 0; index < 5; index += 1) {
        const rayX = width * (0.1 + index * 0.22) + Math.sin(time * 0.16 + index * 1.7) * 34;
        const rayWidth = width * (0.1 + (index % 2) * 0.05);
        const ray = context.createLinearGradient(rayX, 0, rayX + rayWidth, height * 0.9);
        ray.addColorStop(0, "rgba(255,255,255,0.36)");
        ray.addColorStop(0.55, "rgba(255,255,255,0.08)");
        ray.addColorStop(1, "rgba(255,255,255,0)");

        context.globalAlpha = 0.26;
        context.fillStyle = ray;
        context.beginPath();
        context.moveTo(rayX, -40);
        context.lineTo(rayX + rayWidth, -40);
        context.lineTo(rayX + width * 0.24, height);
        context.lineTo(rayX - width * 0.08, height);
        context.closePath();
        context.fill();
      }

      context.filter = "none";
      context.restore();
    };

    const drawReflections = (time: number) => {
      context.save();
      context.globalCompositeOperation = "screen";
      context.lineCap = "round";

      reflections.forEach((reflection, index) => {
        const y = height * reflection.y + Math.sin(time * 0.24 + reflection.phase) * 18;
        const centerX =
          ((time * reflection.speed * 44 + index * 173) % (width + 260)) - 130;
        const shimmer = 0.55 + Math.sin(time * 0.8 + reflection.phase) * 0.35;

        context.globalAlpha = reflection.opacity * shimmer;
        context.strokeStyle = "rgba(255,255,255,0.86)";
        context.lineWidth = 1.2 + (index % 3) * 0.7;
        context.beginPath();

        for (let step = 0; step <= 18; step += 1) {
          const x = centerX - reflection.length / 2 + (reflection.length / 18) * step;
          const waveY = y + Math.sin(step * 0.9 + time * 1.2 + reflection.phase) * 5;

          if (step === 0) {
            context.moveTo(x, waveY);
          } else {
            context.lineTo(x, waveY);
          }
        }

        context.stroke();
      });

      context.restore();
    };

    const drawParticles = (time: number) => {
      context.save();
      context.globalCompositeOperation = "screen";

      particleField.forEach((particle) => {
        const x = particle.x * width + Math.sin(time * 0.2 + particle.phase) * 18;
        const y = particle.y * height + Math.cos(time * 0.16 + particle.phase) * 14;
        const pulse = 0.5 + Math.sin(time * 0.9 + particle.phase) * 0.5;

        context.globalAlpha = particle.opacity * (0.6 + pulse * 0.75);
        context.fillStyle = "#dfffee";
        context.beginPath();
        context.arc(x, y, particle.size + pulse * 1.25, 0, twoPi);
        context.fill();
      });

      context.restore();
    };

    const drawBubbles = (time: number) => {
      bubbleField.forEach((bubble) => {
        const travel = (time * bubble.speed + bubble.y * height) % (height + 160);
        const y = height + 90 - travel;
        const x = bubble.x * width + Math.sin(time * 0.44 + bubble.phase) * bubble.sway;
        const highlightX = x - bubble.radius * 0.35;
        const highlightY = y - bubble.radius * 0.38;

        context.globalAlpha = bubble.opacity;
        context.strokeStyle = "rgba(255,255,255,0.86)";
        context.fillStyle = "rgba(255,255,255,0.18)";
        context.lineWidth = 1.3;
        context.beginPath();
        context.arc(x, y, bubble.radius, 0, twoPi);
        context.fill();
        context.stroke();

        context.globalAlpha = bubble.opacity * 0.82;
        context.fillStyle = "rgba(255,255,255,0.72)";
        context.beginPath();
        context.arc(highlightX, highlightY, Math.max(1.2, bubble.radius * 0.22), 0, twoPi);
        context.fill();
      });

      context.globalAlpha = 1;
    };

    const draw = (timestamp: number) => {
      const time = timestamp / 1000;

      // Draw back-to-front so rays, waves, shimmer, particles, and bubbles blend softly.
      drawGradient();
      drawLightRays(time);
      drawWaveFill(time, height * 0.5, 22, 170, 0.34, "rgba(255,255,255,0.13)", 0.4);
      drawWaveFill(time, height * 0.62, 34, 220, 0.28, "rgba(124,203,255,0.19)", 1.1);
      drawWaveFill(time, height * 0.74, 44, 270, 0.23, "rgba(78,179,226,0.16)", 2.1);
      drawWaveFill(time, height * 0.88, 36, 190, 0.31, "rgba(42,139,190,0.11)", 2.7);
      drawWaveLine(time, height * 0.22, 9, 150, 0.54, "rgba(255,255,255,0.2)", 1.6, 0);
      drawWaveLine(time, height * 0.34, 12, 190, 0.42, "rgba(255,255,255,0.16)", 1.4, 1.4);
      drawWaveLine(time, height * 0.48, 15, 230, 0.35, "rgba(93,193,238,0.18)", 1.8, 2.2);
      drawReflections(time);
      drawParticles(time);
      drawBubbles(time);
      frame = window.requestAnimationFrame(draw);
    };

    resize();
    frame = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#DFF6FF]"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <motion.div
        className="absolute inset-x-[-18%] top-[-18%] h-[46vh] rounded-[50%] bg-white/20 blur-3xl"
        animate={{ opacity: [0.2, 0.34, 0.24, 0.2], scaleX: [1, 1.08, 0.98, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {edgeGlows.map((glow) => (
        <motion.span
          key={glow.id}
          className={`ocean-edge-glow absolute rounded-full ${glow.className}`}
          animate={{
            opacity: [0.18, 0.36, 0.22, 0.18],
            scale: [0.92, 1.08, 1, 0.92],
          }}
          transition={{
            duration: 19,
            delay: glow.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {creatures.map((creature) => (
        <motion.div
          key={creature.id}
          className="ocean-creature absolute text-ocean-deep"
          style={{
            top: creature.top,
            width: creature.size,
            height: creature.size,
            opacity: creature.opacity,
            [creature.side]: "-4%",
          }}
          animate={{
            x:
              creature.side === "left"
                ? ["-18%", "8%", "3%", "-18%"]
                : ["18%", "-8%", "-3%", "18%"],
            y: [0, -14, 10, 0],
            rotate: [0, creature.side === "left" ? 2 : -2, 0],
            opacity: [0, creature.opacity, creature.opacity * 0.7, 0],
          }}
          transition={{
            duration: creature.duration,
            delay: creature.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <OceanCreature type={creature.type} flipped={creature.side === "right"} />
        </motion.div>
      ))}
      <div className="ocean-clean-center absolute inset-0" />
    </div>
  );
}

function OceanCreature({
  type,
  flipped,
}: {
  type: CreatureType;
  flipped?: boolean;
}) {
  const transform = flipped ? "translate(100 0) scale(-1 1)" : undefined;

  if (type === "dolphin") {
    return (
      <svg viewBox="0 0 100 64" className="h-full w-full drop-shadow-[0_8px_18px_rgba(31,110,145,0.12)]">
        <g transform={transform}>
          <path
            fill="currentColor"
            d="M14 38c15-22 41-28 66-17 5 2 10 1 15-3-2 9-8 15-17 17-13 3-22 10-30 20-3-8-1-14 6-20-13 2-24 7-34 16-3-4-5-8-6-13Z"
          />
          <path
            fill="currentColor"
            fillOpacity="0.58"
            d="M53 17c8-10 17-12 28-8-4 8-12 12-23 12Z"
          />
          <path
            fill="currentColor"
            fillOpacity="0.45"
            d="M31 43c-8 8-15 10-25 7 5-6 11-10 20-13Z"
          />
        </g>
      </svg>
    );
  }

  if (type === "jellyfish") {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_0_18px_rgba(255,255,255,0.35)]">
        <g transform={transform}>
          <path
            fill="currentColor"
            fillOpacity="0.72"
            d="M18 44c2-23 17-34 32-34s30 12 32 34c-11 8-53 8-64 0Z"
          />
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="5"
            d="M30 50c-8 11 4 19-4 32M46 52c-7 12 6 18 0 33M62 52c7 12-6 19 1 34M76 50c8 11-4 19 4 32"
          />
        </g>
      </svg>
    );
  }

  if (type === "turtle") {
    return (
      <svg viewBox="0 0 100 72" className="h-full w-full drop-shadow-[0_8px_18px_rgba(31,110,145,0.12)]">
        <g transform={transform}>
          <ellipse cx="50" cy="36" rx="29" ry="20" fill="currentColor" />
          <circle cx="82" cy="34" r="9" fill="currentColor" fillOpacity="0.76" />
          <path fill="currentColor" fillOpacity="0.56" d="M20 28c-8-6-15-6-19 2 7 4 13 5 22 3ZM22 45c-9 3-14 8-13 16 8-1 13-5 18-13ZM61 18c5-9 12-13 20-10 0 8-6 13-16 17ZM62 54c8 4 12 10 11 18-8 0-14-4-18-13Z" />
          <path fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" d="M33 27c8 8 24 9 34 0M31 43c10-6 26-7 39 0" />
        </g>
      </svg>
    );
  }

  if (type === "starfish") {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_0_16px_rgba(255,255,255,0.28)]">
        <path
          fill="currentColor"
          fillOpacity="0.78"
          d="M50 8 61 38l31 1-25 18 9 31-26-18-26 18 9-31L8 39l31-1Z"
        />
        <circle cx="50" cy="51" r="7" fill="rgba(255,255,255,0.35)" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 78" className="h-full w-full drop-shadow-[0_0_16px_rgba(255,255,255,0.28)]">
      <path
        fill="currentColor"
        fillOpacity="0.74"
        d="M16 62c2-29 17-48 34-48s32 19 34 48c-18 9-50 9-68 0Z"
      />
      <path
        fill="none"
        stroke="rgba(255,255,255,0.48)"
        strokeLinecap="round"
        strokeWidth="4"
        d="M50 17v48M35 24c5 11 9 24 10 40M65 24c-5 11-9 24-10 40M24 42c9 6 16 14 21 23M76 42c-9 6-16 14-21 23"
      />
    </svg>
  );
}
