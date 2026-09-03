'use client'

import React, { useEffect, useState } from 'react'
import BlurCircle from './BlurCircle'
import ReactPlayer from 'react-player'
import { PlayCircleIcon, ExternalLink } from 'lucide-react'

interface TrailerItem {
  id: string;
  title: string;
  videoUrl: string;
  image: string;
}

const TrailerSection = () => {
  const [trailers, setTrailers] = useState<TrailerItem[]>([])
  const [currentTrailer, setCurrentTrailer] = useState<TrailerItem | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [hasPlaybackError, setHasPlaybackError] = useState<boolean>(false)

  useEffect(() => {
    const fetchTrailers = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/show/trailers')
        const result = await res.json()

        if (res.ok && result.data?.trailers?.length > 0) {
          setTrailers(result.data.trailers)
          setCurrentTrailer(result.data.trailers[0])
        }
      } catch (error) {
        console.error('Failed to fetch trailers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrailers()
  }, [])

  // Trailer switch karte waqt error state reset karein
  const handleTrailerSelect = (trailer: TrailerItem) => {
    setHasPlaybackError(false)
    setCurrentTrailer(trailer)
  }

  if (loading || !currentTrailer) {
    return null
  }

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">
      <p className="text-gray-300 font-medium text-lg max-w-[960px] mx-auto">
        Trailers
      </p>

      <div className="relative mt-6 max-w-[960px] mx-auto">
        <BlurCircle top="-100px" right="-100px" />

        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/80 border border-white/10 shadow-2xl">
          {hasPlaybackError ? (
            // Custom fallback agar YouTube video age-restrict ya disabled ho
            <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-6 bg-cover bg-center"
                 style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85)), url(${currentTrailer.image})` }}>
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                {currentTrailer.title}
              </h3>
              <p className="text-sm text-gray-300 max-w-md mb-6">
                This trailer is age-restricted by YouTube and cannot be embedded directly.
              </p>
              <a
                href={currentTrailer.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dull text-white text-sm font-medium rounded-full transition shadow-lg"
              >
                Watch on YouTube
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <ReactPlayer
              key={currentTrailer.videoUrl}
              src={currentTrailer.videoUrl}
              controls
              playing={false}
              width="100%"
              height="100%"
              onError={() => {
                // Catch YouTube error 150 or age-restriction failure
                setHasPlaybackError(true)
              }}
            />
          )}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="group grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto">
        {trailers.map((trailer) => {
          const isSelected = currentTrailer.videoUrl === trailer.videoUrl

          return (
            <div
              key={trailer.id}
              onClick={() => handleTrailerSelect(trailer)}
              className={`relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition h-28 md:h-36 rounded-lg overflow-hidden cursor-pointer border ${
                isSelected ? 'border-primary ring-2 ring-primary' : 'border-transparent'
              }`}
            >
              <img
                src={trailer.image}
                alt={trailer.title}
                className="w-full h-full object-cover brightness-75"
              />

              <PlayCircleIcon
                strokeWidth={1.6}
                className="absolute top-1/2 left-1/2 w-6 md:w-8 h-6 md:h-8 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-md"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TrailerSection