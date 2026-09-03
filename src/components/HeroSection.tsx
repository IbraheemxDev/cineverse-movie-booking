'use client'

import React, { useEffect, useState } from 'react'
import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { assets } from '@/assets/assets'

interface Genre {
  id?: number
  name: string
}

interface Movie {
  _id: string
  title: string
  overview: string
  backdrop_path: string
  release_date: string
  runtime?: number
  genres?: (string | Genre)[]
}

const HeroSection = () => {
  const router = useRouter()

  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchHeroMovie = async () => {
      try {
        setLoading(true)

        const res = await fetch('/api/show/all')
        const result = await res.json()

        if (res.ok && result.data?.shows?.length > 0) {
          setMovie(result.data.shows[0])
        }
      } catch (error) {
        console.error('Hero movie fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHeroMovie()
  }, [])

  const formatRuntime = (mins?: number) => {
    if (!mins) return 'N/A'

    const hours = Math.floor(mins / 60)
    const remaining = mins % 60

    return `${hours}h ${remaining}m`
  }

  const getGenres = () => {
    if (!movie?.genres || movie.genres.length === 0) {
      return 'Featured'
    }

    return movie.genres
      .slice(0, 3)
      .map((g) => (typeof g === 'string' ? g : g.name))
      .join(' | ')
  }

  // Jab tak data fetch ho raha hai, tab tak yeh sleek skeleton dikhega (No old data flash)
  if (loading || !movie) {
    return (
      <div className="relative flex h-screen flex-col items-start justify-center gap-4 overflow-hidden bg-black/90 px-6 animate-pulse md:px-16 lg:px-36">
        {/* Badge Skeleton */}
        <div className="mt-20 h-7 w-40 rounded-md bg-white/10" />

        {/* Title Skeleton */}
        <div className="mt-2 h-16 w-3/4 max-w-lg rounded-lg bg-white/10" />
        <div className="h-12 w-1/2 max-w-sm rounded-lg bg-white/10" />

        {/* Meta tags Skeleton */}
        <div className="mt-2 flex items-center gap-4">
          <div className="h-5 w-32 rounded bg-white/10" />
          <div className="h-5 w-16 rounded bg-white/10" />
          <div className="h-5 w-16 rounded bg-white/10" />
        </div>

        {/* Overview Description Skeleton */}
        <div className="mt-2 w-full max-w-md space-y-2">
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-5/6 rounded bg-white/10" />
          <div className="h-4 w-2/3 rounded bg-white/10" />
        </div>

        {/* Button Skeleton */}
        <div className="mt-4 h-11 w-36 rounded-full bg-white/10" />
      </div>
    )
  }

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : '2026'

  const bgImage = movie.backdrop_path
    ? movie.backdrop_path.startsWith('http')
      ? movie.backdrop_path
      : `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : ''

  const isMarvelMovie =
    movie.overview?.toLowerCase().includes('marvel') ||
    movie.title?.toLowerCase().includes('marvel') ||
    movie.title?.toLowerCase().includes('spider-man') ||
    movie.title?.toLowerCase().includes('guardians of the galaxy') ||
    movie.title?.toLowerCase().includes('avengers')

  return (
    <div
      className="relative flex h-screen flex-col items-start justify-center gap-4 bg-cover bg-center px-6 transition-opacity duration-700 ease-in md:px-16 lg:px-36"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.88) 25%, rgba(0, 0, 0, 0.4) 65%, transparent 100%), url(${bgImage})`,
      }}
    >
      {/* Studio Badge / Brand */}
      <div className="mt-20">
        {isMarvelMovie ? (
          <img
            src={assets.marvelLogo.src}
            alt="Marvel Studios"
            className="max-h-10 object-contain lg:h-10"
          />
        ) : (
          <span className="inline-block rounded-md border border-primary/40 bg-primary/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur-md">
            CineVerse Exclusive
          </span>
        )}
      </div>

      <h1 className="max-w-xl text-5xl font-semibold text-white md:text-[70px] md:leading-18">
        {movie.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 md:text-base">
        <span>{getGenres()}</span>

        <div className="flex items-center gap-1">
          <CalendarIcon className="h-4.5 w-4.5 text-primary" />
          {releaseYear}
        </div>

        <div className="flex items-center gap-1">
          <ClockIcon className="h-4.5 w-4.5 text-primary" />
          {formatRuntime(movie.runtime)}
        </div>
      </div>

      <p className="line-clamp-3 max-w-md text-sm text-gray-300 md:text-base">
        {movie.overview}
      </p>

      <div className="mt-2 flex items-center gap-4">
        <button
          onClick={() => {
            router.push('/movies')
            window.scrollTo(0, 0)
          }}
          className="flex cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-primary-dull"
        >
          Explore Movies
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default HeroSection