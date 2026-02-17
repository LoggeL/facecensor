'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { creditsApi, CreditPackage, Transaction } from '@/lib/api';
import { toast } from 'sonner';
import {
  EyeOff, CreditCard, ArrowLeft, CheckCircle, Zap, Loader2, TrendingUp
} from 'lucide-react';

function PackageCard({
  pkg,
  onBuy,
  buying,
}: {
  pkg: CreditPackage;
  onBuy: (id: string) => void;
  buying: string | null;
}) {
  const isLoading = buying === pkg.id;
  const perCredit = (pkg.price_usd / pkg.credits).toFixed(2);

  return (
    <div className={`relative border p-6 flex flex-col ${pkg.popular ? 'border-[#d4ff4f]' : 'border-[#222]'} bg-[#111] hover:bg-[#141414] transition-colors`}>
      {pkg.popular && (
        <div className="absolute -top-3 left-4 bg-[#d4ff4f] text-[#0a0a0a] text-xs px-2 py-0.5"
          style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>
          BEST VALUE
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-lg text-white mb-0.5" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            {pkg.name}
          </div>
          <div className="text-[#555] text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
            ${perCredit} / credit
          </div>
        </div>
        <div className="text-right">
          <div className="text-[#d4ff4f] text-3xl" style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>
            ${pkg.price_usd}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-[#d4ff4f]/10 border border-[#d4ff4f]/30 flex items-center justify-center">
          <Zap size={14} className="text-[#d4ff4f]" />
        </div>
        <span className="text-white font-medium">{pkg.credits} censoring credits</span>
      </div>

      <div className="space-y-2 mb-6 flex-1">
        {[
          `${pkg.credits} image${pkg.credits > 1 ? 's' : ''} to censor`,
          'All image formats supported',
          'Instant delivery',
          'Never expires',
        ].map((feat) => (
          <div key={feat} className="flex items-center gap-2">
            <CheckCircle size={13} className="text-[#d4ff4f] shrink-0" />
            <span className="text-[#888] text-sm">{feat}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onBuy(pkg.id)}
        disabled={!!buying}
        className={`w-full py-3 text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-60 ${
          pkg.popular
            ? 'bg-[#d4ff4f] text-[#0a0a0a] hover:bg-[#c0eb3a]'
            : 'border border-[#333] text-white hover:border-[#d4ff4f] hover:text-[#d4ff4f]'
        }`}
        style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
        {isLoading ? 'Processing...' : 'Purchase'}
      </button>
    </div>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isPositive = tx.credits > 0;
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#111] last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 border flex items-center justify-center ${isPositive ? 'border-[#d4ff4f]/30 bg-[#d4ff4f]/5' : 'border-[#333] bg-[#111]'}`}>
          {isPositive ? <TrendingUp size={12} className="text-[#d4ff4f]" /> : <EyeOff size={12} className="text-[#555]" />}
        </div>
        <div>
          <p className="text-white text-sm">{tx.description || tx.type}</p>
          <p className="text-[#555] text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
            {new Date(tx.created_at).toLocaleString()}
          </p>
        </div>
      </div>
      <div className={`text-sm font-medium ${isPositive ? 'text-[#d4ff4f]' : 'text-[#555]'}`}
        style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
        {isPositive ? '+' : ''}{tx.credits}
      </div>
    </div>
  );
}

export default function CreditsPage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    creditsApi.packages().then(({ data }) => setPackages(data));
    creditsApi.balance().then(({ data }) => setTransactions(data.transactions));
  }, [user]);

  const handleBuy = async (packageId: string) => {
    setBuying(packageId);
    try {
      const { data } = await creditsApi.purchase(packageId);
      toast.success(data.message);
      await refresh();
      const { data: balance } = await creditsApi.balance();
      setTransactions(balance.transactions);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Purchase failed');
    } finally {
      setBuying(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 size={24} className="text-[#d4ff4f] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#d4ff4f] flex items-center justify-center">
            <EyeOff size={14} className="text-[#0a0a0a]" />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }} className="text-base tracking-tight text-white">
            FACE<span className="text-[#d4ff4f]">CENSOR</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1.5 border border-[#222]">
          <CreditCard size={14} className="text-[#d4ff4f]" />
          <span className="text-white text-sm" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
            {user.credits} credit{user.credits !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-10">
        {/* Back */}
        <Link href="/dashboard"
          className="inline-flex items-center gap-2 text-[#555] hover:text-[#d4ff4f] transition-colors text-sm mb-8"
          style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
          <ArrowLeft size={14} />
          Back to dashboard
        </Link>

        {/* Balance card */}
        <div className="border border-[#d4ff4f]/20 bg-[#d4ff4f]/5 p-6 flex items-center justify-between mb-10 anim-fade-up">
          <div>
            <div className="text-[#888] text-xs uppercase tracking-widest mb-1" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
              Current balance
            </div>
            <div className="text-[#d4ff4f] text-4xl" style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>
              {user.credits}
            </div>
            <div className="text-[#666] text-sm mt-0.5">
              {user.credits === 0 ? 'Purchase credits to continue' : `Can censor ${user.credits} more image${user.credits !== 1 ? 's' : ''}`}
            </div>
          </div>
          <div className="w-16 h-16 border border-[#d4ff4f]/30 flex items-center justify-center">
            <Zap size={24} className="text-[#d4ff4f]" />
          </div>
        </div>

        {/* Packages */}
        <div className="mb-12 anim-fade-up delay-100">
          <div className="mb-6">
            <div className="mb-4" style={{ height: '3px', width: '40px', background: '#d4ff4f' }} />
            <h2 className="text-2xl text-white" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
              Top up credits
            </h2>
            <p className="text-[#555] font-light mt-1 text-sm">
              Credits never expire · instant activation · mock payment (no real charge)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onBuy={handleBuy} buying={buying} />
            ))}
          </div>
        </div>

        {/* Transaction history */}
        {transactions.length > 0 && (
          <div className="anim-fade-up delay-200">
            <div className="mb-4">
              <div className="mb-4" style={{ height: '3px', width: '40px', background: '#d4ff4f' }} />
              <h2 className="text-xl text-white" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                Transaction history
              </h2>
            </div>
            <div className="border border-[#1a1a1a] bg-[#0f0f0f] px-6 divide-y divide-[#111]">
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
