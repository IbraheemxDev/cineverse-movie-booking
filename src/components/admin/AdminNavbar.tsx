'use client'
import React from 'react'
import Link from 'next/link'
import { assets } from '@/assets/assets'
import Image from 'next/image'

const AdminNavbar = () => {
return (
    <div className='flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/30'>
      <Link href="/">
      
<Image src={assets.logo} alt="logo" width={144} height={40} className="w-36 h-auto" />      </Link>
    </div>
  )
}

export default AdminNavbar