'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const alfBanqBenefits = [
  'Access to all lenders in the UAE',
  'Consolidated view on suitable products',
  'Solutions for all types of financial needs',
  'Ability to negotiate special offers',
  'Long-term client relationship',
  'Experienced Case Management Department',
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
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(192,192,192,0.04) 0%, transparent 70%)' }}
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
            We have more than 3,500+ happy customers
          </p>
        </motion.div>

        {/* ALF BANQ advantages */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-2xl mx-auto rounded-sm overflow-hidden"
          style={{ background: 'rgba(192,192,192,0.05)', border: '1px solid rgba(192,192,192,0.3)' }}
        >
          <div
            className="px-6 py-5 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(192,192,192,0.15), rgba(192,192,192,0.05))', borderBottom: '1px solid rgba(192,192,192,0.25)' }}
          >
            <span
              className="font-bold gold-text"
              style={{ fontSize: '1rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.12em' }}
            >
              ALF BANQ
            </span>
            <p style={{ fontSize: '0.68rem', color: '#C0C0C0', letterSpacing: '0.15em', fontFamily: 'Josefin Sans', marginTop: '4px' }}>
              MORTGAGE BROKER
            </p>
          </div>
          <div className="px-6 py-6 grid sm:grid-cols-2 gap-4">
            {alfBanqBenefits.map((benefit, i) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 size={18} style={{ color: '#C0C0C0', flexShrink: 0, marginTop: '1px' }} aria-hidden="true" />
                <span style={{ fontSize: '0.82rem', color: '#C8C0B0', fontFamily: 'Josefin Sans', lineHeight: 1.55 }}>
                  {benefit}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
