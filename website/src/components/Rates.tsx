'use client';

import { motion } from 'framer-motion';
import { TrendingDown } from 'lucide-react';
import PalmJumeirahSVG from './PalmJumeirahSVG';

const rates = [
  { label: 'Variable Rate', rate: '0.55%', sub: '+ 3M EIBOR', featured: true },
  { label: '1 Year Fixed', rate: '3.75%', sub: 'Fixed Period', featured: false },
  { label: '2 Years Fixed', rate: '3.79%', sub: 'Fixed Period', featured: false },
  { label: '3 Years Fixed', rate: '3.95%', sub: 'Fixed Period', featured: false },
  { label: '5 Years Fixed', rate: '4.19%', sub: 'Fixed Period', featured: false },
];

export default function Rates() {
  return (
    <section
      id="rates"
      className="py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1A0C03 0%, #0D0600 100%)' }}
    >
      {/* Decorative arc */}
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '300px',
          borderRadius: '50%',
          border: '1px solid rgba(212,165,116,0.07)',
        }}
      />

      {/* Palm Jumeirah decorative landmark */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
        style={{ zIndex: 0, opacity: 0.12 }}
      >
        <PalmJumeirahSVG size={200} />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="section-label mb-4">Live Market Rates</p>
          <h2
            className="font-bold mb-5"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontFamily: 'Cinzel, serif', color: '#F5E6C8' }}
          >
            Mortgage Solutions
            <br />
            <span className="gold-text">As Flexible As You Wish</span>
          </h2>
          <div className="gold-divider mb-5" />
          <p
            className="max-w-xl mx-auto leading-relaxed"
            style={{ color: '#9B8570', fontSize: '0.88rem', letterSpacing: '0.04em', fontFamily: 'Josefin Sans' }}
          >
            Our team works closely with you to understand your circumstances, then
            negotiates the best available rates across our network of 18+ lenders.
          </p>
        </motion.div>

        {/* Rate cards */}
        <div className="flex flex-wrap justify-center gap-4">
          {rates.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] }}
              className="rate-card w-full sm:w-[45%] lg:w-[18%]"
              style={r.featured ? {
                background: 'linear-gradient(145deg, rgba(212,165,116,0.12), rgba(212,165,116,0.04))',
                borderColor: 'rgba(212,165,116,0.5)',
              } : {}}
            >
              {r.featured && (
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }}
                />
              )}
              <TrendingDown
                size={20}
                style={{ color: '#D4A574', margin: '0 auto 12px', opacity: r.featured ? 1 : 0.5 }}
                aria-hidden="true"
              />
              <div
                className={`font-bold mb-1 ${r.featured ? 'gold-shimmer' : 'gold-text'}`}
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', fontFamily: 'Cinzel, serif' }}
              >
                {r.rate}
              </div>
              <div
                style={{ fontSize: '0.68rem', color: '#D4A574', letterSpacing: '0.12em', fontFamily: 'Josefin Sans', textTransform: 'uppercase', marginBottom: '6px' }}
              >
                {r.sub}
              </div>
              <div
                style={{ fontSize: '0.75rem', color: '#9B8570', letterSpacing: '0.05em', fontFamily: 'Josefin Sans' }}
              >
                {r.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-8"
          style={{ fontSize: '0.68rem', color: '#4A5568', letterSpacing: '0.06em', fontFamily: 'Josefin Sans' }}
        >
          * Rates are indicative and subject to individual circumstances, property type, and lender approval.
          Contact us for a personalised rate assessment.
        </motion.p>
      </div>
    </section>
  );
}
