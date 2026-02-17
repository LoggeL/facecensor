'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { imagesApi, ImageRecord } from '@/lib/api';
import { toast } from 'sonner';
import {
  EyeOff, Upload, CreditCard, LogOut, Download, CheckCircle,
  XCircle, Clock, Image as ImageIcon, Loader2, Zap, ChevronRight
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getImageUrl(id: number, type: 'original' | 'processed') {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return `${API_BASE}/images/${id}/${type}?_t=${token}`;
}

function UploadZone({ onUpload, credits }: { onUpload: (file: File) => void; credits: number }) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  return (
    <div
      className={`upload-zone cursor-pointer transition-all ${dragging ? 'dragging' : ''} ${credits === 0 ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
      onClick={() => fileRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }}
      />
      <div className="p-12 flex flex-col items-center gap-4 text-center">
        <div className={`w-14 h-14 border-2 flex items-center justify-center transition-colors ${dragging ? 'border-[#d4ff4f] text-[#d4ff4f]' : 'border-[#333] text-[#555]'}`}>
          <Upload size={24} />
        </div>
        <div>
          <p className="text-white font-medium mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
            {dragging ? 'Drop to censor' : 'Drop an image or click to upload'}
          </p>
          <p className="text-[#555] text-sm">JPEG, PNG, WebP · max 20MB · costs 1 credit</p>
        </div>
        {credits > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#d4ff4f]/10 border border-[#d4ff4f]/30">
            <Zap size={12} className="text-[#d4ff4f]" />
            <span className="text-[#d4ff4f] text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
              {credits} credit{credits !== 1 ? 's' : ''} available
            </span>
          </div>
        )}
        {credits === 0 && (
          <Link href="/dashboard/credits"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            No credits — buy more
          </Link>
        )}
      </div>
    </div>
  );
}

function ProcessingCard() {
  return (
    <div className="border border-[#d4ff4f]/30 bg-[#d4ff4f]/5 p-6 flex items-center gap-4">
      <div className="w-10 h-10 border border-[#d4ff4f]/40 flex items-center justify-center">
        <Loader2 size={18} className="text-[#d4ff4f] animate-spin" />
      </div>
      <div>
        <p className="text-white font-medium" style={{ fontFamily: 'Syne, sans-serif' }}>Processing image...</p>
        <p className="text-[#666] text-sm">Detecting and censoring faces</p>
      </div>
    </div>
  );
}

function ImageCard({ img }: { img: ImageRecord }) {
  const [view, setView] = useState<'processed' | 'original'>('processed');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const statusIcon = {
    done: <CheckCircle size={14} className="text-[#d4ff4f]" />,
    processing: <Clock size={14} className="text-yellow-400" />,
    failed: <XCircle size={14} className="text-red-400" />,
  }[img.status] || null;

  return (
    <div className="border border-[#1a1a1a] bg-[#0f0f0f] group hover:border-[#2a2a2a] transition-colors">
      {/* Image preview */}
      <div className="aspect-video bg-[#0a0a0a] relative overflow-hidden">
        {img.status === 'done' && img.has_processed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${API_BASE}/images/${img.id}/${view}?_t=${token}`}
            alt={img.original_filename}
            className="w-full h-full object-cover transition-opacity"
          />
        ) : img.status === 'processing' ? (
          <div className="w-full h-full flex items-center justify-center shimmer">
            <Loader2 size={24} className="text-[#d4ff4f] animate-spin" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={32} className="text-[#2a2a2a]" />
          </div>
        )}

        {/* Toggle overlay */}
        {img.status === 'done' && img.has_processed && (
          <button
            onClick={() => setView(v => v === 'processed' ? 'original' : 'processed')}
            className="absolute top-2 left-2 px-2 py-1 bg-[#0a0a0a]/90 border border-[#333] text-[#888] text-xs hover:border-[#d4ff4f] hover:text-[#d4ff4f] transition-colors"
            style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
            {view === 'processed' ? 'CENSORED' : 'ORIGINAL'}
          </button>
        )}

        {/* Faces badge */}
        {img.status === 'done' && (
          <div className="absolute top-2 right-2 bg-[#0a0a0a]/90 border border-[#1a1a1a] px-2 py-0.5 flex items-center gap-1">
            <EyeOff size={11} className="text-[#d4ff4f]" />
            <span className="text-[#d4ff4f] text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
              {img.faces_detected}
            </span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-white text-sm font-medium truncate" style={{ fontFamily: 'Syne, sans-serif' }}>
            {img.original_filename}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            {statusIcon}
            <span className="text-xs capitalize" style={{
              color: img.status === 'done' ? '#d4ff4f' : img.status === 'failed' ? '#f87171' : '#facc15',
              fontFamily: 'IBM Plex Mono, monospace'
            }}>
              {img.status}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#555] text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
            {new Date(img.created_at).toLocaleDateString()}
          </span>

          {img.status === 'done' && img.has_processed && (
            <a
              href={`${API_BASE}/images/${img.id}/processed?_t=${token}`}
              download={`censored_${img.original_filename}`}
              className="flex items-center gap-1 text-[#555] hover:text-[#d4ff4f] transition-colors text-xs"
              style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
              <Download size={12} />
              Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, loading, refresh } = useAuth();
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const loadImages = useCallback(async () => {
    try {
      const { data } = await imagesApi.list();
      setImages(data);
    } catch {/* ignore */}
  }, []);

  useEffect(() => {
    if (user) loadImages();
  }, [user, loadImages]);

  const handleUpload = async (file: File) => {
    if (!user || user.credits < 1) {
      toast.error('No credits. Please purchase more.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const { data } = await imagesApi.upload(file, setUploadProgress);
      toast.success(`Done! ${data.faces_detected} face${data.faces_detected !== 1 ? 's' : ''} censored.`);
      await refresh(); // update credit balance
      await loadImages();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
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
      {/* Top nav */}
      <header className="border-b border-[#1a1a1a] px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#d4ff4f] flex items-center justify-center">
            <EyeOff size={14} className="text-[#0a0a0a]" />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }} className="text-base tracking-tight text-white">
            FACE<span className="text-[#d4ff4f]">CENSOR</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Credits badge */}
          <Link href="/dashboard/credits"
            className="flex items-center gap-2 px-3 py-1.5 border border-[#222] hover:border-[#d4ff4f]/40 transition-colors group">
            <CreditCard size={14} className="text-[#d4ff4f]" />
            <span className="text-white text-sm" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
              {user.credits} credit{user.credits !== 1 ? 's' : ''}
            </span>
            <ChevronRight size={12} className="text-[#555] group-hover:text-[#d4ff4f] transition-colors" />
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 text-[#555] hover:text-[#d4ff4f] transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-10">
        {/* Greeting */}
        <div className="mb-8 anim-fade-up">
          <h1 className="text-3xl text-white" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Hello, {user.username}
          </h1>
          <p className="text-[#555] font-light mt-1">
            Upload an image to automatically censor all detected faces.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-px bg-[#1a1a1a] mb-8 anim-fade-up delay-100">
          {[
            { label: 'Total processed', value: images.filter(i => i.status === 'done').length },
            { label: 'Faces censored', value: images.reduce((acc, i) => acc + (i.faces_detected || 0), 0) },
            { label: 'Credits left', value: user.credits },
          ].map((s) => (
            <div key={s.label} className="bg-[#0a0a0a] px-6 py-5">
              <div className="text-2xl text-[#d4ff4f] mb-0.5" style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>
                {s.value}
              </div>
              <div className="text-[#555] text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Upload zone */}
        <div className="mb-10 anim-fade-up delay-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-white" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
              New censor job
            </h2>
            {user.credits === 0 && (
              <Link href="/dashboard/credits"
                className="text-xs text-[#d4ff4f] hover:underline flex items-center gap-1"
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                Buy credits <ChevronRight size={12} />
              </Link>
            )}
          </div>

          <UploadZone onUpload={handleUpload} credits={user.credits} />

          {uploading && (
            <div className="mt-3">
              <div className="flex justify-between mb-1">
                <span className="text-[#555] text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                  Uploading & processing...
                </span>
                <span className="text-[#d4ff4f] text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                  {uploadProgress}%
                </span>
              </div>
              <div className="h-0.5 bg-[#1a1a1a] relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-[#d4ff4f] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Processing card */}
        {uploading && (
          <div className="mb-8">
            <ProcessingCard />
          </div>
        )}

        {/* Image gallery */}
        {images.length > 0 && (
          <div className="anim-fade-up delay-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-white" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                Your images
              </h2>
              <span className="text-[#555] text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                {images.length} total
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img) => (
                <ImageCard key={img.id} img={img} />
              ))}
            </div>
          </div>
        )}

        {images.length === 0 && !uploading && (
          <div className="border border-[#1a1a1a] p-16 flex flex-col items-center gap-3 text-center">
            <ImageIcon size={32} className="text-[#2a2a2a]" />
            <p className="text-[#444] text-sm" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
              No images yet — upload your first one above
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
