'use client';

import { Phone, Mail, MapPin } from 'lucide-react';
import AlfBanqMark from './AlfBanqMark';
import { PHONE, PHONE_TEL, EMAIL } from '@/lib/constants';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: '#040912', borderTop: '1px solid rgba(192,192,192,0.15)' }}
      role="contentinfo"
    >
      {/* Top gold line */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, rgba(192,192,192,0.6), transparent)' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <AlfBanqMark size={36} />
              <div>
                <div className="font-bold tracking-widest" style={{ fontFamily: 'Cinzel, serif', fontSize: '1.2rem', color: '#F5F0E8' }}>
                  ALF BANQ
                </div>
                <div style={{ fontSize: '0.55rem', letterSpacing: '0.45em', color: '#C0C0C0', marginTop: '2px', textTransform: 'uppercase' }}>
                  ── Mortgage Broker ──
                </div>
              </div>
            </div>
            <p style={{ color: '#5A6275', fontSize: '0.82rem', lineHeight: 1.75, fontFamily: 'Josefin Sans', maxWidth: '340px', marginTop: '12px' }}>
              UAE&apos;s trusted mortgage broker. We connect you to the UAE&apos;s leading
              banks, negotiate the best rates, and guide you seamlessly from enquiry
              to keys — completely free of charge.
            </p>
            <div className="flex flex-col gap-3 mt-6">
              {[
                { icon: Phone, text: PHONE, href: PHONE_TEL },
                { icon: Mail, text: EMAIL, href: `mailto:${EMAIL}` },
                { icon: MapPin, text: 'Dubai, United Arab Emirates', href: undefined },
              ].map(({ icon: Icon, text, href }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon size={13} style={{ color: '#C0C0C0', flexShrink: 0 }} aria-hidden="true" />
                  {href ? (
                    <a
                      href={href}
                      style={{ fontSize: '0.78rem', color: '#5A6275', fontFamily: 'Josefin Sans', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#C0C0C0')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#5A6275')}
                    >
                      {text}
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: '#5A6275', fontFamily: 'Josefin Sans' }}>{text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#C0C0C0', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Services
            </h3>
            <ul className="flex flex-col gap-2.5">
              {[
                'Residential Mortgage', 'Commercial Property', 'Plot & Land Loans',
                'Equity Release', 'Balance Transfer', 'Islamic Finance', 'Core and Shell Financing',
              ].map((s) => (
                <li key={s}>
                  <button
                    onClick={() => document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' })}
                    style={{ fontSize: '0.78rem', color: '#5A6275', fontFamily: 'Josefin Sans', transition: 'color 0.2s', cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#C0C0C0')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#5A6275')}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#C0C0C0', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'Mortgage Rates', href: '#rates' },
                { label: 'Why Choose Us', href: '#why-us' },
                { label: 'Bank Partners', href: '#banks' },
                { label: 'Free Consultation', href: '#contact' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <button
                    onClick={() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })}
                    style={{ fontSize: '0.78rem', color: '#5A6275', fontFamily: 'Josefin Sans', transition: 'color 0.2s', cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#C0C0C0')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#5A6275')}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>

            {/* RERA badge */}
            <div
              className="mt-8 inline-flex flex-col items-center gap-1"
              style={{ padding: '12px 16px', border: '1px solid rgba(192,192,192,0.2)', borderRadius: '4px' }}
            >
              <span style={{ fontSize: '0.58rem', color: '#C0C0C0', letterSpacing: '0.25em', fontFamily: 'Josefin Sans', textTransform: 'uppercase' }}>RERA Certified</span>
              <span style={{ fontSize: '0.6rem', color: '#5A6275', fontFamily: 'Josefin Sans' }}>Licensed Mortgage Broker</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p style={{ fontSize: '0.7rem', color: '#3A4255', fontFamily: 'Josefin Sans', letterSpacing: '0.06em' }}>
              © {year} ALF BANQ Mortgage Broker. All rights reserved.
            </p>
            <div className="flex gap-5">
              {['Privacy Policy', 'Terms of Service'].map((t) => (
                <button
                  key={t}
                  style={{ fontSize: '0.7rem', color: '#3A4255', fontFamily: 'Josefin Sans', cursor: 'pointer', background: 'none', border: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#C0C0C0')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#3A4255')}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
