'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets'; 
import { useRouter } from 'next/navigation';
import { SearchIcon, MenuIcon, XIcon, TicketPlus, LogOut } from 'lucide-react';
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

    // outside click pe profile dropdown close ho jaye
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

      {/* Center Nav Links / Menu */}
      <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 min-md:px-8 py-3 max-md:h-screen min-md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-[width] duration-300 ${isOpen ? 'max-md:w-full' : 'max-md:w-0'}`}>

        <XIcon className='md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer' onClick={() => setIsOpen(!isOpen)} />

        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} href='/'>Home</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} href='/movies'>Movies</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} href='/theaters'>Theaters</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} href='/releases'>Releases</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} href='/favorites'>Favorites</Link>
      </div>

      {/* Right Action Items */}
      <div className='flex items-center gap-8'>
        <SearchIcon className='max-md:hidden w-6 h-6 cursor-pointer' />
        
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
            {/* Profile Circle Icon */}
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

            {/* Dropdown */}
            {profileOpen && (
              <div className='absolute right-0 mt-2 w-44 bg-black/90 md:bg-[#1a1a1a] backdrop-blur border border-gray-300/20 rounded-xl overflow-hidden shadow-lg'>
                <button 
                  onClick={() => { router.push('/my-bookings'); setProfileOpen(false); }} 
                  className='flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition cursor-pointer'
                >
                  <TicketPlus width={16} />
                  My Bookings
                </button>
                <button 
                  onClick={() => { handleSignOut(); setProfileOpen(false); }} 
                  className='flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20 transition cursor-pointer'
                >
                  <LogOut width={16} />
                  Logout
                </button>
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