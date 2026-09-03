'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, authClient } from '@/lib/auth-client';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  User,
  Mail,
  ShieldCheck,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [initialState, setInitialState] = useState({ name: '', image: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (session?.user) {
      const currentName = session.user.name || '';
      const currentImage = session.user.image || '';
      setName(currentName);
      setImage(currentImage);
      setInitialState({ name: currentName, image: currentImage });
    }
  }, [session]);

  // Auto-dismiss banners
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  const hasChanges = name !== initialState.name || image !== initialState.image;

  const handleReset = () => {
    setName(initialState.name);
    setImage(initialState.image);
    setMessage(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || isUpdating) return;

    setIsUpdating(true);
    setMessage(null);

    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: image.trim(),
      });

      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setInitialState({ name: name.trim(), image: image.trim() });
        router.refresh(); // Syncs Navbar avatar/name instantly
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-500 gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-wider font-semibold">Loading profile data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-white tracking-tight">Public Profile</h2>
          <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Live Preview
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Customize your CineVerse identity, screen name, and profile portrait.
        </p>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          role="status"
          className={`p-3.5 text-sm rounded-xl border flex items-center gap-2.5 transition-all animate-in fade-in ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Avatar Showcase Card */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-2xl bg-zinc-950/40 border border-white/[0.06] backdrop-blur-sm">
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800/60 border border-white/10 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
            {image ? (
              <Image
                src={image}
                alt={name || 'Avatar'}
                width={80}
                height={80}
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                onError={() => setImage('')}
              />
            ) : (
              <span>{name?.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 shadow-md">
            <Camera className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <p className="text-base font-semibold text-white truncate">{name || 'Your Name'}</p>
          <p className="text-xs text-zinc-400 truncate">{session?.user?.email}</p>
          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">
              <ShieldCheck className="w-3 h-3" /> Verified Account
            </span>
            <span className="text-[11px] text-zinc-500">
              Role: <span className="text-zinc-300 capitalize">{(session?.user as any)?.role || 'User'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleUpdate} className="space-y-5 max-w-xl">
        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="block text-xs font-medium text-zinc-300 mb-2">
            Display Name
          </label>
          <div className="relative">
            <input
              id="displayName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. John Doe"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        {/* Avatar URL */}
        <div>
          <label htmlFor="avatarUrl" className="block text-xs font-medium text-zinc-300 mb-2">
            Avatar Image URL
          </label>
          <div className="relative">
            <input
              id="avatarUrl"
              type="url"
              value={image}
              placeholder="https://images.unsplash.com/photo-..."
              onChange={(e) => setImage(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
            <Camera className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
          <p className="text-[11px] text-zinc-500 mt-1.5">
            Direct link to an image (JPG, PNG, or WebP hosted on Google, Unsplash, etc.)
          </p>
        </div>

        {/* Read-Only Email */}
        <div>
          <label htmlFor="userEmail" className="block text-xs font-medium text-zinc-500 mb-2">
            Primary Email Address
          </label>
          <div className="relative">
            <input
              id="userEmail"
              type="email"
              value={session?.user?.email || ''}
              disabled
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/20 border border-white/5 rounded-xl text-sm text-zinc-500 cursor-not-allowed select-none"
            />
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
          </div>
          <p className="text-[11px] text-zinc-600 mt-1.5">
            Registered account email cannot be edited from this section.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-3">
          <button
            type="submit"
            disabled={!hasChanges || isUpdating}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dull text-white text-sm font-medium rounded-xl transition shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>

          {hasChanges && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white text-sm font-medium rounded-xl transition border border-white/5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </form>
    </div>
  );
}