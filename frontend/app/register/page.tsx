'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { EyeOff, Eye, Loader2, Gift } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.register(email, username, password);
      login(data.access_token, data.user);
      toast.success('Account created! Your free credit is ready.');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] border-r border-[#1a1a1a] p-12 bg-grid relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 20%, #d4ff4f 0%, transparent 60%)' }}
        />
        <div className="relative">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#d4ff4f] flex items-center justify-center">
              <EyeOff size={16} className="text-[#0a0a0a]" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }} className="text-lg tracking-tight text-white">
              FACE<span className="text-[#d4ff4f]">CENSOR</span>
            </span>
          </Link>
        </div>

        <div className="relative space-y-6">
          <div>
            <div className="mb-4" style={{ height: '3px', width: '40px', background: '#d4ff4f' }} />
            <h2 className="text-2xl text-white mb-3" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
              Free to try
            </h2>
            <p className="text-[#666] font-light leading-relaxed">
              Every new account gets 1 free credit — enough to censor your first image right away.
            </p>
          </div>

          <div className="border border-[#d4ff4f]/20 bg-[#d4ff4f]/5 p-4 flex items-start gap-3">
            <Gift size={18} className="text-[#d4ff4f] mt-0.5 shrink-0" />
            <div>
              <p className="text-white text-sm font-medium mb-1">Welcome bonus</p>
              <p className="text-[#666] text-sm font-light">1 credit added automatically on signup. No card needed.</p>
            </div>
          </div>

          {[
            'Automatic face detection',
            'Pixelation censor effect',
            'Download processed images',
            'Unlimited image history',
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-3">
              <div className="w-4 h-4 bg-[#d4ff4f]/20 border border-[#d4ff4f]/40 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 bg-[#d4ff4f]" />
              </div>
              <span className="text-[#888] text-sm">{feat}</span>
            </div>
          ))}
        </div>

        <p className="relative text-[#333] text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
          © 2026 FaceCensor
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-3 mb-12 lg:hidden">
            <div className="w-8 h-8 bg-[#d4ff4f] flex items-center justify-center">
              <EyeOff size={16} className="text-[#0a0a0a]" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }} className="text-lg tracking-tight text-white">
              FACE<span className="text-[#d4ff4f]">CENSOR</span>
            </span>
          </Link>

          <h1 className="text-3xl text-white mb-1 anim-fade-up" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Create account
          </h1>
          <p className="text-[#555] font-light mb-8 anim-fade-up delay-100">
            Get your free credit and start censoring
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 anim-fade-up delay-200">
            <div>
              <label className="block text-xs text-[#888] mb-2 uppercase tracking-widest" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-[#111] border border-[#222] text-white px-4 py-3 text-sm outline-none focus:border-[#d4ff4f] transition-colors placeholder:text-[#444]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#888] mb-2 uppercase tracking-widest" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="yourhandle"
                className="w-full bg-[#111] border border-[#222] text-white px-4 py-3 text-sm outline-none focus:border-[#d4ff4f] transition-colors placeholder:text-[#444]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#888] mb-2 uppercase tracking-widest" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="min. 6 characters"
                  className="w-full bg-[#111] border border-[#222] text-white px-4 py-3 text-sm outline-none focus:border-[#d4ff4f] transition-colors placeholder:text-[#444] pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#d4ff4f] transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#d4ff4f] text-[#0a0a0a] uppercase tracking-widest text-sm hover:bg-[#c0eb3a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>

          <p className="text-center text-[#555] text-sm mt-6 anim-fade-up delay-300">
            Already have an account?{' '}
            <Link href="/login" className="text-[#d4ff4f] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
