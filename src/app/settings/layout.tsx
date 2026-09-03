'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCog, ShieldCheck, ChevronLeft } from 'lucide-react';
import BlurCircle from '@/components/BlurCircle';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Profile Details',
      href: '/settings/profile',
      icon: UserCog,
      desc: 'Personal information & photo',
    },
    {
      label: 'Security & Sessions',
      href: '/settings/security',
      icon: ShieldCheck,
      desc: 'Password & device management',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#09090b] text-zinc-200 pt-10 pb-20 px-6 md:px-12 lg:px-20 xl:px-32 overflow-hidden">
      {/* Background Ambient Glows (z-0 aur screen ke andar positioned) */}
      <div className="absolute top-16 left-10 pointer-events-none z-0">
        <BlurCircle />
      </div>
      <div className="absolute top-[40%] right-10 pointer-events-none z-0">
        <BlurCircle />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition w-fit"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Account Settings
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Manage your profile credentials, authentication methods, and connected sessions.
            </p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Sidebar Tabs */}
          <aside className="md:col-span-4 lg:col-span-3">
            <nav className="flex md:flex-col gap-2 p-1.5 rounded-2xl bg-zinc-900/50 border border-white/[0.08] backdrop-blur-md">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.08]'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg border ${
                        isActive
                          ? 'bg-primary/20 border-primary/40 text-primary'
                          : 'bg-zinc-800/40 border-white/5 text-zinc-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span>{item.label}</span>
                      <span className="text-[11px] font-normal text-zinc-500 hidden lg:inline-block">
                        {item.desc}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Form Content Area */}
          <main className="md:col-span-8 lg:col-span-9 bg-zinc-900/40 border border-white/[0.08] rounded-3xl p-6 sm:p-8 lg:p-10 backdrop-blur-xl shadow-2xl">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}