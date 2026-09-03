'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets'; 
import { useRouter } from 'next/navigation';
import { 
  MenuIcon, 
  XIcon, 
  TicketPlus, 
  LogOut, 
  Heart, 
  ShieldCheck, 
  UserCog, 
  ShieldAlert 
} from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
        },
      },
    });
  };

  // Outside click pe profile dropdown close ho jaye
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5'>
      {/* Brand Logo */}
      <Link href='/' className='max-md:flex-1'>
        <Image 
          src={assets.logo} 
          alt="CineVerse Logo" 
          width={144} 
          height={40} 
          className='w-36 h-auto'
          priority
        />
      </Link>

      {/* Center Nav Links */}
      <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 min-md:px-8 py-3 max-md:h-screen min-md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-[width] duration-300 ${isOpen ? 'max-md:w-full' : 'max-md:w-0'}`}>
        <XIcon className='md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer' onClick={() => setIsOpen(!isOpen)} />

        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} href='/'>Home</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} href='/movies'>Movies</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} href='/my-bookings'>My Bookings</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} href='/favorites'>Favorites</Link>
      </div>

      {/* Right Action Items */}
      <div className='flex items-center gap-8'>
        {isPending ? (
          <div className='w-8 h-8 animate-pulse bg-gray-600 rounded-full' />
        ) : !session ? (
          <button 
            className='px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer' 
            onClick={() => router.push('/sign-in')}
          >
            Login
          </button>
        ) : (
          <div className='relative' ref={profileRef}>
            {/* Profile Avatar Trigger */}
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className='w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-primary text-white font-medium text-sm cursor-pointer border border-gray-300/20 hover:opacity-90 transition'
            >
              {session.user?.image ? (
                <Image 
                  src={session.user.image} 
                  alt={session.user?.name || 'User'} 
                  width={36} 
                  height={36} 
                  className='w-full h-full object-cover'
                />
              ) : (
                <span>{session.user?.name?.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </button>

            {/* Comprehensive Better-Auth Dropdown Menu */}
            {profileOpen && (
              <div className='absolute right-0 mt-2 w-64 bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl z-50 text-gray-200'>
                
                {/* 1. User Identity Header */}
                <div className='px-4 py-3 border-b border-white/10 bg-white/[0.02]'>
                  <p className='text-sm font-semibold text-white truncate'>{session.user?.name || 'User'}</p>
                  <p className='text-xs text-gray-400 truncate'>{session.user?.email}</p>
                  {(session.user as any)?.role === 'admin' && (
                    <span className='inline-block mt-1.5 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-primary/20 text-primary border border-primary/30 rounded'>
                      Admin
                    </span>
                  )}
                </div>

                {/* 2. Platform Links */}
                <div className='py-1.5 border-b border-white/10'>
                  <button 
                    onClick={() => { router.push('/my-bookings'); setProfileOpen(false); }} 
                    className='flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-white/10 transition text-left cursor-pointer'
                  >
                    <TicketPlus className='w-4 h-4 text-primary' />
                    My Bookings
                  </button>

                  <button 
                    onClick={() => { router.push('/favorites'); setProfileOpen(false); }} 
                    className='flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-white/10 transition text-left cursor-pointer'
                  >
                    <Heart className='w-4 h-4 text-rose-500' />
                    Favorites
                  </button>

                  {/* Admin Panel Link */}
                  {(session.user as any)?.role === 'admin' && (
                    <button 
                      onClick={() => { router.push('/admin'); setProfileOpen(false); }} 
                      className='flex items-center gap-3 w-full px-4 py-2 text-sm text-yellow-400 hover:bg-white/10 transition text-left cursor-pointer'
                    >
                      <ShieldAlert className='w-4 h-4' />
                      Admin Dashboard
                    </button>
                  )}
                </div>

                {/* 3. Account Management & Security */}
                <div className='py-1.5 border-b border-white/10'>
                  <button 
                    onClick={() => { router.push('/settings/security'); setProfileOpen(false); }} 
                    className='flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-white/10 transition text-left cursor-pointer'
                  >
                    <ShieldCheck className='w-4 h-4 text-emerald-400' />
                    Security & Sessions
                  </button>

                  <button 
                    onClick={() => { router.push('/settings/profile'); setProfileOpen(false); }} 
                    className='flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-white/10 transition text-left cursor-pointer'
                  >
                    <UserCog className='w-4 h-4 text-sky-400' />
                    Account Settings
                  </button>
                </div>

                {/* 4. Logout Option */}
                <div className='py-1.5 bg-red-500/5'>
                  <button 
                    onClick={() => { handleSignOut(); setProfileOpen(false); }} 
                    className='flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition text-left cursor-pointer'
                  >
                    <LogOut className='w-4 h-4' />
                    Logout
                  </button>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      <MenuIcon className='max-md:ml-4 md:hidden w-8 h-8 cursor-pointer' onClick={() => setIsOpen(!isOpen)} />
    </div>
  );
};

export default Navbar;