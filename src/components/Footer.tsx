'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { assets } from '@/assets/assets'

const Footer = () => {
  return (
    <footer className="px-6 md:px-16 lg:px-36 mt-40 w-full text-gray-300">

      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-zinc-800 pb-14">

        <div className="md:max-w-96">
          <Image
            src={assets.logo}
            alt="CineVerse Logo"
            className="h-11 w-auto"
          />

          <p className="mt-6 text-sm text-gray-400 leading-relaxed">
            Experience seamless cinema booking with CineVerse. Discover the latest blockbusters, select your favorite seats in real-time, and reserve tickets instantly.
          </p>

          <div className="flex items-center gap-3 mt-5">
            <Link href="#" className="hover:opacity-85 transition">
              <Image
                src={assets.googlePlay}
                alt="Get it on Google Play"
                className="h-9 w-auto"
              />
            </Link>

            <Link href="#" className="hover:opacity-85 transition">
              <Image
                src={assets.appStore}
                alt="Download on the App Store"
                className="h-9 w-auto"
              />
            </Link>
          </div>
        </div>

        <div className="flex-1 flex items-start md:justify-end gap-16 md:gap-32">

          <div>
            <h2 className="font-semibold text-white mb-5 tracking-wide">
              Navigation
            </h2>

            <ul className="text-sm space-y-2.5 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link href="/movies" className="hover:text-white transition">All Movies</Link>
              </li>
              <li>
                <Link href="/my-bookings" className="hover:text-white transition">My Bookings</Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-white transition">Favorites</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-white mb-5 tracking-wide">
              Support
            </h2>

            <div className="text-sm space-y-2.5 text-gray-400">
              <p className="hover:text-white transition cursor-pointer">ibrahim.codes@gmail.com</p>
              <p>Mon – Sun: 9:00 AM – 11:00 PM</p>
              <p className="text-xs text-gray-500 pt-1">Lahore, Pakistan</p>
            </div>
          </div>

        </div>
      </div>

      <p className="pt-6 text-center text-sm text-gray-500 pb-8">
        Copyright {new Date().getFullYear()} © CineVerse. All Rights Reserved.
      </p>

    </footer>
  )
}

export default Footer