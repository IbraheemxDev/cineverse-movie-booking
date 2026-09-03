'use client'

import React, { useEffect, useState } from 'react'
import BlurCircle from '@/components/BlurCircle'
import MovieCard from '@/components/MovieCard'
import Loading from '@/components/Loading'
import toast from 'react-hot-toast'

export default function Page() {
  const [favoriteMovies, setFavoriteMovies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchFavorites = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/user/favorites')
      const data = await res.json()

      if (res.ok && data.success) {
        setFavoriteMovies(data.movies || [])
      } else {
        toast.error(data.message || "Failed to load favorites")
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong while fetching favorites")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return favoriteMovies.length > 0 ? (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      <h1 className='text-lg font-medium my-4'>Your Favorite Movies</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center sm:justify-items-start'>
        {favoriteMovies.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        ))}
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center min-h-[70vh]'>
      <h1 className='text-2xl font-semibold text-center text-gray-300'>
        No favorite movies found
      </h1>
      <p className='text-sm text-gray-400 mt-2'>
        Click the heart icon on any movie details page to add it here.
      </p>
    </div>
  )
}

// import React from 'react'
// import {dummyShowsData} from '@/assets/assets'
// import BlurCircle from '@/components/BlurCircle'
// import MovieCard from '@/components/MovieCard'
// function page() {
//   return dummyShowsData.length > 0 ? (
//     <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44
// overflow-hidden min-h-[80vh]'>

// <BlurCircle top="150px" left="0px"/>
// <BlurCircle bottom="50px" right="50px"/>

// <h1 className='text-lg font-medium my-4'>Your Favorite Movies</h1>
// <div className='flex flex-wrap max-sm:justify-center gap-8'>
// {dummyShowsData.map((movie)=>(
// <MovieCard movie={movie} key={movie._id}/>
// ))}
// </div>
// </div>
//   ) : (
//     <div className='flex flex-col items-center justify-center h-screen'>
// <h1 className='text-3xl font-bold text-center'>No movies available</h1>
// </div>
//   )
// }

// export default page