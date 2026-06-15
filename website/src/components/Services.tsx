'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Home, Building2, MapPin, Users, TrendingUp, RotateCcw, Globe, RefreshCw, UserX, Hammer, BarChart3, Moon } from 'lucide-react';

const services = [
  { icon: Home, title: 'Residential Mortgage', desc: 'Bespoke home loan solutions for UAE residents and expats with competitive fixed and variable rates.' },
  { icon: Building2, title: 'Commercial Property', desc: 'Financing for offices, retail spaces, and mixed-use developments across the UAE.' },
  { icon: MapPin, title: 'Plot & Land Loans', desc: 'Secure your ideal plot in Dubai\'s most sought-after communities with tailored land financing.' },
  { icon: Users, title: 'UAE / GCC Nationals', desc: 'Specialist mortgage products designed exclusively for UAE and GCC national buyers.' },
  { icon: TrendingUp, title: 'Mega Loans', desc: 'High-value mortgage solutions for luxury properties exceeding standard lending thresholds.' },
  { icon: RotateCcw, title: 'Equity Release', desc: 'Unlock the value in your existing property to fund new investments or personal goals.' },
  { icon: Globe, title: 'International Mortgages', desc: 'Cross-border financing for international investors purchasing property in the UAE.' },
  { icon: RefreshCw, title: 'Balance Transfer', desc: 'Switch your existing mortgage to a more competitive rate and reduce your monthly payments.' },
  { icon: UserX, title: 'Non-Resident Mortgages', desc: 'Dedicated financing solutions for overseas buyers investing in UAE real estate.' },
  { icon: Hammer, title: 'Under Construction', desc: 'Off-plan property financing with flexible payment structures aligned to developer milestones.' },
  { icon: BarChart3, title: 'Portfolio Consolidation', desc: 'Streamline multiple property mortgages into a single, optimised financing structure.' },
  { icon: Moon, title: 'Islamic Finance', desc: 'Sharia-compliant Murabaha and Ijara mortgage structures from leading Islamic banks.' },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] } },
};

export default function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="services"
      className="py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #080F22 0%, #0D1B3E 100%)' }}
    >
      {/* Background grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage: 'linear-gradient(rgba(201,162,87,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,87,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="section-label mb-4">What We Offer</p>
          <h2
            className="font-bold mb-5"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontFamily: 'Cinzel, serif', color: '#F5F0E8' }}
          >
            Mortgage Solutions
            <br />
            <span className="gold-text">Tailored to You</span>
          </h2>
          <div className="gold-divider mb-5" />
          <p
            className="max-w-xl mx-auto leading-relaxed"
            style={{ color: '#7A8699', fontSize: '0.9rem', letterSpacing: '0.04em', fontFamily: 'Josefin Sans' }}
          >
            From first-time buyers to seasoned investors, we structure the right
            financing solution for every property ambition.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <motion.div key={svc.title} variants={cardVariants} className="service-card group cursor-default">
                <div
                  className="mb-4 w-11 h-11 flex items-center justify-center rounded-sm transition-colors duration-300"
                  style={{ background: 'rgba(201,162,87,0.08)', border: '1px solid rgba(201,162,87,0.2)' }}
                >
                  <Icon
                    size={20}
                    className="transition-colors duration-300"
                    style={{ color: '#C9A257' }}
                    aria-hidden="true"
                  />
                </div>
                <h3
                  className="mb-2 font-semibold"
                  style={{ fontSize: '0.85rem', fontFamily: 'Cinzel, serif', color: '#F5F0E8', letterSpacing: '0.05em' }}
                >
                  {svc.title}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#7A8699', lineHeight: 1.65, fontFamily: 'Josefin Sans' }}>
                  {svc.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
