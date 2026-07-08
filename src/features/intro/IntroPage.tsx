import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';

const CINEMATIC = [0.22, 1, 0.36, 1] as const;

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
    const t = setTimeout(() => setPhase('curtain'), 50);
    return () => clearTimeout(t);
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;
    const schedule: [number, Phase][] = [
      [500, 'build'],
      [1100, 'flash'],
      [1600, 'sweep'],
      [2150, 'tagline'],
      [2800, 'out'],
    ];
    const timers = schedule.map(([delay, p]) =>
      setTimeout(() => setPhase(p as Phase), delay)
    );
    const fadeTimer = setTimeout(() => setPageOpacity(0), 2900);
    const navTimer = setTimeout(() => navigate(target, { replace: true }), 3200);

    return () => { timers.forEach(clearTimeout); clearTimeout(fadeTimer); clearTimeout(navTimer); };
  }, [loaded, navigate, target]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      animate={{ opacity: pageOpacity }}
      transition={{ duration: 0.4, ease: CINEMATIC }}
      style={{ willChange: 'opacity' }}
    >
      {/* ── Background image layers ── */}
      {/* Mobile bg */}
      <motion.div
        className="absolute inset-0 sm:hidden"
        initial={{ opacity: 0, scale: 1.15, filter: 'blur(14px)' }}
        animate={{
          opacity: phase === 'out' ? 0 : phase === 'curtain' ? 0.45 : 0.5,
          scale: phase === 'out' ? 1.1 : phase === 'curtain' ? 1.15 : 1,
          filter: phase === 'out'
            ? 'blur(10px)'
            : phase === 'curtain'
              ? 'blur(14px)'
              : 'blur(0px)',
        }}
        transition={{
          duration: 1.8,
          ease: CINEMATIC,
          scale: { duration: 2.2, ease: CINEMATIC },
          filter: { duration: 2, ease: CINEMATIC },
        }}
        style={{
          backgroundImage: 'url(/intro-bg/mobile.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          willChange: 'transform, filter, opacity',
        }}
      />

      {/* Desktop bg */}
      <motion.div
        className="absolute inset-0 max-sm:hidden"
        initial={{ opacity: 0, scale: 1.15, filter: 'blur(14px)' }}
        animate={{
          opacity: phase === 'out' ? 0 : phase === 'curtain' ? 0.45 : 0.5,
          scale: phase === 'out' ? 1.1 : phase === 'curtain' ? 1.15 : 1,
          filter: phase === 'out'
            ? 'blur(10px)'
            : phase === 'curtain'
              ? 'blur(14px)'
              : 'blur(0px)',
        }}
        transition={{
          duration: 1.8,
          ease: CINEMATIC,
          scale: { duration: 2.2, ease: CINEMATIC },
          filter: { duration: 2, ease: CINEMATIC },
        }}
        style={{
          backgroundImage: 'url(/intro-bg/desktop.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          willChange: 'transform, filter, opacity',
        }}
      />

      {/* ── Gradient overlay — deepens on exit for curtain effect ── */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: phase === 'out'
            ? 'radial-gradient(ellipse at center, rgba(8,8,8,0.7) 0%, rgba(8,8,8,0.92) 100%)'
            : 'radial-gradient(ellipse at center, rgba(8,8,8,0.35) 0%, rgba(8,8,8,0.6) 100%)',
        }}
        transition={{ duration: 1.2, ease: CINEMATIC }}
      />

      {/* ── Edge vignette that tightens on exit ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          boxShadow: phase === 'out'
            ? 'inset 0 0 120px 60px rgba(8,8,8,0.7)'
            : 'inset 0 0 60px 20px rgba(8,8,8,0.3)',
        }}
        transition={{ duration: 1.4, ease: CINEMATIC }}
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
        transition={{ duration: 1.2, ease: CINEMATIC }}
      />

      {/* Electric glow ring */}
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
        transition={{ duration: 0.5, ease: CINEMATIC }}
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
          transition={{ duration: 0.7, ease: CINEMATIC, delay: 0 }}
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
            opacity: { duration: 0.35, ease: CINEMATIC, delay: 0.5 },
            x: { type: 'spring', damping: 20, stiffness: 300, delay: 0.5 },
            scale: { duration: 0.25, ease: CINEMATIC, delay: 0.9 },
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
            transition={{ duration: 0.35, ease: 'easeOut' }}
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
            opacity: { duration: 0.3, ease: CINEMATIC, delay: 0.65 },
            clipPath: { duration: 0.45, ease: CINEMATIC, delay: 0.65 },
          }}
        >
          n
        </motion.span>

        {/* Light sweep — fixed-width beam for crisp shine on every screen */}
        <motion.div
          className="absolute top-0 h-full pointer-events-none"
          style={{
            width: 100,
            background: 'linear-gradient(90deg, transparent 0%, rgba(170,235,0,0.12) 30%, rgba(255,255,255,0.08) 48%, transparent 70%)',
            filter: 'blur(6px)',
            left: -100,
          }}
          initial={{ opacity: 0 }}
          animate={{
            x: phase === 'sweep' || phase === 'tagline' ? [0, 500] : 0,
            opacity: phase === 'sweep' || phase === 'tagline' ? [0, 1, 0.6, 0] : 0,
          }}
          transition={{
            x: { duration: 0.8, ease: CINEMATIC },
            opacity: { duration: 0.5, ease: 'easeInOut' },
          }}
        />
      </div>

      {/* Electric streak */}
      <motion.div
        className="relative z-10 mt-2 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, var(--green), transparent)', width: 280 }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{
          scaleX: phase === 'curtain' || phase === 'build' ? 0 : phase === 'flash' ? 1 : 0.6,
          opacity: phase === 'curtain' || phase === 'build' ? 0 : phase === 'flash' ? 0.7 : 0.2,
        }}
        transition={{
          scaleX: { duration: 0.5, ease: CINEMATIC, delay: 0.7 },
          opacity: { duration: 0.3, ease: 'easeInOut' },
        }}
      />

      {/* Tagline */}
      <AnimatePresence mode="wait">
        {(phase === 'tagline' || phase === 'out') && (
          <motion.div
            key="tagline"
            className="relative z-10 mt-3 sm:mt-6 flex gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5, ease: CINEMATIC }}
          >
            {['Play.', 'Compete.', 'Conquer.'].map((word, i) => (
              <motion.span
                key={word}
                className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase select-none block"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * i, duration: 0.35, ease: CINEMATIC }}
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading dots */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'out' ? 0 : 0.4 }}
        transition={{ duration: 0.3 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--green)' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};
