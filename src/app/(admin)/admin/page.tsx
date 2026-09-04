'use client'

import React, { useEffect, useState } from 'react'
import { 
  ChartLineIcon, 
  CircleDollarSignIcon, 
  PlayCircleIcon, 
  StarIcon, 
  UsersIcon 
} from 'lucide-react'
import Loading from '@/components/Loading'
import BlurCircle from '@/components/BlurCircle'
import { dateFormat } from '@/lib/dateFormat'
import toast from 'react-hot-toast'

interface Movie {
  _id: string;
  title: string;
  poster_path: string;
  vote_average: number;
}

interface ActiveShow {
  _id: string;
  movie?: Movie;
  showDateTime: string;
  showPrice: number;
}

interface DashboardData {
  totalBookings: number;
  totalRevenue: number;
  activeShows: ActiveShow[];
  totalUsers: number;
}

const Page = () => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || '$'
  const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUsers: 0,
  })

  const [loading, setLoading] = useState<boolean>(true)

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/dashboard')
      const result = await res.json()

      if (res.ok && result.success) {
        setDashboardData({
          totalBookings: result.data.totalBookings || 0,
          totalRevenue: result.data.totalRevenue || 0,
          activeShows: result.data.activeShows || [],
          totalUsers: result.data.totalUsers || 0, // Matched with backend
        })
      } else {
        toast.error(result.message || 'Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      toast.error('Network error fetching dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const dashboardCards = [
    { 
      title: "Total Bookings", 
      value: dashboardData.totalBookings, 
      icon: ChartLineIcon 
    },
    { 
      title: "Total Revenue", 
      value: `${currency} ${dashboardData.totalRevenue}`, 
      icon: CircleDollarSignIcon 
    },
    { 
      title: "Active Shows", 
      value: dashboardData.activeShows.length, 
      icon: PlayCircleIcon 
    },
    { 
      title: "Total Users", 
      value: dashboardData.totalUsers, 
      icon: UsersIcon 
    }
  ]

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <div className="relative flex flex-wrap gap-4 mt-6">
        <BlurCircle top="-100px" left="0" />
        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCards.map((card, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full"
            >
              <div>
                <h1 className="text-sm text-gray-300">{card.title}</h1>
                <p className="text-xl font-medium mt-1 text-white">
                  {card.value}
                </p>
              </div>
              <card.icon className="w-6 h-6 text-primary" />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-10 text-lg font-medium">Active Shows</p>

      {dashboardData.activeShows.length === 0 ? (
        <p className="mt-4 text-gray-400 text-sm">No active shows scheduled right now.</p>
      ) : (
        <div className="relative flex flex-wrap gap-6 mt-4 max-w-5xl">
          <BlurCircle top="100px" left="-10%" />
          {dashboardData.activeShows.map((show) => {
            const posterSrc = show.movie?.poster_path
              ? show.movie.poster_path.startsWith('http')
                ? show.movie.poster_path
                : `${TMDB_IMAGE_BASE_URL}${show.movie.poster_path}`
              : '/placeholder.png'

            return (
              <div 
                key={show._id} 
                className="w-55 rounded-lg overflow-hidden h-full pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300"
              >
                <img 
                  src={posterSrc} 
                  alt={show.movie?.title || 'Movie'} 
                  className="h-60 w-full object-cover" 
                />
                <p className="font-medium p-2 truncate text-white">
                  {show.movie?.title || 'Untitled Movie'}
                </p>
                <div className="flex items-center justify-between px-2">
                  <p className="text-lg font-medium text-white">
                    {currency} {show.showPrice}
                  </p>
                  <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    {show.movie?.vote_average?.toFixed(1) || '0.0'}
                  </p>
                </div>
                <p className="px-2 pt-2 text-sm text-gray-400">
                  {dateFormat(show.showDateTime)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

export default Page
