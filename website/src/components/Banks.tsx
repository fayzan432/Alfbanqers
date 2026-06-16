'use client';

import { motion } from 'framer-motion';
import DubaiFrameSVG from './DubaiFrameSVG';

const banks = [
  'ADIB', 'Ajman Bank', 'Commercial Bank of Dubai', 'Dubai Islamic Bank',
  'Emirates NBD', 'HSBC', 'Mashreq', 'United Arab Bank',
  'National Bank of Fujairah', 'RAKBANK', 'Standard Chartered', 'First Abu Dhabi Bank',
  'Emirates Islamic', 'Sharjah Islamic Bank', 'Arab Bank', 'Bank of Baroda',
  'NBQ', 'SNB',
];

export default function Banks() {
  return (
    <section
      id="banks"
      className="py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1A0C03 0%, #0D0600 100%)' }}
    >
      {/* Dubai Frame decorative landmark - left side */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
        style={{ zIndex: 0, opacity: 0.12 }}
      >
        <DubaiFrameSVG size={160} />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.75 }}
          >
            <p className="section-label mb-4">Our Network</p>
            <h2
              className="font-bold mb-6"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontFamily: 'Cinzel, serif', color: '#F5E6C8', lineHeight: 1.25 }}
            >
              We Work With All
              <br />
              <span className="gold-text">UAE Banks & Financial</span>
              <br />
              <span style={{ color: '#F5E6C8' }}>Institutions</span>
            </h2>
            <div className="gold-divider" style={{ margin: '0 0 20px' }} />
            <p
              style={{ color: '#9B8570', fontSize: '0.88rem', lineHeight: 1.75, fontFamily: 'Josefin Sans', letterSpacing: '0.04em', maxWidth: '420px' }}
            >
              Our clients describe us as a professional, knowledgeable team that
              guides them successfully through the complexities of the mortgage
              process — securing offers no single bank can match.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { n: '18+', l: 'Bank Lenders' },
                { n: 'Excellent', l: 'Success Rate' },
                { n: '48 Hours', l: 'Fast Pre Approval' },
                { n: 'Free', l: 'Broker Service' },
              ].map((s) => (
                <div key={s.l} className="flex flex-col gap-1">
                  <span className="gold-text font-bold" style={{ fontSize: '1.4rem', fontFamily: 'Cinzel, serif' }}>{s.n}</span>
                  <span style={{ fontSize: '0.7rem', color: '#9B8570', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Josefin Sans' }}>{s.l}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: bank logos grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.75 }}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {banks.map((bank, i) => (
                <motion.div
                  key={bank}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="bank-card"
                  role="img"
                  aria-label={bank}
                >
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontFamily: 'Josefin Sans, sans-serif',
                      fontWeight: 600,
                      color: '#9B8570',
                      letterSpacing: '0.05em',
                      textAlign: 'center',
                      lineHeight: 1.4,
                    }}
                  >
                    {bank}
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
