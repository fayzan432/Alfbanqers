'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

const alfBanqBenefits = [
  'Access to all lenders in the UAE',
  'Consolidated view on suitable products',
  'Solutions for all types of financial needs',
  'Ability to negotiate special offers',
  'Long-term client relationship',
  'Experienced Case Management Department',
];

const directBankDrawbacks = [
  'Limited mortgage options',
  'Less flexible solutions',
  'May not get the lowest rates',
  'May not support all client profiles',
  'Standard lending criteria only',
  'Limited knowledge outside standard products',
];

export default function WhyChoose() {
  return (
    <section
      id="why-us"
      className="py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #080F22 0%, #0D1B3E 60%, #080F22 100%)' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(201,162,87,0.04) 0%, transparent 70%)' }}
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
          <p className="section-label mb-4">The ALF BANQ Advantage</p>
          <h2
            className="font-bold mb-5"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontFamily: 'Cinzel, serif', color: '#F5F0E8' }}
          >
            Why Choose
            <br />
            <span className="gold-text">ALF BANQ Mortgage?</span>
          </h2>
          <div className="gold-divider mb-5" />
          <p
            className="max-w-xl mx-auto"
            style={{ color: '#7A8699', fontSize: '0.88rem', letterSpacing: '0.04em', fontFamily: 'Josefin Sans', lineHeight: 1.7 }}
          >
            ALF BANQ vs Going Direct to a Bank — we have more than 5,000+ happy customers
          </p>
        </motion.div>

        {/* Comparison */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* ALF BANQ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="rounded-sm overflow-hidden"
            style={{ background: 'rgba(201,162,87,0.05)', border: '1px solid rgba(201,162,87,0.3)' }}
          >
            <div
              className="px-6 py-5 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(201,162,87,0.15), rgba(201,162,87,0.05))', borderBottom: '1px solid rgba(201,162,87,0.25)' }}
            >
              <span
                className="font-bold gold-text"
                style={{ fontSize: '1rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.12em' }}
              >
                ALF BANQ
              </span>
              <p style={{ fontSize: '0.68rem', color: '#C9A257', letterSpacing: '0.15em', fontFamily: 'Josefin Sans', marginTop: '4px' }}>
                MORTGAGE BROKER
              </p>
            </div>
            <div className="px-6 py-6 flex flex-col gap-4">
              {alfBanqBenefits.map((benefit, i) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 size={18} style={{ color: '#C9A257', flexShrink: 0, marginTop: '1px' }} aria-hidden="true" />
                  <span style={{ fontSize: '0.82rem', color: '#C8C0B0', fontFamily: 'Josefin Sans', lineHeight: 1.55 }}>
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* VS badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center gap-6 py-8"
          >
            <div
              className="flex items-center justify-center rounded-full font-bold relative"
              style={{
                width: '90px',
                height: '90px',
                background: 'linear-gradient(145deg, #152247, #0D1B3E)',
                border: '2px solid rgba(201,162,87,0.4)',
                fontSize: '1.3rem',
                fontFamily: 'Cinzel, serif',
                color: '#F5F0E8',
              }}
            >
              <div
                className="absolute rounded-full"
                style={{
                  inset: '-6px',
                  border: '1px solid rgba(201,162,87,0.15)',
                  animation: 'pulse-ring 3s ease-out infinite',
                }}
              />
              VS
            </div>
            <div className="text-center">
              <p style={{ fontSize: '0.7rem', color: '#4A5568', letterSpacing: '0.15em', fontFamily: 'Josefin Sans', textTransform: 'uppercase' }}>
                5,000+
              </p>
              <p className="gold-text" style={{ fontSize: '0.65rem', letterSpacing: '0.2em', fontFamily: 'Josefin Sans', textTransform: 'uppercase' }}>
                Happy Clients
              </p>
            </div>
          </motion.div>

          {/* Direct Bank */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="rounded-sm overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div
              className="px-6 py-5 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span
                className="font-bold"
                style={{ fontSize: '1rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.12em', color: '#7A8699' }}
              >
                Direct Bank
              </span>
            </div>
            <div className="px-6 py-6 flex flex-col gap-4">
              {directBankDrawbacks.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="flex items-start gap-3"
                >
                  <XCircle size={18} style={{ color: '#4A5568', flexShrink: 0, marginTop: '1px' }} aria-hidden="true" />
                  <span style={{ fontSize: '0.82rem', color: '#5A6275', fontFamily: 'Josefin Sans', lineHeight: 1.55 }}>
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
