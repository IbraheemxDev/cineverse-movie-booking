'use client'

import Title from '@/components/admin/Title'
import Loading from '@/components/Loading'
import { dateFormat } from '@/lib/dateFormat'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface BookingItem {
  _id: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    image?: string;
  };
  show?: {
    _id?: string;
    showDateTime: string;
    movie?: {
      title?: string;
    };
  };
  amount: number;
  bookedSeats: string[];
  isPaid: boolean;
  createdAt: string;
}

const Page = () => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || '$'

  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchAllBookings = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/all-bookings')
      const result = await res.json()

      if (res.ok && result.success) {
        setBookings(result.data || [])
      } else {
        toast.error(result.message || 'Failed to fetch bookings')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Network error fetching bookings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllBookings()
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <Title text1="List" text2="Bookings" />
      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-3 font-medium pl-5">User Name</th>
              <th className="p-3 font-medium">Movie Name</th>
              <th className="p-3 font-medium">Show Time</th>
              <th className="p-3 font-medium">Seats</th>
              <th className="p-3 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-400">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((item) => {
                // Seats render handling (array ya object dono safe hain)
                const formattedSeats = Array.isArray(item.bookedSeats)
                  ? item.bookedSeats.join(', ')
                  : Object.values(item.bookedSeats || {}).join(', ')

                return (
                  <tr
                    key={item._id}
                    className="border-b border-primary/20 bg-primary/5 even:bg-primary/10 transition hover:bg-primary/20"
                  >
                    <td className="p-3 min-w-45 pl-5 font-medium text-white">
                      {item.user?.name || item.user?.email || 'Unknown User'}
                    </td>
                    <td className="p-3 text-gray-200">
                      {item.show?.movie?.title || 'Movie Unavailable'}
                    </td>
                    <td className="p-3 text-gray-300">
                      {item.show?.showDateTime
                        ? dateFormat(item.show.showDateTime)
                        : 'N/A'}
                    </td>
                    <td className="p-3 text-gray-300 font-mono">
                      {formattedSeats || 'None'}
                    </td>
                    <td className="p-3 font-medium text-white">
                      {currency} {item.amount}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Page
// 'use client'
// import { dummyBookingData } from '@/assets/assets';
// import Title from '@/components/admin/Title';
// import Loading from '@/components/Loading';
// import { dateFormat } from '@/lib/dateFormat';
// import React, { useEffect, useState } from 'react'

// const page = () => {
//     const currency = process.env.NEXT_PUBLIC_CURRENCY || '$';

// const [bookings, setBookings] = useState([]);
// const [isLoading, setIsLoading] = useState(true);

// const getAllBookings = async () => {
//   setBookings(dummyBookingData);
//   setIsLoading(false);
// };

// useEffect(() => {
//   getAllBookings();
// }, []);
//   return !isLoading ? (
// <>
//   <Title text1="List" text2="Bookings" />
//   <div className="max-w-4xl mt-6 overflow-x-auto">
//     <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
//       <thead>
//         <tr className="bg-primary/20 text-left text-white">
//           <th className="p-2 font-medium pl-5">User Name</th>
//           <th className="p-2 font-medium">Movie Name</th>
//           <th className="p-2 font-medium">Show Time</th>
//           <th className="p-2 font-medium">Seats</th>
//           <th className="p-2 font-medium">Amount</th>
//         </tr>
//       </thead>
//         <tbody className="text-sm font-light">
//   {bookings.map((item, index) => (
//     <tr key={index} className="border-b border-primary/20 bg-primary/5 even:bg-primary/10">
//       <td className="p-2 min-w-45 pl-5">{item.user.name}</td>
//       <td className="p-2">{item.show.movie.title}</td>
//       <td className="p-2">{dateFormat(item.show.showDateTime)}</td>
//       <td className="p-2">{Object.keys(item.bookedSeats).map(seat => item.bookedSeats[seat]).join(", ")}</td>
//       <td className="p-2">{currency} {item.amount}</td>
//     </tr>
//   ))}
// </tbody>

//     </table>
//   </div>
// </>
//   ):<Loading/>
// }

// export default page