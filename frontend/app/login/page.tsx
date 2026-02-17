'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { EyeOff, Eye, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      login(data.access_token, data.user);
      toast.success('Welcome back');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left panel — branding */}
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

        <div className="relative">
          <div className="mb-4" style={{ height: '3px', width: '40px', background: '#d4ff4f' }} />
          <blockquote className="text-[#888] font-light text-lg leading-relaxed">
            "The only tool that actually handles face redaction at scale without manual work."
          </blockquote>
          <p className="text-[#555] text-sm mt-4" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>— Investigative journalist</p>
        </div>

        <p className="relative text-[#333] text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
          © 2026 FaceCensor
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-3 mb-12 lg:hidden">
            <div className="w-8 h-8 bg-[#d4ff4f] flex items-center justify-center">
              <EyeOff size={16} className="text-[#0a0a0a]" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }} className="text-lg tracking-tight text-white">
              FACE<span className="text-[#d4ff4f]">CENSOR</span>
            </span>
          </Link>

          <h1 className="text-3xl text-white mb-1 anim-fade-up" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Welcome back
          </h1>
          <p className="text-[#555] font-light mb-8 anim-fade-up delay-100">
            Sign in to your account to continue
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
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-[#555] text-sm mt-6 anim-fade-up delay-300">
            No account?{' '}
            <Link href="/register" className="text-[#d4ff4f] hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
