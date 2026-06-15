'use client';

import { motion } from 'framer-motion';
import { TrendingDown } from 'lucide-react';

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
      style={{ background: 'linear-gradient(180deg, #0D1B3E 0%, #080F22 100%)' }}
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
          border: '1px solid rgba(201,162,87,0.07)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
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
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontFamily: 'Cinzel, serif', color: '#F5F0E8' }}
          >
            Mortgage Solutions
            <br />
            <span className="gold-text">As Flexible As You Wish</span>
          </h2>
          <div className="gold-divider mb-5" />
          <p
            className="max-w-xl mx-auto leading-relaxed"
            style={{ color: '#7A8699', fontSize: '0.88rem', letterSpacing: '0.04em', fontFamily: 'Josefin Sans' }}
          >
            Our team works closely with you to understand your circumstances, then
            negotiates the best available rates across our network of 25+ lenders.
          </p>
        </motion.div>

        {/* Rate cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {rates.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
              className="rate-card"
              style={r.featured ? {
                background: 'linear-gradient(145deg, rgba(201,162,87,0.12), rgba(201,162,87,0.04))',
                borderColor: 'rgba(201,162,87,0.5)',
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
                style={{ color: '#C9A257', margin: '0 auto 12px', opacity: r.featured ? 1 : 0.5 }}
                aria-hidden="true"
              />
              <div
                className={`font-bold mb-1 ${r.featured ? 'gold-shimmer' : 'gold-text'}`}
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', fontFamily: 'Cinzel, serif' }}
              >
                {r.rate}
              </div>
              <div
                style={{ fontSize: '0.68rem', color: '#C9A257', letterSpacing: '0.12em', fontFamily: 'Josefin Sans', textTransform: 'uppercase', marginBottom: '6px' }}
              >
                {r.sub}
              </div>
              <div
                style={{ fontSize: '0.75rem', color: '#7A8699', letterSpacing: '0.05em', fontFamily: 'Josefin Sans' }}
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
