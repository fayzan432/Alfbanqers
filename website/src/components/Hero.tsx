'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Star } from 'lucide-react';
import BurjKhalifaSVG from './BurjKhalifaSVG';

const stats = [
  { value: '25+', label: 'UAE Bank Partners' },
  { value: '5,000+', label: 'Happy Clients' },
  { value: '15+', label: 'Years Experience' },
  { value: 'AED 2B+', label: 'Mortgages Funded' },
];

function Stars() {
  const stars = useRef<Array<{ x: number; y: number; size: number; delay: number }>>([]);

  if (stars.current.length === 0) {
    for (let i = 0; i < 80; i++) {
      stars.current.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        delay: Math.random() * 5,
      });
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {stars.current.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function GoldParticles() {
  const particles = useRef<Array<{ x: number; size: number; duration: number; delay: number }>>([]);

  if (particles.current.length === 0) {
    for (let i = 0; i < 18; i++) {
      particles.current.push({
        x: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 8,
      });
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.current.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: '0',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: 'rgba(201,162,87,0.7)',
            animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const scrollDown = () => {
    document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #050C1E 0%, #0D1B3E 45%, #080F22 100%)' }}
    >
      {mounted && <Stars />}
      {mounted && <GoldParticles />}

      {/* Radial glow behind tower */}
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          right: '8%',
          bottom: 0,
          width: '420px',
          height: '70%',
          background: 'radial-gradient(ellipse at center bottom, rgba(201,162,87,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Burj Khalifa */}
      <div
        className="absolute bottom-0 pointer-events-none"
        aria-hidden="true"
        style={{ right: '6%', width: 'clamp(120px, 18vw, 260px)', zIndex: 1 }}
      >
        <BurjKhalifaSVG className="burj-glow w-full h-auto" />
      </div>

      {/* Horizon line */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        aria-hidden="true"
        style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(201,162,87,0.3) 30%, rgba(201,162,87,0.6) 60%, rgba(201,162,87,0.2) 85%, transparent 100%)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-28 w-full">
        <div className="max-w-3xl">
          {/* Pre-heading label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="flex items-center gap-3 mb-8"
          >
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
            <span className="section-label">Dubai&apos;s Premier Mortgage Broker</span>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
            className="font-bold leading-tight mb-6"
            style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)', fontFamily: 'Cinzel, serif' }}
          >
            <span style={{ color: '#F5F0E8' }}>Your Dream Home</span>
            <br />
            <span className="gold-shimmer">In The Heart of Dubai</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="mb-10 max-w-xl leading-relaxed"
            style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)', color: '#9BA5B4', fontFamily: 'Josefin Sans, sans-serif', letterSpacing: '0.03em' }}
          >
            Access 25+ UAE banks, negotiate exclusive rates, and secure the mortgage
            that fits your life — all with zero broker fees and dedicated expert guidance.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: 'easeOut' }}
            className="flex flex-wrap gap-4 mb-16"
          >
            <button
              onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-gold px-8 py-4 text-xs rounded-sm"
              aria-label="Get your free mortgage consultation"
            >
              Free Consultation
            </button>
            <button
              onClick={() => document.querySelector('#rates')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-outline px-8 py-4 text-xs rounded-sm"
              aria-label="View current mortgage rates"
            >
              View Live Rates
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <div
                  style={{ marginBottom: '4px', height: '2px', width: '28px', background: 'var(--gold)', opacity: 0.6 }}
                />
                <span
                  className="gold-text font-bold"
                  style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontFamily: 'Cinzel, serif' }}
                >
                  {stat.value}
                </span>
                <span
                  style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: '#7A8699', fontFamily: 'Josefin Sans, sans-serif', textTransform: 'uppercase' }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollDown}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        style={{ color: 'rgba(201,162,87,0.5)', zIndex: 10 }}
        aria-label="Scroll down to services"
      >
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.3em', fontFamily: 'Josefin Sans', textTransform: 'uppercase' }}>Explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={16} />
        </motion.div>
      </motion.button>

      {/* Rating badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.7 }}
        className="absolute top-28 right-6 lg:right-12 hidden sm:flex flex-col items-center gap-1 z-10"
        style={{ padding: '14px 18px', background: 'rgba(201,162,87,0.08)', border: '1px solid rgba(201,162,87,0.25)', borderRadius: '4px' }}
      >
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} fill="#C9A257" stroke="none" />
          ))}
        </div>
        <span style={{ fontSize: '0.65rem', color: '#C9A257', letterSpacing: '0.1em', fontFamily: 'Josefin Sans' }}>RERA CERTIFIED</span>
        <span style={{ fontSize: '0.6rem', color: '#7A8699', letterSpacing: '0.05em', fontFamily: 'Josefin Sans' }}>Trusted Broker</span>
      </motion.div>
    </section>
  );
}
