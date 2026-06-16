'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import BurjKhalifaSVG from './BurjKhalifaSVG';

const stats = [
  { value: '18+', label: 'UAE Bank Partners' },
  { value: '3,500+', label: 'Happy Clients' },
  { value: '16+', label: 'Years Experience' },
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

function SandParticles() {
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
            background: 'rgba(212,165,116,0.8)',
            animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function SandStreams() {
  const streams = Array.from({length: 12}, (_, i) => ({
    top: 10 + i * 7,
    delay: i * 0.8,
    duration: 8 + (i % 4) * 3,
    opacity: 0.06 + (i % 3) * 0.04,
    height: 1 + (i % 3),
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {streams.map((s, i) => (
        <div
          key={i}
          className="absolute w-[200%]"
          style={{
            top: `${s.top}%`,
            height: `${s.height}px`,
            background: `linear-gradient(90deg, transparent 0%, rgba(212,165,116,${s.opacity}) 20%, rgba(240,200,120,${s.opacity * 1.5}) 50%, rgba(212,165,116,${s.opacity}) 80%, transparent 100%)`,
            animation: `sand-drift ${s.duration}s linear ${s.delay}s infinite`,
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
      style={{ background: 'linear-gradient(160deg, #050100 0%, #1A0C03 45%, #0D0600 100%)' }}
    >
      {mounted && <Stars />}
      {mounted && <SandParticles />}
      {mounted && <SandStreams />}

      {/* Radial glow behind tower */}
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          right: '8%',
          bottom: 0,
          width: '420px',
          height: '70%',
          background: 'radial-gradient(ellipse at center bottom, rgba(212,165,116,0.12) 0%, transparent 70%)',
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
          background: 'linear-gradient(90deg, transparent 0%, rgba(212,165,116,0.3) 30%, rgba(212,165,116,0.6) 60%, rgba(212,165,116,0.2) 85%, transparent 100%)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-28 w-full">
        <div className="max-w-3xl">
          {/* Pre-heading label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] }}
            className="flex items-center gap-3 mb-8"
          >
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
            <span className="section-label">UAE&apos;s Premier Mortgage Broker</span>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] }}
            className="font-bold leading-tight mb-6"
            style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)', fontFamily: 'Cinzel, serif' }}
          >
            <span style={{ color: '#F5E6C8' }}>Your Dream Home</span>
            <br />
            <span className="gold-shimmer">In The Heart of UAE</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] }}
            className="mb-10 max-w-xl leading-relaxed"
            style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)', color: '#9B8570', fontFamily: 'Josefin Sans, sans-serif', letterSpacing: '0.03em' }}
          >
            Access 18+ UAE banks, negotiate exclusive rates, and secure the mortgage
            that fits your requirements — all with zero broker fees and dedicated expert guidance.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] }}
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
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] }}
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
                  style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: '#9B8570', fontFamily: 'Josefin Sans, sans-serif', textTransform: 'uppercase' }}
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
        style={{ color: 'rgba(212,165,116,0.5)', zIndex: 10 }}
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

      {/* Desert dune silhouette */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden" aria-hidden="true" style={{height: '120px', zIndex: 0}}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{width:'100%',height:'100%'}}>
          <defs>
            <linearGradient id="duneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3D1F0A" stopOpacity="0"/>
              <stop offset="60%" stopColor="#1A0C03" stopOpacity="0.7"/>
              <stop offset="100%" stopColor="#0D0600" stopOpacity="1"/>
            </linearGradient>
          </defs>
          <path d="M0,80 Q180,20 360,60 Q540,100 720,40 Q900,0 1080,50 Q1260,90 1440,30 L1440,120 L0,120 Z" fill="url(#duneGrad)"/>
          <path d="M0,100 Q240,60 480,85 Q720,110 960,70 Q1200,40 1440,80 L1440,120 L0,120 Z" fill="#0D0600" opacity="0.8"/>
        </svg>
      </div>
    </section>
  );
}
