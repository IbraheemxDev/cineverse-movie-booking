// 'use client'

// import React from 'react'
// import { useRouter } from 'next/navigation'
// import { StarIcon } from 'lucide-react'
// import timeFormat from '@/lib/timeFormat'

// const MovieCard = ({ movie }) => {
//   const router = useRouter()

//   return (
//     <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-66'>
//       <img 
//         onClick={() => { router.push(`/movies/${movie._id}`); scrollTo(0, 0); }}
//         src={movie.backdrop_path} 
//         alt="" 
//         className='rounded-lg h-52 w-full object-cover object-bottom-right cursor-pointer'
//       />

//       <p className='font-semibold mt-2 truncate'>{movie.title}</p>

//       <p className='text-sm text-gray-400 mt-2'>
//         {new Date(movie.release_date).getFullYear()} • {movie.genres.slice(0, 2).map(genre => genre.name).join(" | ")} • {timeFormat(movie.runtime)}
//       </p>

//       <div className='flex items-center justify-between mt-4 pb-3'>
//         <button 
//           onClick={() => { router.push(`/movies/${movie._id}`); scrollTo(0, 0); }}
//           className='px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'
//         >
//           Buy Tickets
//         </button>

//         <p className='flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1'>
//           <StarIcon className="w-4 h-4 text-primary fill-primary" />
//           {movie.vote_average.toFixed(1)}
//         </p>
//       </div>
//     </div>
//   )
// }

// export default MovieCard

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { StarIcon } from 'lucide-react'
import timeFormat from '@/lib/timeFormat'

const MovieCard = ({ movie }) => {
  const router = useRouter()

  // TMDB Image Base URL (w500 size for cards)
  const imgBaseUrl = "https://image.tmdb.org/t/p/w500"

  return (
    <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-72'>
      <img 
        onClick={() => { router.push(`/movies/${movie._id}`); scrollTo(0, 0); }}
        // Yahan TMDB ka base URL aur movie ka backdrop_path combine kiya hai
        src={`${imgBaseUrl}${movie.backdrop_path}`} 
        alt={movie.title} 
        className='rounded-lg h-52 w-full object-cover cursor-pointer'
        // Image load hone tak placeholder color
        loading="lazy"
      />

      <p className='font-semibold mt-2 truncate'>{movie.title}</p>

      <p className='text-sm text-gray-400 mt-2'>
        {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"} • {movie.genres && movie.genres.length > 0 ? movie.genres.slice(0, 2).map(genre => genre.name).join(" | ") : "Genre"} • {timeFormat(movie.runtime)}
      </p>

      <div className='flex items-center justify-between mt-4 pb-3'>
        <button 
          onClick={() => { router.push(`/movies/${movie._id}`); scrollTo(0, 0); }}
          className='px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'
        >
          Buy Tickets
        </button>

        <p className='flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1'>
          <StarIcon className="w-4 h-4 text-primary fill-primary" />
          {movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"}
        </p>
      </div>
    </div>
  )
}

export default MovieCard