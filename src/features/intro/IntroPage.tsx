import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';

const CINEMATIC = [0.22, 1, 0.36, 1] as const;
const GRID = 8;

type Phase = 'curtain' | 'build' | 'flash' | 'sweep' | 'tagline' | 'out';

export const IntroPage: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = useAppStore(s => s.isLoggedIn);
  const loaded = useAppStore(s => s.loaded);
  const [phase, setPhase] = useState<Phase>('curtain');
  const [pageOpacity, setPageOpacity] = useState(1);

  const target = useMemo(() => (isLoggedIn ? '/home' : '/login'), [isLoggedIn]);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => setPhase('curtain'), 30);
    return () => clearTimeout(t);
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;
    const schedule: [number, Phase][] = [
      [200, 'build'],
      [550, 'flash'],
      [850, 'sweep'],
      [1250, 'tagline'],
      [1800, 'out'],
    ];
    const timers = schedule.map(([delay, p]) =>
      setTimeout(() => setPhase(p), delay)
    );
    const fadeTimer = setTimeout(() => setPageOpacity(0), 1900);
    const navTimer = setTimeout(() => navigate(target, { replace: true }), 2200);

    return () => { timers.forEach(clearTimeout); clearTimeout(fadeTimer); clearTimeout(navTimer); };
  }, [loaded, navigate, target]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      animate={{ opacity: pageOpacity }}
      transition={{ duration: 0.35, ease: CINEMATIC }}
      style={{ willChange: 'opacity' }}
    >
      {/* ── Background image layers ── */}
      <div className="absolute inset-0 sm:hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.12, filter: 'blur(12px)' }}
          animate={{
            opacity: 0.45,
            scale: 1,
            filter: 'blur(0px)',
          }}
          transition={{ duration: 1.2, ease: CINEMATIC }}
          style={{
            backgroundImage: 'url(/intro-bg/mobile.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            willChange: 'transform, filter',
          }}
        />
      </div>
      <div className="absolute inset-0 max-sm:hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.12, filter: 'blur(12px)' }}
          animate={{
            opacity: 0.5,
            scale: 1,
            filter: 'blur(0px)',
          }}
          transition={{ duration: 1.2, ease: CINEMATIC }}
          style={{
            backgroundImage: 'url(/intro-bg/desktop.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            willChange: 'transform, filter',
          }}
        />
      </div>

      {/* ── Tech grid pixel-mask reveal ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: GRID * GRID }).map((_, i) => {
          const row = Math.floor(i / GRID);
          const col = i % GRID;
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: `${100 / GRID}%`,
                height: `${100 / GRID}%`,
                left: `${(col / GRID) * 100}%`,
                top: `${(row / GRID) * 100}%`,
                background: 'var(--bg-base)',
              }}
              initial={{ opacity: 1, scale: 1, borderRadius: 0 }}
              animate={{
                opacity: phase === 'curtain'
                  ? 1 - (0.08 + (row + col) / (GRID * 2 - 2) * 0.3)
                  : 0,
                scale: phase === 'curtain' ? 1 : 0.7,
                borderRadius: phase === 'curtain' ? 0 : '30%',
              }}
              transition={{
                opacity: {
                  duration: 0.35,
                  delay: 0.1 + (row + col) * 0.025,
                  ease: 'easeOut',
                },
                scale: {
                  duration: 0.4,
                  delay: 0.1 + (row + col) * 0.025,
                  ease: CINEMATIC,
                },
                borderRadius: {
                  duration: 0.4,
                  delay: 0.1 + (row + col) * 0.025,
                  ease: CINEMATIC,
                },
              }}
            />
          );
        })}
      </div>

      {/* ── Dark gradient overlay ── */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: phase === 'out'
            ? 'radial-gradient(ellipse at center, rgba(8,8,8,0.7) 0%, rgba(8,8,8,0.92) 100%)'
            : 'radial-gradient(ellipse at center, rgba(8,8,8,0.35) 0%, rgba(8,8,8,0.6) 100%)',
        }}
        transition={{ duration: 0.9, ease: CINEMATIC }}
      />

      {/* ── Vignette ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          boxShadow: phase === 'out'
            ? 'inset 0 0 100px 50px rgba(8,8,8,0.7)'
            : 'inset 0 0 50px 15px rgba(8,8,8,0.3)',
        }}
        transition={{ duration: 1, ease: CINEMATIC }}
      />

      {/* ── Persistent tech grid overlay ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,212,91,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,212,91,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.04 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />

      {/* ── Ambient glow ── */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(170,235,0,0.06) 0%, transparent 70%)' }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{
          opacity: phase === 'curtain' || phase === 'build' ? 1 : 0.5,
          scale: 1,
        }}
        transition={{ duration: 0.8, ease: CINEMATIC }}
      />

      {/* ── Electric glow ring ── */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 340,
          height: 100,
          border: '1px solid rgba(170,235,0,0.08)',
          filter: 'blur(20px)',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: phase === 'flash' ? 0.6 : phase === 'sweep' ? 0.3 : 0,
          scale: phase === 'flash' ? 1.15 : 1,
        }}
        transition={{ duration: 0.4, ease: CINEMATIC }}
      />

      {/* ===== LOGO ASSEMBLY ===== */}
      <div className="relative z-10 flex items-baseline">
        {/* "Whos" */}
        <motion.span
          className="font-logo text-5xl sm:text-6xl text-white/85 select-none pl-1"
          style={{ letterSpacing: '0.08em' }}
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{
            clipPath: phase === 'curtain'
              ? 'inset(0 100% 0 0)'
              : 'inset(0 0% 0 0)',
          }}
          transition={{ duration: 0.5, ease: CINEMATIC }}
        >
          Whos
        </motion.span>

        {/* "I" */}
        <motion.span
          className="relative inline-block"
          style={{ perspective: 800, marginLeft: 3 }}
          initial={{ opacity: 0, x: -20, scale: 0.5 }}
          animate={{
            opacity: phase === 'curtain' ? 0 : 1,
            x: 0,
            scale: phase === 'flash' ? 1.15 : 1,
          }}
          transition={{
            opacity: { duration: 0.25, ease: CINEMATIC, delay: 0.25 },
            x: { type: 'spring', damping: 22, stiffness: 320, delay: 0.25 },
            scale: { duration: 0.2, ease: CINEMATIC, delay: 0.5 },
          }}
        >
          <span
            className="font-logo text-6xl sm:text-7xl select-none relative block"
            style={{
              color: 'var(--green)',
              textShadow: phase === 'flash' || phase === 'sweep' || phase === 'tagline'
                ? '0 0 30px rgba(170,235,0,0.7), 0 0 80px rgba(170,235,0,0.3)'
                : '0 0 12px rgba(170,235,0,0.4)',
              transition: 'text-shadow 0.3s ease',
            }}
          >
            I
          </span>
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: 'rgba(170,235,0,0.4)', filter: 'blur(16px)' }}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{
              opacity: phase === 'flash' ? 0.8 : 0,
              scale: phase === 'flash' ? 2.5 : 0.3,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </motion.span>

        {/* "n" */}
        <motion.span
          className="font-logo text-5xl sm:text-6xl text-white/85 select-none pr-1"
          style={{ letterSpacing: '0.08em' }}
          initial={{ opacity: 0, clipPath: 'inset(0 0% 0 100%)' }}
          animate={{
            opacity: phase === 'curtain' ? 0 : 1,
            clipPath: phase === 'curtain'
              ? 'inset(0 0% 0 100%)'
              : 'inset(0 0% 0 0%)',
          }}
          transition={{
            opacity: { duration: 0.2, ease: CINEMATIC, delay: 0.35 },
            clipPath: { duration: 0.35, ease: CINEMATIC, delay: 0.35 },
          }}
        >
          n
        </motion.span>

        {/* ── Dual-layer light sweep ── */}
        {/* Wide glow layer */}
        <motion.div
          className="absolute top-0 h-full pointer-events-none"
          style={{
            width: 200,
            left: -200,
            background: 'linear-gradient(90deg, transparent 0%, rgba(34,212,91,0.06) 30%, rgba(255,255,255,0.04) 50%, transparent 75%)',
            filter: 'blur(10px)',
          }}
          initial={{ opacity: 0 }}
          animate={{
            x: phase === 'sweep' || phase === 'tagline' ? [0, 550] : 0,
            opacity: phase === 'sweep' || phase === 'tagline' ? [0, 1, 0.5, 0] : 0,
          }}
          transition={{
            x: { duration: 0.7, ease: CINEMATIC },
            opacity: { duration: 0.5, ease: 'easeInOut' },
          }}
        />
        {/* Sharp core layer */}
        <motion.div
          className="absolute top-0 h-full pointer-events-none"
          style={{
            width: 60,
            left: -60,
            background: 'linear-gradient(90deg, transparent 0%, rgba(34,212,91,0.15) 25%, rgba(170,235,0,0.25) 40%, rgba(255,255,255,0.15) 55%, transparent 80%)',
            filter: 'blur(3px)',
          }}
          initial={{ opacity: 0 }}
          animate={{
            x: phase === 'sweep' || phase === 'tagline' ? [0, 550] : 0,
            opacity: phase === 'sweep' || phase === 'tagline' ? [0, 1, 0.7, 0] : 0,
          }}
          transition={{
            x: { duration: 0.65, ease: CINEMATIC },
            opacity: { duration: 0.4, ease: 'easeInOut' },
          }}
        />
      </div>

      {/* ── Electric streak ── */}
      <motion.div
        className="relative z-10 mt-1 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, var(--green), transparent)', width: 280 }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{
          scaleX: phase === 'curtain' || phase === 'build' ? 0 : phase === 'flash' ? 1 : 0.6,
          opacity: phase === 'curtain' || phase === 'build' ? 0 : phase === 'flash' ? 0.7 : 0.2,
        }}
        transition={{
          scaleX: { duration: 0.35, ease: CINEMATIC, delay: 0.4 },
          opacity: { duration: 0.2, ease: 'easeInOut' },
        }}
      />

      {/* ── Tagline ── */}
      <AnimatePresence mode="wait">
        {(phase === 'tagline' || phase === 'out') && (
          <motion.div
            key="tagline"
            className="relative z-10 mt-1.5 sm:mt-3 flex gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: CINEMATIC }}
          >
            {['Play.', 'Compete.', 'Conquer.'].map((word, i) => (
              <motion.span
                key={word}
                className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase select-none block"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.3, ease: CINEMATIC }}
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading dots ── */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'out' ? 0 : 0.4 }}
        transition={{ duration: 0.25 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--green)' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};
