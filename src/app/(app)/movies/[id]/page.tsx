'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react'
import toast from 'react-hot-toast'

import BlurCircle from '@/components/BlurCircle'
import timeFormat from '@/lib/timeFormat'
import DateSelect from '@/components/DateSelect'
import MovieCard from '@/components/MovieCard'
import Loading from '@/components/Loading'

const Page = () => {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [show, setShow] = useState<any>(null)
  const [allMovies, setAllMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  const imgBaseUrl = "https://image.tmdb.org/t/p/w500"

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true)
        
        // 1. Fetch single show/movie details
        const res = await fetch(`/api/show/${id}`)
        const data = await res.json()

        if (data.success) {
          setShow(data.data)
        }

        // 2. Fetch all shows for recommendations
        const allShowsRes = await fetch('/api/show/all')
        const allShowsData = await allShowsRes.json()
        
        if (allShowsData.success) {
          setAllMovies(allShowsData.data.shows || [])
        }

        // 3. Check if movie is in user's favorites
        const favRes = await fetch('/api/user/favorites')
        const favData = await favRes.json()
        if (favRes.ok && favData.success) {
          const isFav = favData.movies?.some((m: any) => m._id === id)
          setIsFavorite(!!isFav)
        }
      } catch (error) {
        console.error("Failed to fetch movie details:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchMovieDetails()
    }
  }, [id])

  const handleFavoriteToggle = async () => {
    try {
      setFavLoading(true);
      const res = await fetch('/api/user/update-favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movieId: String(id) }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsFavorite((prev) => !prev);
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to update favorite");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update favorite");
    } finally {
      setFavLoading(false);
    }
  };

  if (loading || !show) {
    return <Loading />
  }

  const { movie, dateTime } = show

  return (
    <div className="px-6 md:px-16 lg:px-20 pt-30 md:pt-50">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">

        {/* Movie Poster */}
        <div className="relative max-md:mx-auto h-104 w-70 rounded-xl overflow-hidden bg-gray-800 shrink-0">
          <img
            src={movie.poster_path ? `${imgBaseUrl}${movie.poster_path}` : ""}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Movie Details */}
        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />

          <p className="text-primary uppercase">
            {movie.original_language}
          </p>

          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {movie.title}
          </h1>

          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            <span>
              {movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"} User Rating
            </span>
          </div> 

          <p className="text-gray-400 text-sm leading-tight max-w-xl mt-2">
            {movie.overview}
          </p>

          <p className="text-gray-400 text-sm mt-2">
            {timeFormat(movie.runtime)} • {movie.genres?.map((genre: any) => genre.name).join(", ")} • {movie.release_date?.split("-")[0]}
          </p> 

          <div className='flex items-center flex-wrap gap-4 mt-4'>
            <button className='flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'>
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </button>

            <a href="#dateSelect" className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95'>
              Buy Tickets
            </a>

            {/* Favorite Toggle Button */}
            <button 
              onClick={handleFavoriteToggle}
              disabled={favLoading}
              className={`p-2.5 rounded-full transition cursor-pointer active:scale-95 border ${
                isFavorite 
                  ? 'bg-red-500/20 border-red-500 text-red-500' 
                  : 'bg-gray-700 border-transparent text-white hover:bg-gray-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      <p className='text-lg font-medium mt-20'>Your Favorite Cast</p>
      <div className='overflow-x-auto no-scrollbar mt-8 pb-4'>
        <div className='flex items-center gap-4 w-max px-4'>
          {movie.casts?.slice(0, 12).map((cast: any, index: number) => (
            <div key={index} className='flex flex-col items-center text-center w-20'>
              <img 
                src={cast.profile_path ? `${imgBaseUrl}${cast.profile_path}` : "https://via.placeholder.com/150"} 
                alt={cast.name} 
                className='rounded-full h-20 w-20 aspect-square object-cover bg-gray-800' 
              />
              <p className='font-medium text-xs mt-3 truncate w-full'>{cast.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="dateSelect">
        <DateSelect dateTime={dateTime} id={id}/>
      </div>

      {/* Recommendations Section */}
      <p className='text-lg font-medium mt-20 mb-8'>You May Also Like</p>
      
      {/* Fixed Grid Layout: Cards stretch nahi honge aur standard size mein rahenge */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-start'>
        {allMovies
          .filter((item: any) => {
            const currentShowId = item._id || item.movie?._id;
            return currentShowId !== id;
          })
          .slice(0, 4)
          .map((item: any, index: number) => {
            // Agar backend se show wrapper ke andar movie hai toh movie pass hogi, warna direct item
            const moviePayload = item.movie || item;
            return (
              <div key={index} className="w-full flex justify-center">
                <MovieCard movie={moviePayload} />
              </div>
            );
          })}
      </div>
     
      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            router.push('/movies')
            scrollTo(0, 0)
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show more
        </button>
      </div>
    </div>
  )
}

export default Page
// // 'use client'

// // import React, { useEffect, useState } from 'react'
// // import { useParams } from 'next/navigation'
// // import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react'

// // import { dummyShowsData, dummyDateTimeData } from '@/assets/assets'
// // import BlurCircle from '@/components/BlurCircle'
// // import timeFormat from '@/lib/timeFormat'
// // import DateSelect from '@/components/DateSelect'
// // import MovieCard from '@/components/MovieCard'
// // import { useRouter } from 'next/navigation'
// // import Loading from '@/components/Loading'
// // const Page = () => {
// //   const router = useRouter()
// //   const params = useParams()
// // const id = params.id as string
// //   const [show, setShow] = useState<any>(null)

// // useEffect(() => {
// //   const movie = dummyShowsData.find(
// //     (movie) => movie._id === id
// //   )

// //   if (movie) {
// //     setShow({
// //       movie,
// //       dateTime: dummyDateTimeData,
// //     })
// //   }
// // }, [id])

// //   if (!show) {
// //     return (
// //       <Loading/>
// //     )
// //   }

// //   return (
// //     <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">

// //       <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">

// //         {/* Movie Poster */}
// //         <div className="relative max-md:mx-auto h-104 w-70 rounded-xl overflow-hidden">
// //           <img
// //             src={show.movie.poster_path}
// //             alt={show.movie.title}
// //             className="w-full h-full object-cover"
// //           />
// //         </div>

// //         {/* Movie Details */}
// //         <div className="relative flex flex-col gap-3">
// //           <BlurCircle top="-100px" left="-100px" />

// //           <p className="text-primary">
// //             {show.movie.original_language.toUpperCase()}
// //           </p>

// //           <h1 className="text-4xl font-semibold max-w-96 text-balance">
// //             {show.movie.title}
// //           </h1>

// //           <div className="flex items-center gap-2 text-gray-300">
// //             <StarIcon className="w-5 h-5 text-primary fill-primary" />

// //             <span>
// //               {show.movie.vote_average.toFixed(1)} User Rating
// //             </span>
// //           </div> 

// //           <p className="text-gray-400 text-sm leading-tight max-w-xl mt-2">
// //             {show.movie.overview}
// //           </p>

// //      <p className="text-gray-400 text-sm mt-2">
// //   {timeFormat(show.movie.runtime)} • {show.movie.genres.map(genre => genre.name).join(", ")} • {show.movie.release_date.split("-")[0]}
// // </p> 
// // <div className='flex items-center flex-wrap gap-4 mt-4'>
// //   <button className='flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'>
// //     <PlayCircleIcon className="w-5 h-5" />
// //     Watch Trailer
// //   </button>

// //   <a href="#dateSelect" className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95'>
// //     Buy Tickets
// //   </a>

// //   <button className='bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95'>
// //     <Heart className="w-5 h-5" />
// //   </button>
// // </div>
// //         </div>

// //       </div>

// // <p className='text-lg font-medium mt-20'>Your Favorite Cast</p>
// // <div className='overflow-x-auto no-scrollbar mt-8 pb-4'>
// //   <div className='flex items-center gap-4 w-max px-4'>
// //     {show.movie.casts.slice(0, 12).map((cast, index) => (
// //       <div key={index} className='flex flex-col items-center text-center'>
// //         <img 
// //           src={cast.profile_path} 
// //           alt={cast.name} 
// //           className='rounded-full h-20 w-20 aspect-square object-cover' 
// //         />
// //         <p className='font-medium text-xs mt-3'>{cast.name}</p>
// //       </div>
// //     ))}
// //   </div>
// // </div>
// // <DateSelect dateTime={show.dateTime} id={id}/>
// // <p className='text-lg font-medium mt-20 mb-8'>You May Also Like</p>
// // <div className='flex flex-wrap max-sm:justify-center gap-8'>
// //   {dummyShowsData.slice(0, 4).map((movie, index) => (
// //     <MovieCard key={index} movie={movie} />
// //   ))}
// // </div>
 
// // <div className="flex justify-center mt-20">
// //   <button
// //     onClick={() => {
// //       router.push('/movies')
// //       scrollTo(0, 0)
// //     }}
// //     className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
// //   >
// //     Show more
// //   </button>
// // </div>


// //     </div>
// //   )
// // }

// // export default Page


// 'use client'

// import React, { useEffect, useState } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react'
// import toast from 'react-hot-toast'

// import BlurCircle from '@/components/BlurCircle'
// import timeFormat from '@/lib/timeFormat'
// import DateSelect from '@/components/DateSelect'
// import MovieCard from '@/components/MovieCard'
// import Loading from '@/components/Loading'

// const Page = () => {
//   const router = useRouter()
//   const params = useParams()
//   const id = params.id as string

//   const [show, setShow] = useState<any>(null)
//   const [allMovies, setAllMovies] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)
//   const [isFavorite, setIsFavorite] = useState(false)
//   const [favLoading, setFavLoading] = useState(false)

//   const imgBaseUrl = "https://image.tmdb.org/t/p/w500"

//   useEffect(() => {
//     const fetchMovieDetails = async () => {
//       try {
//         setLoading(true)
        
//         // 1. Fetch single show/movie details
//         const res = await fetch(`/api/show/${id}`)
//         const data = await res.json()

//         if (data.success) {
//           setShow(data.data)
//         }

//         // 2. Fetch all shows for recommendations
//         const allShowsRes = await fetch('/api/show/all')
//         const allShowsData = await allShowsRes.json()
        
//         if (allShowsData.success) {
//           setAllMovies(allShowsData.data.shows || [])
//         }

//         // 3. Check if movie is in user's favorites
//         const favRes = await fetch('/api/user/favorites')
//         const favData = await favRes.json()
//         if (favRes.ok && favData.success) {
//           const isFav = favData.movies?.some((m: any) => m._id === id)
//           setIsFavorite(!!isFav)
//         }
//       } catch (error) {
//         console.error("Failed to fetch movie details:", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     if (id) {
//       fetchMovieDetails()
//     }
//   }, [id])

//  const handleFavoriteToggle = async () => {
//   try {
//     setFavLoading(true);
//     const res = await fetch('/api/user/update-favorite', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ movieId: String(id) }),
//     });

//     const data = await res.json();

//     if (res.ok && data.success) {
//       setIsFavorite((prev) => !prev);
//       toast.success(data.message);
//     } else {
//       toast.error(data.message || "Failed to update favorite");
//     }
//   } catch (error) {
//     console.error(error);
//     toast.error("Failed to update favorite");
//   } finally {
//     setFavLoading(false);
//   }
// };

//   if (loading || !show) {
//     return <Loading />
//   }

//   const { movie, dateTime } = show

//   return (
//     <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
//       <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">

//         {/* Movie Poster */}
//         <div className="relative max-md:mx-auto h-104 w-70 rounded-xl overflow-hidden bg-gray-800">
//           <img
//             src={movie.poster_path ? `${imgBaseUrl}${movie.poster_path}` : ""}
//             alt={movie.title}
//             className="w-full h-full object-cover"
//           />
//         </div>

//         {/* Movie Details */}
//         <div className="relative flex flex-col gap-3">
//           <BlurCircle top="-100px" left="-100px" />

//           <p className="text-primary uppercase">
//             {movie.original_language}
//           </p>

//           <h1 className="text-4xl font-semibold max-w-96 text-balance">
//             {movie.title}
//           </h1>

//           <div className="flex items-center gap-2 text-gray-300">
//             <StarIcon className="w-5 h-5 text-primary fill-primary" />
//             <span>
//               {movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"} User Rating
//             </span>
//           </div> 

//           <p className="text-gray-400 text-sm leading-tight max-w-xl mt-2">
//             {movie.overview}
//           </p>

//           <p className="text-gray-400 text-sm mt-2">
//             {timeFormat(movie.runtime)} • {movie.genres?.map((genre: any) => genre.name).join(", ")} • {movie.release_date?.split("-")[0]}
//           </p> 

//           <div className='flex items-center flex-wrap gap-4 mt-4'>
//             <button className='flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'>
//               <PlayCircleIcon className="w-5 h-5" />
//               Watch Trailer
//             </button>

//             <a href="#dateSelect" className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95'>
//               Buy Tickets
//             </a>

//             {/* Favorite Toggle Button */}
//             <button 
//               onClick={handleFavoriteToggle}
//               disabled={favLoading}
//               className={`p-2.5 rounded-full transition cursor-pointer active:scale-95 border ${
//                 isFavorite 
//                   ? 'bg-red-500/20 border-red-500 text-red-500' 
//                   : 'bg-gray-700 border-transparent text-white hover:bg-gray-600'
//               }`}
//             >
//               <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Cast Section */}
//       <p className='text-lg font-medium mt-20'>Your Favorite Cast</p>
//       <div className='overflow-x-auto no-scrollbar mt-8 pb-4'>
//         <div className='flex items-center gap-4 w-max px-4'>
//           {movie.casts?.slice(0, 12).map((cast: any, index: number) => (
//             <div key={index} className='flex flex-col items-center text-center w-20'>
//               <img 
//                 src={cast.profile_path ? `${imgBaseUrl}${cast.profile_path}` : "https://via.placeholder.com/150"} 
//                 alt={cast.name} 
//                 className='rounded-full h-20 w-20 aspect-square object-cover bg-gray-800' 
//               />
//               <p className='font-medium text-xs mt-3 truncate w-full'>{cast.name}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div id="dateSelect">
//         <DateSelect dateTime={dateTime} id={id}/>
//       </div>

//       {/* Recommendations Section */}
//       <p className='text-lg font-medium mt-20 mb-8'>You May Also Like</p>
//       <div className='flex flex-wrap max-sm:justify-center gap-8'>
//         {allMovies.filter((m: any) => m._id !== id).slice(0, 4).map((movieItem: any, index: number) => (
//           <MovieCard key={index} movie={movieItem} />
//         ))}
//       </div>
     
//       <div className="flex justify-center mt-20">
//         <button
//           onClick={() => {
//             router.push('/movies')
//             scrollTo(0, 0)
//           }}
//           className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
//         >
//           Show more
//         </button>
//       </div>
//     </div>
//   )
// }

// export default Page