'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

const loanTypes = [
  'Residential Mortgage', 'Commercial Property', 'Plot & Land Loan',
  'Equity Release', 'Balance Transfer', 'Islamic Finance', 'Other',
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      className="py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #080F22 0%, #0D1B3E 100%)' }}
    >
      {/* Corner decoration */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        aria-hidden="true"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle at top right, rgba(201,162,87,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20">
          {/* Left: info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.75 }}
          >
            <p className="section-label mb-4">Get In Touch</p>
            <h2
              className="font-bold mb-5"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontFamily: 'Cinzel, serif', color: '#F5F0E8', lineHeight: 1.25 }}
            >
              Start Your
              <br />
              <span className="gold-text">Mortgage Journey</span>
            </h2>
            <div className="gold-divider" style={{ margin: '0 0 24px' }} />
            <p
              style={{ color: '#7A8699', fontSize: '0.88rem', lineHeight: 1.75, fontFamily: 'Josefin Sans', maxWidth: '400px' }}
            >
              Speak to one of our expert advisors today. We offer a no-obligation
              consultation to assess your eligibility and find the best mortgage
              option available for your circumstances.
            </p>

            <div className="mt-10 flex flex-col gap-6">
              {[
                { icon: Phone, label: 'Call Us', value: '+971 XX XXX XXXX', href: 'tel:+971000000000' },
                { icon: MessageCircle, label: 'WhatsApp', value: '+971 XX XXX XXXX', href: 'https://wa.me/971000000000' },
                { icon: Mail, label: 'Email', value: 'info@alfbanq.ae', href: 'mailto:info@alfbanq.ae' },
                { icon: MapPin, label: 'Office', value: 'Dubai, United Arab Emirates', href: undefined },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-sm flex-shrink-0"
                    style={{ background: 'rgba(201,162,87,0.08)', border: '1px solid rgba(201,162,87,0.2)' }}
                  >
                    <Icon size={16} style={{ color: '#C9A257' }} aria-hidden="true" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.65rem', color: '#C9A257', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Josefin Sans', marginBottom: '2px' }}>
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        style={{ fontSize: '0.85rem', color: '#C8C0B0', fontFamily: 'Josefin Sans', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#E8C97A')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#C8C0B0')}
                      >
                        {value}
                      </a>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: '#C8C0B0', fontFamily: 'Josefin Sans' }}>{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.75 }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center h-full min-h-[420px] gap-5 rounded-sm p-8 text-center"
                style={{ border: '1px solid rgba(201,162,87,0.3)', background: 'rgba(201,162,87,0.04)' }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(201,162,87,0.12)', border: '2px solid rgba(201,162,87,0.4)' }}
                >
                  <Send size={28} style={{ color: '#C9A257' }} aria-hidden="true" />
                </div>
                <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.3rem', color: '#F5F0E8' }}>
                  Message Received
                </h3>
                <p style={{ color: '#7A8699', fontSize: '0.85rem', fontFamily: 'Josefin Sans', lineHeight: 1.7, maxWidth: '300px' }}>
                  Thank you for reaching out. One of our senior mortgage advisors
                  will be in touch within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-outline px-6 py-3 text-xs rounded-sm mt-2"
                >
                  Send Another
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                aria-label="Mortgage enquiry form"
                className="flex flex-col gap-4"
                style={{ padding: '36px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,162,87,0.15)', borderRadius: '4px' }}
              >
                <div
                  className="text-center mb-2"
                  style={{ borderBottom: '1px solid rgba(201,162,87,0.12)', paddingBottom: '20px' }}
                >
                  <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: '#F5F0E8', letterSpacing: '0.08em' }}>
                    Free Consultation Request
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: '#7A8699', fontFamily: 'Josefin Sans', letterSpacing: '0.05em', marginTop: '4px' }}>
                    No obligation — our service is completely free
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      style={{ display: 'block', fontSize: '0.68rem', color: '#C9A257', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Josefin Sans', marginBottom: '6px' }}
                    >
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      style={{ display: 'block', fontSize: '0.68rem', color: '#C9A257', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Josefin Sans', marginBottom: '6px' }}
                    >
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="+971 XX XXX XXXX"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    style={{ display: 'block', fontSize: '0.68rem', color: '#C9A257', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Josefin Sans', marginBottom: '6px' }}
                  >
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="type"
                    style={{ display: 'block', fontSize: '0.68rem', color: '#C9A257', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Josefin Sans', marginBottom: '6px' }}
                  >
                    Mortgage Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="input-field"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="" style={{ background: '#0D1B3E' }}>Select mortgage type</option>
                    {loanTypes.map((t) => (
                      <option key={t} value={t} style={{ background: '#0D1B3E' }}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    style={{ display: 'block', fontSize: '0.68rem', color: '#C9A257', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Josefin Sans', marginBottom: '6px' }}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    className="input-field resize-none"
                    placeholder="Tell us about your property and requirements..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-gold px-8 py-4 text-xs rounded-sm w-full mt-2 gap-2"
                >
                  <Send size={14} aria-hidden="true" />
                  Submit Enquiry
                </button>

                <p style={{ fontSize: '0.65rem', color: '#4A5568', textAlign: 'center', fontFamily: 'Josefin Sans', letterSpacing: '0.04em' }}>
                  By submitting you agree to our privacy policy. We never share your data.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
