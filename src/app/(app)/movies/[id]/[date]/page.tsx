'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRightIcon, ClockIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { assets } from '@/assets/assets'

import Loading from '@/components/Loading'
import BlurCircle from '@/components/BlurCircle'
import isoTimeFormat from '@/lib/isoTimeFormat'

type SelectedTime = {
  showId: string
  time: string
  price?: number
}

const Page = () => {
  const groupRows = [
    ['A', 'B'],
    ['C', 'D'],
    ['E', 'F'],
    ['G', 'H'],
    ['I', 'J'],
  ]

  const { id, date } = useParams() as {
    id: string
    date: string
  }

  const [selectedTime, setSelectedTime] = useState<SelectedTime | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([])
  const [showData, setShowData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  const router = useRouter()

  // 1. Fetch movie & show schedule details from database
  const fetchShowDetails = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/show/${id}`)
      const data = await res.json()

      if (data.success) {
        setShowData(data.data)
      } else {
        toast.error(data.message || "Failed to load show details")
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong while fetching shows")
    } finally {
      setLoading(false)
    }
  }

  // 2. Fetch already occupied/booked seats when a specific showtime is selected
  const fetchOccupiedSeats = async (showId: string) => {
    try {
      const res = await fetch(`/api/booking/seats/${showId}`)
      const data = await res.json()

      if (data.success) {
        setOccupiedSeats(data.data.occupiedSeats || [])
      }
    } catch (error) {
      console.error("Failed to fetch occupied seats", error)
    }
  }

  useEffect(() => {
    fetchShowDetails()
  }, [id])

  // Jab user timing select kare toh us show ki occupied seats fetch hon
  const handleTimeSelect = (item: SelectedTime) => {
    setSelectedTime(item)
    setSelectedSeats([]) // Purane selected seats clear kar dein
    fetchOccupiedSeats(item.showId)
  }

  const handleSeatClick = (seatId: string) => {
    if (!selectedTime) {
      return toast.error('Please select a time first')
    }

    // Check agar seat already occupied hai
    if (occupiedSeats.includes(seatId)) {
      return toast.error('This seat is already booked')
    }

    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      return toast.error('You can select a maximum of 5 seats')
    }

    setSelectedSeats((prevSeats) =>
      prevSeats.includes(seatId)
        ? prevSeats.filter((seat) => seat !== seatId)
        : [...prevSeats, seatId]
    )
  }

  // Calculate ticket price
  const ticketPrice = selectedTime?.price || showData?.ticketPrice || 10
  const totalAmount = selectedSeats.length * ticketPrice

  // 3. Handle Stripe Payment Checkout
  const handleCheckout = async () => {
    if (!selectedTime) {
      return toast.error('Please select a show timing')
    }

    if (selectedSeats.length === 0) {
      return toast.error('Please select at least one seat')
    }

    try {
      setBookingLoading(true)
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          showId: selectedTime.showId,
          movieTitle: showData?.movie?.title || showData?.title || 'Movie Ticket',
          seats: selectedSeats,
          totalAmount,
        }),
      })

      const data = await res.json()

      if (res.ok && data.url) {
        // Stripe Hosted Checkout Page par redirect
        window.location.href = data.url
      } else {
        toast.error(data.message || 'Failed to initialize payment')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('An error occurred during payment processing')
    } finally {
      setBookingLoading(false)
    }
  }

  const renderSeats = (row: string, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`
          const isOccupied = occupiedSeats.includes(seatId)
          const isSelected = selectedSeats.includes(seatId)

          return (
            <button
              key={seatId}
              disabled={isOccupied}
              onClick={() => handleSeatClick(seatId)}
              className={`h-8 w-8 rounded border border-primary/60 cursor-pointer text-xs font-medium transition ${
                isOccupied
                  ? 'bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed'
                  : isSelected
                  ? 'bg-primary text-white'
                  : 'hover:bg-primary/20'
              }`}
            >
              {seatId}
            </button>
          )
        })}
      </div>
    </div>
  )

  if (loading || !showData) {
    return <Loading />
  }

  const timingsList = showData.dateTime ? showData.dateTime[date] || [] : []

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">

      {/* Timing Selection Sidebar */}
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">
          Available Timings
        </p>

        <div className="mt-5 space-y-1">
          {timingsList.length > 0 ? (
            timingsList.map((item: any) => (
              <div
                onClick={() => handleTimeSelect(item)}
                key={item.showId}
                className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${
                  selectedTime?.showId === item.showId
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary/25'
                }`}
              >
                <ClockIcon className="w-4 h-4" />
                <p className="text-sm">
                  {isoTimeFormat(item.time)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 px-6">No shows available for this date.</p>
          )}
        </div>
      </div>

      {/* Seats Layout & Selection */}
      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />

        <h1 className="text-2xl font-semibold mb-4">
          Select your seat
        </h1>

        <Image
          src={assets.screenImage}
          alt="Screen"
        />

        <p className="text-gray-400 text-sm mb-6">
          SCREEN SIDE
        </p>

        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
            {groupRows[0].map((row) => renderSeats(row))}
          </div>

          <div className="grid grid-cols-2 gap-11">
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx}>
                {group.map((row) => renderSeats(row))}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Payment Button */}
        <button 
          onClick={handleCheckout}
          disabled={bookingLoading || selectedSeats.length === 0}
          className='flex items-center gap-2 mt-16 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25'
        >
          {bookingLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting to Stripe...
            </>
          ) : (
            <>
              {selectedSeats.length > 0 
                ? `Pay $${totalAmount} (${selectedSeats.length} ${selectedSeats.length === 1 ? 'Seat' : 'Seats'})` 
                : 'Select Seats to Proceed'}
              <ArrowRightIcon strokeWidth={2.5} className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default Page

// 'use client'

// import React, { useEffect, useState } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { ArrowRightIcon, ClockIcon } from 'lucide-react'
// import toast from 'react-hot-toast'
// import Image from 'next/image'
// import {
//   assets,
//   dummyDateTimeData,
//   dummyShowsData,
// } from '@/assets/assets'

// import Loading from '@/components/Loading'
// import BlurCircle from '@/components/BlurCircle'
// import isoTimeFormat from '@/lib/isoTimeFormat'

// type SelectedTime = {
//   time: string
//   price: number
// }

// type Show = {
//   movie: (typeof dummyShowsData)[number]
//   dateTime: typeof dummyDateTimeData
// }

// const Page = () => {
//   const groupRows = [
//     ['A', 'B'],
//     ['C', 'D'],
//     ['E', 'F'],
//     ['G', 'H'],
//     ['I', 'J'],
//   ]

//   const { id, date } = useParams() as {
//     id: string
//     date: string
//   }

//   const [selectedTime, setSelectedTime] = useState<SelectedTime | null>(null)
//   const [selectedSeats, setSelectedSeats] = useState<string[]>([])
//   const [show, setShow] = useState<Show | null>(null)

//   const router = useRouter()

//   const getShow = async () => {
//     const show = dummyShowsData.find((show) => show._id === id)

//     if (show) {
//       setShow({
//         movie: show,
//         dateTime: dummyDateTimeData,
//       })
//     }
//   }

//   const handleSeatClick = (seatId: string) => {
//     if (!selectedTime) {
//       return toast.error('Please select a time first')
//     }

//     if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
//       return toast.error('You can select a maximum of 5 seats')
//     }

//     setSelectedSeats((prevSeats) =>
//       prevSeats.includes(seatId)
//         ? prevSeats.filter((seat) => seat !== seatId)
//         : [...prevSeats, seatId]
//     )
//   }

//   const renderSeats = (row: string, count = 9) => (
//     <div key={row} className="flex gap-2 mt-2">
//       <div className="flex flex-wrap items-center justify-center gap-2">
//         {Array.from({ length: count }, (_, i) => {
//           const seatId = `${row}${i + 1}`

//           return (
//             <button
//               key={seatId}
//               onClick={() => handleSeatClick(seatId)}
//               className={`h-8 w-8 rounded border border-primary/60 cursor-pointer ${
//                 selectedSeats.includes(seatId)
//                   ? 'bg-primary text-white'
//                   : ''
//               }`}
//             >
//               {seatId}
//             </button>
//           )
//         })}
//       </div>
//     </div>
//   )

//   useEffect(() => {
//     getShow()
//   }, [])

//   if (!show) {
//     return <Loading />
//   }

//   return (
//     <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">

//       {/* Timing */}
//       <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
//         <p className="text-lg font-semibold px-6">
//           Available Timings
//         </p>

//         <div className="mt-5 space-y-1">
//           {show.dateTime[date]?.map((item) => (
//             <div
//               onClick={() => setSelectedTime(item)}
//               key={item.time}
//               className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${
//                 selectedTime?.time === item.time
//                   ? 'bg-primary text-white'
//                   : 'hover:bg-primary/25'
//               }`}
//             >
//               <ClockIcon className="w-4 h-4" />

//               <p className="text-sm">
//                 {isoTimeFormat(item.time)}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Seats Layout */}
//       <div className="relative flex-1 flex flex-col items-center max-md:mt-16">

//         <BlurCircle top="-100px" left="-100px" />
//         <BlurCircle bottom="0" right="0" />

//         <h1 className="text-2xl font-semibold mb-4">
//           Select your seat
//         </h1>
//              <Image
//                         src={assets.screenImage}
//                         alt="Screen"
//                         // className="w-full max-w-md"
//                       />
       

//         <p className="text-gray-400 text-sm mb-6">
//           SCREEN SIDE
//         </p>

//         <div className="flex flex-col items-center mt-10 text-xs text-gray-300">

//           <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
//             {groupRows[0].map((row) => renderSeats(row))}
//           </div>

//           <div className="grid grid-cols-2 gap-11">
//             {groupRows.slice(1).map((group, idx) => (
//               <div key={idx}>
//                 {group.map((row) => renderSeats(row))}
//               </div>
//             ))}
//           </div>

//         </div>
//        <button 
//     onClick={() => router.push('/my-bookings')} 
//     className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95'
//   >
//     Proceed to Checkout
//     <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
//   </button>
//       </div>
//     </div>
//   )
// }

// export default Page
