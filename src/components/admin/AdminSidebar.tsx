'use client'

import React from 'react'
import { 
  LayoutDashboardIcon, 
  PlusSquareIcon, 
  ListIcon, 
  ListCollapseIcon 
} from 'lucide-react' // Ya jahan se bhi icons import ho rahe hain
import { usePathname } from 'next/navigation'
import { assets } from '@/assets/assets'
import Link from 'next/link'
import Image from 'next/image'
const AdminSidebar = () => {
const pathname = usePathname();     
const user = {
  firstName: 'Admin',
  lastName: 'User',
  imageUrl: assets.profile,
}

const adminNavlinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboardIcon },
  { name: 'Add Shows', path: '/admin/add-shows', icon: PlusSquareIcon },
  { name: 'List Shows', path: '/admin/list-shows', icon: ListIcon },
  { name: 'List Bookings', path: '/admin/list-bookings', icon: ListCollapseIcon },
]
  return (<div className='h-[calc(100vh-64px)] md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-gray-300/20 text-sm'>
      <Image
        src={user.imageUrl} 
        alt="sidebar" 
        width={56} 
        height={56} 
        className='h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto object-cover' 
      />
      <p className='mt-2 text-base max-md:hidden'>{user.firstName} {user.lastName}</p>
      
      <div className='w-full mt-6'>
        {adminNavlinks.map((link, index) => {
          const isActive = pathname === link.path;
          const Icon = link.icon;

          return (
            <Link 
              key={index} 
              href={link.path} 
              className={`relative flex items-center max-md:justify-center gap-2 w-full py-2.5 md:pl-10 text-gray-400 transition-colors ${
                isActive && 'bg-primary/15 text-primary group'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <p className='max-md:hidden'>{link.name}</p>
              <span className={`w-1.5 h-10 rounded-l right-0 absolute ${isActive && 'bg-primary'}`} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default AdminSidebar
