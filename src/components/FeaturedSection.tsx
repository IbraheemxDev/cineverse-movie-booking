'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import BlurCircle from './BlurCircle'
import MovieCard from './MovieCard'

const FeaturedSection = () => {
  const router = useRouter()
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const fetchShows = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/show/all')
      const result = await res.json()

      if (res.ok && result.data?.shows) {
        setMovies(result.data.shows)
      }
    } catch (error) {
      console.error('Failed to fetch featured movies:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShows()
  }, [])

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>
      <div className='relative flex items-center justify-between pt-20 pb-10'>
        <BlurCircle top="0" right="-80px" />
        <p className='text-gray-300 font-medium text-lg'>Now Showing</p>
        <button
          onClick={() => router.push('/movies')}
          className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer'
        >
          View All
          <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5' />
        </button>
      </div>

      {/* Grid Layout Container */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 mt-8'>
        {loading ? (
          // Responsive Skeleton Grid
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className='w-full h-80 bg-primary/10 rounded-lg animate-pulse'
            />
          ))
        ) : movies.length > 0 ? (
          movies.slice(0, 4).map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))
        ) : (
          <p className='text-gray-400 text-sm col-span-full text-center'>
            No shows available currently.
          </p>
        )}
      </div>

      <div className='flex justify-center mt-20'>
        <button
          onClick={() => {
            router.push('/movies')
            window.scrollTo(0, 0)
          }}
          className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'
        >
          Show more
        </button>
      </div>
    </div>
  )
}

export default FeaturedSection