'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck, Zap, CreditCard, ArrowRight, Eye, EyeOff, Lock, Scan } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />

      {/* Radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #d4ff4f 0%, transparent 70%)' }}
      />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#d4ff4f] flex items-center justify-center">
            <EyeOff size={16} className="text-[#0a0a0a]" />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }} className="text-lg tracking-tight text-white">
            FACE<span className="text-[#d4ff4f]">CENSOR</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard"
              className="px-5 py-2 bg-[#d4ff4f] text-[#0a0a0a] text-sm uppercase tracking-widest hover:bg-[#c0eb3a] transition-colors"
              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-[#888] hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/register"
                className="px-5 py-2 bg-[#d4ff4f] text-[#0a0a0a] text-sm uppercase tracking-widest hover:bg-[#c0eb3a] transition-colors"
                style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#d4ff4f]/30 bg-[#d4ff4f]/5 mb-8 anim-fade-up delay-0">
          <Scan size={12} className="text-[#d4ff4f]" />
          <span className="text-[#d4ff4f] text-xs tracking-widest uppercase" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
            AI-powered face detection
          </span>
        </div>

        <h1
          className="text-5xl md:text-7xl leading-[0.95] tracking-tight text-white mb-6 anim-fade-up delay-100"
          style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
          Censor faces.<br />
          <span className="text-[#d4ff4f]">Instantly.</span>
        </h1>

        <p className="text-[#888] text-lg md:text-xl font-light max-w-xl mx-auto mb-10 anim-fade-up delay-200">
          Upload any photo and automatically redact every face with pixel-perfect precision.
          Built for journalists, researchers, and privacy-conscious creators.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 anim-fade-up delay-300">
          <Link href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#d4ff4f] text-[#0a0a0a] uppercase tracking-widest text-sm hover:bg-[#c0eb3a] transition-colors group"
            style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Start free
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <span className="text-[#555] text-sm" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
            1 free credit on signup · no card required
          </span>
        </div>

        {/* Demo visual */}
        <div className="mt-16 relative mx-auto max-w-2xl anim-fade-up delay-500">
          <div className="border border-[#222] bg-[#111] p-2">
            <div className="border border-[#1a1a1a] aspect-video relative overflow-hidden flex items-center justify-center bg-[#0d0d0d]">
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#111] flex items-center justify-center">
                  <div className="flex gap-8 items-end opacity-40">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className="bg-[#333] rounded-full" style={{ width: `${36 + i * 8}px`, height: `${36 + i * 8}px` }} />
                        <div className="bg-[#222]" style={{ width: `${44 + i * 10}px`, height: `${64 + i * 12}px` }} />
                      </div>
                    ))}
                  </div>
                  {/* Censored faces overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex gap-8 items-end">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div
                            className="relative overflow-hidden"
                            style={{ width: `${36 + i * 8}px`, height: `${36 + i * 8}px`, background: '#d4ff4f' }}>
                            {/* Pixelation grid */}
                            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                              {Array.from({ length: 16 }).map((_, j) => (
                                <div key={j} style={{
                                  background: j % 3 === 0 ? '#b8e030' : j % 5 === 0 ? '#d4ff4f' : '#c0eb3a',
                                  opacity: 0.7 + (j % 3) * 0.1
                                }} />
                              ))}
                            </div>
                          </div>
                          <div className="bg-[#222] opacity-0" style={{ width: `${44 + i * 10}px`, height: `${64 + i * 12}px` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Scanlines */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)' }} />
              </div>
              {/* Status badge */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#0a0a0a]/90 px-2.5 py-1 border border-[#d4ff4f]/30">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4ff4f] pulse-lime" />
                <span className="text-[#d4ff4f] text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                  3 faces redacted
                </span>
              </div>
            </div>
          </div>
          <div className="absolute -top-3 -left-3 bg-[#d4ff4f] text-[#0a0a0a] text-xs px-2 py-0.5"
            style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 500 }}>
            PREVIEW
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 border-t border-[#1a1a1a]">
        <div className="mb-12">
          <div className="mb-4" style={{ height: '3px', width: '40px', background: '#d4ff4f' }} />
          <h2 className="text-3xl md:text-4xl text-white" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]">
          {[
            { icon: <Eye size={20} />, step: '01', title: 'Upload', desc: 'Drop any JPEG, PNG, or WebP. Up to 20MB per image.' },
            { icon: <Scan size={20} />, step: '02', title: 'Detect', desc: 'Our AI scans every face in milliseconds using OpenCV detection.' },
            { icon: <Lock size={20} />, step: '03', title: 'Censor', desc: 'Each face is pixelated with precise boundary detection.' },
          ].map((f, i) => (
            <div key={i} className="bg-[#0a0a0a] p-8 group hover:bg-[#0f0f0f] transition-colors">
              <div className="flex items-start justify-between mb-6">
                <div className="w-10 h-10 border border-[#d4ff4f]/40 flex items-center justify-center text-[#d4ff4f] group-hover:bg-[#d4ff4f]/10 transition-colors">
                  {f.icon}
                </div>
                <span className="text-[#282828] text-3xl" style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>{f.step}</span>
              </div>
              <h3 className="text-xl text-white mb-2" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{f.title}</h3>
              <p className="text-[#666] text-sm leading-relaxed font-light">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 border-t border-[#1a1a1a]">
        <div className="mb-12">
          <div className="mb-4" style={{ height: '3px', width: '40px', background: '#d4ff4f' }} />
          <h2 className="text-3xl md:text-4xl text-white" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Simple pricing
          </h2>
          <p className="text-[#555] mt-2 font-light">1 credit = 1 image. Start with 1 free, top up anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Starter', credits: 5, price: '$2.99', per: '$0.60/image', popular: false },
            { name: 'Pro', credits: 15, price: '$6.99', per: '$0.47/image', popular: true },
            { name: 'Business', credits: 50, price: '$18.99', per: '$0.38/image', popular: false },
          ].map((p, i) => (
            <div key={i} className={`relative border p-6 bg-[#111] ${p.popular ? 'border-[#d4ff4f]' : 'border-[#222]'}`}>
              {p.popular && (
                <div className="absolute -top-3 left-4 bg-[#d4ff4f] text-[#0a0a0a] text-xs px-2 py-0.5"
                  style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>
                  MOST POPULAR
                </div>
              )}
              <div className="text-lg text-white mb-1" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{p.name}</div>
              <div className="text-[#d4ff4f] text-3xl mb-1" style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>{p.price}</div>
              <div className="text-[#555] text-sm mb-4">{p.per}</div>
              <div className="flex items-center gap-2 mb-6">
                <CreditCard size={14} className="text-[#d4ff4f]" />
                <span className="text-white font-medium">{p.credits} credits</span>
              </div>
              <Link href="/register"
                className={`block text-center py-2.5 text-sm uppercase tracking-widest transition-colors ${
                  p.popular
                    ? 'bg-[#d4ff4f] text-[#0a0a0a] hover:bg-[#c0eb3a]'
                    : 'border border-[#333] text-white hover:border-[#d4ff4f] hover:text-[#d4ff4f]'
                }`}
                style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 border-t border-[#1a1a1a]">
        <div className="border border-[#d4ff4f]/20 bg-[#d4ff4f]/5 p-12 text-center">
          <ShieldCheck size={32} className="text-[#d4ff4f] mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl text-white mb-3" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Protect identities.<br />No expertise required.
          </h2>
          <p className="text-[#666] font-light mb-8 max-w-md mx-auto">
            Your first censor is free. No credit card, no account requirements beyond a valid email.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#d4ff4f] text-[#0a0a0a] uppercase tracking-widest text-sm hover:bg-[#c0eb3a] transition-colors"
            style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            <Zap size={16} />
            Start censoring for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1a1a1a] px-6 md:px-12 py-6 flex items-center justify-between">
        <span className="text-sm tracking-tight" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
          FACE<span className="text-[#d4ff4f]">CENSOR</span>
        </span>
        <span className="text-[#444] text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
          © 2026 · Privacy first
        </span>
      </footer>
    </div>
  );
}
