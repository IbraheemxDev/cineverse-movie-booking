'use client'

import React, { useEffect, useState } from 'react'
import Title from '@/components/admin/Title'
import Loading from '@/components/Loading'
import { kConverter } from '@/lib/kConverter'
import { CheckIcon, Trash2Icon, StarIcon } from 'lucide-react'
import toast from 'react-hot-toast'

interface Movie {
  id: string | number;
  _id?: string;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
}

type DateTimeSelection = Record<string, string[]>;

const Page = () => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || '$'
  const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([])
  const [loadingMovies, setLoadingMovies] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [dateTimeSelection, setDateTimeSelection] = useState<DateTimeSelection>({})
  const [dateTimeInput, setDateTimeInput] = useState<string>("")
  const [showPrice, setShowPrice] = useState<string>("")

  // Fetch real movies from backend TMDB endpoint
  const fetchNowPlayingMovies = async (): Promise<void> => {
    try {
      setLoadingMovies(true)
      const res = await fetch('/api/show/now-playing')
      const data = await res.json()
      if (res.ok && data?.data?.movies) {
        setNowPlayingMovies(data.data.movies)
      } else {
        toast.error(data.message || 'Failed to fetch now playing movies')
      }
    } catch (error) {
      console.error(error)
      toast.error('Network error fetching movies')
    } finally {
      setLoadingMovies(false)
    }
  }

  const handleDateTimeAdd = (): void => {
    if (!dateTimeInput) return
    const [date, time] = dateTimeInput.split("T")
    if (!date || !time) return

    setDateTimeSelection((prev) => {
      const times = prev[date] || []
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time] }
      }
      return prev
    })
  }

  const handleRemoveTime = (date: string, time: string): void => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time)
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev
        return rest
      }
      return {
        ...prev,
        [date]: filteredTimes,
      }
    })
  }

  // Submit Shows to backend addShow controller
  const handleAddShow = async (): Promise<void> => {
    if (!selectedMovie) {
      toast.error('Please select a movie first')
      return
    }

    if (!showPrice || Number(showPrice) <= 0) {
      toast.error('Please provide a valid show price')
      return
    }

    if (Object.keys(dateTimeSelection).length === 0) {
      toast.error('Please select at least one date and time')
      return
    }

    // Backend controller expects format: [{ date: "...", time: ["...", "..."] }]
    const showsInput = Object.entries(dateTimeSelection).map(([date, time]) => ({
      date,
      time,
    }))

    const movieId = String(selectedMovie.id || selectedMovie._id)

    try {
      setSubmitting(true)
      const res = await fetch('/api/show/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId,
          showPrice: Number(showPrice),
          showsInput,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success(data.message || 'Shows added successfully')
        setSelectedMovie(null)
        setDateTimeSelection({})
        setShowPrice('')
        setDateTimeInput('')
      } else {
        toast.error(data.message || 'Failed to add shows')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error submitting shows')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    fetchNowPlayingMovies()
  }, [])

  if (loadingMovies) {
    return <Loading />
  }

  return (
    <>
      <Title text1="Add" text2="Shows" />
      <p className="mt-10 text-lg font-medium">Now Playing Movies</p>
      
      <div className="overflow-x-auto pb-4">
        <div className="group flex flex-wrap gap-4 mt-4 w-max">
          {nowPlayingMovies.map((movie) => {
            const isSelected =
              String(selectedMovie?.id || selectedMovie?._id) ===
              String(movie.id || movie._id)

            const posterSrc = movie.poster_path?.startsWith('http')
              ? movie.poster_path
              : `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`

            return (
              <div
                key={movie.id}
                className={`relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition duration-300 ${
                  isSelected ? "border-2 border-primary rounded-md" : ""
                }`}
                onClick={() => setSelectedMovie(movie)}
              >
                <div className='relative rounded-lg overflow-hidden'>
                  <img
                    src={posterSrc}
                    alt={movie.title}
                    className="w-full h-56 object-cover brightness-90"
                  />
                  <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
                    <p className="flex items-center gap-1 text-gray-400">
                      <StarIcon className="w-4 h-4 text-primary fill-primary" />
                      {movie.vote_average?.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-gray-300">
                      {kConverter(movie.vote_count || 0)} Votes
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded z-10">
                    <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                )}
                
                <p className="font-medium truncate mt-2">{movie.title}</p>
                <p className="text-gray-400 text-sm">{movie.release_date}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Show Price Input */}
      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">Show Price</label>
        <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
          <p className="text-gray-400 text-sm">{currency}</p>
          <input
            min={0}
            type="number"
            value={showPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowPrice(e.target.value)}
            placeholder="Enter show price"
            className="outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Date & Time Selection */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Select Date and Time</label>
        <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">
          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTimeInput(e.target.value)}
            className="outline-none rounded-md bg-transparent"
          />
          <button
            onClick={handleDateTimeAdd}
            className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer"
          >
            Add Time
          </button>
        </div>
      </div>

      {/* Display Selected Times */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 font-medium">Selected Date-Time</h2>
          <ul className="space-y-3">
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date}>
                <div className="font-medium text-sm text-gray-300">{date}</div>
                <div className="flex flex-wrap gap-2 mt-1 text-sm">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="border border-primary px-2 py-1 flex items-center rounded bg-primary/10"
                    >
                      <span>{time}</span>
                      <Trash2Icon
                        onClick={() => handleRemoveTime(date, time)}
                        width={15}
                        className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add Show Button */}
      <button
        disabled={submitting}
        onClick={handleAddShow}
        className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Adding Show...' : 'Add Show'}
      </button>
    </>
  )
}

export default Page

// 'use client'
// import { dummyShowsData } from '@/assets/assets';
// import Title from '@/components/admin/Title';
// import Loading from '@/components/Loading';
// import { kConverter } from '@/lib/kConverter';
// import { CheckIcon, DeleteIcon, StarIcon } from 'lucide-react';
// import React, { useEffect, useState } from 'react'

// interface Movie {
//   id: string | number;
//   _id: string;
//   title: string;
//   poster_path: string;
//   release_date: string;
//   vote_average: number;
//   vote_count: number;
// }

// type DateTimeSelection = Record<string, string[]>;

// const Page = () => {
//   const currency = process.env.NEXT_PUBLIC_CURRENCY || '$';

//   const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
//   const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
//   const [dateTimeSelection, setDateTimeSelection] = useState<DateTimeSelection>({});
//   const [dateTimeInput, setDateTimeInput] = useState<string>("");
//   const [showPrice, setShowPrice] = useState<string>("");

//   const fetchNowPlayingMovies = async (): Promise<void> => {
//     setNowPlayingMovies(dummyShowsData);
//   };

//   const handleDateTimeAdd = (): void => {
//     if (!dateTimeInput) return;
//     const [date, time] = dateTimeInput.split("T");
//     if (!date || !time) return;

//     setDateTimeSelection((prev) => {
//       const times = prev[date] || [];
//       if (!times.includes(time)) {
//         return { ...prev, [date]: [...times, time] };
//       }
//       return prev;
//     });
//   };

//   const handleRemoveTime = (date: string, time: string): void => {
//     setDateTimeSelection((prev) => {
//       const filteredTimes = prev[date].filter((t) => t !== time);
//       if (filteredTimes.length === 0) {
//         const { [date]: _, ...rest } = prev;
//         return rest;
//       }
//       return {
//         ...prev,
//         [date]: filteredTimes,
//       };
//     });
//   };

//   useEffect(() => {
//     fetchNowPlayingMovies();
//   }, []);

//   return nowPlayingMovies.length > 0 ? (
//     <>
//       <Title text1="Add" text2="Shows" />
//       <p className="mt-10 text-lg font-medium">Now Playing Movies</p>
//       <div className="overflow-x-auto pb-4">
//         <div className="group flex flex-wrap gap-4 mt-4 w-max">
//           {nowPlayingMovies.map((movie) => (
//             <div
//               key={movie.id}
//               className={`relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition duration-300 ${
//                 selectedMovie?._id === movie._id ? "border-2 border-primary rounded-md" : ""
//               }`}
//               onClick={() => setSelectedMovie(movie)}
//             >
//                 <div className='relative rounded-lg overflow-hidden'>

                
//               <img src={movie.poster_path} alt="" className="w-full object-cover brightness-90" />
//               <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
//                 <p className="flex items-center gap-1 text-gray-400">
//                   <StarIcon className="w-4 h-4 text-primary fill-primary" />
//                   {movie.vote_average.toFixed(1)}
//                 </p>
//                 <p className="text-gray-300">{kConverter(movie.vote_count)} Votes</p>
//               </div>
             
//               </div>
//               {selectedMovie?._id === movie._id && (
//   <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">
//     <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
//   </div>
// )} <p className="font-medium truncate">{movie.title}</p>
//               <p className="text-gray-400 text-sm">{movie.release_date}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//       {/* Show Price Input */}
// <div className="mt-8">
//   <label className="block text-sm font-medium mb-2">Show Price</label>
//   <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
//     <p className="text-gray-400 text-sm">{currency}</p>
//     <input
//       min={0}
//       type="number"
//       value={showPrice}
//       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowPrice(e.target.value)}
//       placeholder="Enter show price"
//       className="outline-none bg-transparent"
//     />
//   </div>
// </div>
// {/* Date & Time Selection */}
// <div className="mt-6">
//   <label className="block text-sm font-medium mb-2">Select Date and Time</label>
//   <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">
//     <input
//       type="datetime-local"
//       value={dateTimeInput}
//       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTimeInput(e.target.value)}
//       className="outline-none rounded-md bg-transparent"
//     />
//     <button
//       onClick={handleDateTimeAdd}
//       className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer"
//     >
//       Add Time
//     </button>
//   </div>
// </div>

// {/* Display Selected Times */}
// {Object.keys(dateTimeSelection).length > 0 && (
//   <div className="mt-6">
//     <h2 className="mb-2">Selected Date-Time</h2>
//     <ul className="space-y-3">
//       {Object.entries(dateTimeSelection).map(([date, times]) => (
//         <li key={date}>
//           <div className="font-medium">{date}</div>
//           <div className="flex flex-wrap gap-2 mt-1 text-sm">
//             {times.map((time) => (
//               <div key={time} className="border border-primary px-2 py-1 flex items-center rounded">
//                 <span>{time}</span>
//                 <DeleteIcon onClick={() => handleRemoveTime(date, time)} width={15} className="ml-2 text-red-500 hover:text-red-700 cursor-pointer" />
//               </div>
//             ))}
//           </div>
//         </li>
//       ))}
//     </ul>
//   </div>
// )}
// <button className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer">
//   Add Show
// </button>
//     </>
//   ) : <Loading />
// }

// export default Page