'use client';

import { motion } from 'framer-motion';

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
      style={{ background: 'linear-gradient(180deg, #0D1B3E 0%, #080F22 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
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
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontFamily: 'Cinzel, serif', color: '#F5F0E8', lineHeight: 1.25 }}
            >
              We Work With All
              <br />
              <span className="gold-text">UAE Banks & Financial</span>
              <br />
              <span style={{ color: '#F5F0E8' }}>Institutions</span>
            </h2>
            <div className="gold-divider" style={{ margin: '0 0 20px' }} />
            <p
              style={{ color: '#7A8699', fontSize: '0.88rem', lineHeight: 1.75, fontFamily: 'Josefin Sans', letterSpacing: '0.04em', maxWidth: '420px' }}
            >
              Our clients describe us as a professional, knowledgeable team that
              guides them successfully through the complexities of the mortgage
              process — securing offers no single bank can match.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { n: '25+', l: 'Bank Partners' },
                { n: '100%', l: 'Success Rate' },
                { n: '48hrs', l: 'Pre-Approval' },
                { n: 'Free', l: 'Broker Service' },
              ].map((s) => (
                <div key={s.l} className="flex flex-col gap-1">
                  <span className="gold-text font-bold" style={{ fontSize: '1.4rem', fontFamily: 'Cinzel, serif' }}>{s.n}</span>
                  <span style={{ fontSize: '0.7rem', color: '#7A8699', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Josefin Sans' }}>{s.l}</span>
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
                      color: '#9BA5B4',
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
