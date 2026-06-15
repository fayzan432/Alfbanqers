'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Rates', href: '#rates' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Banks', href: '#banks' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'nav-scrolled' : 'bg-transparent'}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            aria-label="ALF BANQ Mortgage Broker home"
          >
            <div className="flex flex-col leading-none">
              <span
                className="font-bold tracking-[0.25em] text-lg"
                style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8' }}
              >
                ALF BANQ
              </span>
              <span
                className="text-[0.52rem] tracking-[0.45em] uppercase"
                style={{ color: '#C9A257' }}
              >
                ── Mortgage Broker ──
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-xs tracking-[0.2em] uppercase transition-colors duration-200 cursor-pointer"
                style={{ color: '#9BA5B4', fontFamily: 'Josefin Sans, sans-serif', fontWeight: 500 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A257')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9BA5B4')}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+971000000000"
              className="flex items-center gap-2 text-xs tracking-wider uppercase transition-colors duration-200"
              style={{ color: '#C9A257' }}
            >
              <Phone size={14} />
              <span style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 600 }}>+971 XX XXX XXXX</span>
            </a>
            <button
              onClick={() => handleNavClick('#contact')}
              className="btn-gold px-6 py-3 text-xs rounded-sm"
            >
              Get Free Advice
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-sm transition-colors duration-200"
            style={{ color: '#C9A257' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className="lg:hidden overflow-hidden transition-all duration-400"
        style={{
          maxHeight: menuOpen ? '400px' : '0',
          background: 'rgba(8, 15, 34, 0.98)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="px-6 py-6 flex flex-col gap-5 border-t border-gold" style={{ borderColor: 'rgba(201,162,87,0.2)' }}>
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-left text-sm tracking-[0.2em] uppercase py-1 transition-colors duration-200"
              style={{ color: '#9BA5B4', fontFamily: 'Josefin Sans, sans-serif' }}
            >
              {link.label}
            </button>
          ))}
          <div className="h-gold-line my-1" />
          <button
            onClick={() => handleNavClick('#contact')}
            className="btn-gold px-6 py-3 text-xs rounded-sm w-full mt-1"
          >
            Get Free Advice
          </button>
        </div>
      </div>
    </nav>
  );
}
