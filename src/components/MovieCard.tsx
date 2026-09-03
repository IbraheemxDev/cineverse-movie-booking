'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { StarIcon } from 'lucide-react'
import timeFormat from '@/lib/timeFormat'

interface MovieCardProps {
  movie: any
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const router = useRouter()
  const imgBaseUrl = 'https://image.tmdb.org/t/p/w500'

  const posterSrc = movie?.backdrop_path
    ? movie.backdrop_path.startsWith('http')
      ? movie.backdrop_path
      : `${imgBaseUrl}${movie.backdrop_path}`
    : '/placeholder.png'

  return (
    <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-full'>
      <img
        onClick={() => {
          router.push(`/movies/${movie._id}`)
          window.scrollTo(0, 0)
        }}
        src={posterSrc}
        alt={movie?.title || 'Movie'}
        className='rounded-lg h-52 w-full object-cover cursor-pointer bg-zinc-700'
        loading='lazy'
      />

      <p className='font-semibold mt-2 truncate text-white'>{movie?.title}</p>

      <p className='text-sm text-gray-400 mt-2 truncate'>
        {movie?.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}{' '}
        •{' '}
        {movie?.genres && movie.genres.length > 0
          ? movie.genres
              .slice(0, 2)
              .map((genre: any) => (typeof genre === 'string' ? genre : genre.name))
              .join(' | ')
          : 'Genre'}{' '}
        • {timeFormat(movie?.runtime || 0)}
      </p>

      <div className='flex items-center justify-between mt-4 pb-3'>
        <button
          onClick={() => {
            router.push(`/movies/${movie._id}`)
            window.scrollTo(0, 0)
          }}
          className='px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer text-white'
        >
          Buy Tickets
        </button>

        <p className='flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1'>
          <StarIcon className='w-4 h-4 text-primary fill-primary' />
          {movie?.vote_average ? Number(movie.vote_average).toFixed(1) : '0.0'}
        </p>
      </div>
    </div>
  )
}

export default MovieCard