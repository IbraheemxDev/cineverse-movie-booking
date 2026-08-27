'use client';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import {assets } from  '@/assets/assets'; // Apne assets import ke path ke hisab se adjust karein
import { useRouter } from 'next/navigation';
import { SearchIcon, MenuIcon, XIcon, TicketCheck, TicketPlus } from 'lucide-react';
import { useClerk, UserButton, useUser } from '@clerk/nextjs';
import { User } from '@clerk/nextjs/server';
const Navbar = () => {
    const [isOpen,setIsOpen] = useState(false);
    const { user}=useUser()
    const {openSignIn} = useClerk()
    const router = useRouter();
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

      {/* Center Nav Links / Menu (Future placeholder) */}
      <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 min-md:px-8 py-3 max-md:h-screen min-md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-[width] duration-300 ${isOpen ? 'max-md:w-full' : 'max-md:w-0'}    `}>

  <XIcon className='md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer' onClick={()=>setIsOpen(!isOpen)} />

  <Link onClick={()=>{scrollTo(0,0);setIsOpen(false)}} href='/'>Home</Link>
  <Link onClick={()=>{scrollTo(0,0);setIsOpen(false)}} href='/movies'>Movies</Link>
  <Link onClick={()=>{scrollTo(0,0);setIsOpen(false)}} href='/theaters'>Theaters</Link>
  <Link onClick={()=>{scrollTo(0,0);setIsOpen(false)}} href='/releases'>Releases</Link>
  <Link onClick={()=>{scrollTo(0,0);setIsOpen(false)}} href='/favorites'>Favorites</Link>

</div>

      {/* Right Action Items */}
      <div className='flex items-center gap-8'>
        <SearchIcon className='max-md:hidden w-6 h-6 cursor-pointer' />
        {!user?(
              <button className='px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer' onClick={() => openSignIn()}>Login</button>
        ):(
            <UserButton>
                <UserButton.MenuItems>
                    <UserButton.Action
                     label="My Bookings" 
                     labelIcon={<TicketPlus width={15}/>}
                    onClick={() => router.push('/my-bookings')}
                     />
                </UserButton.MenuItems>
            </UserButton>
            
        )}
  
      </div>
        <MenuIcon className='max-md:ml-4 md:hidden w-8 h-8 cursor-pointer' onClick={()=>setIsOpen(!isOpen)} />
    </div>
  );
};

export default Navbar;