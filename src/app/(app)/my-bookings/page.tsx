'use client'

import BlurCircle from '@/components/BlurCircle';
import Loading from '@/components/Loading';
import { dateFormat } from '@/lib/dateFormat';
import timeFormat from '@/lib/timeFormat';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function Page() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || '$';
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // TMDB Image Base URL
  const imgBaseUrl = "https://image.tmdb.org/t/p/w500";

  const getMyBookings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/user/bookings');
      const data = await res.json();

      if (res.ok && data.success) {
        setBookings(data.data || []);
      } else {
        toast.error(data.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong while fetching bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getMyBookings();
  }, []);

  return !isLoading ? (
    <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]'>
      <BlurCircle top="100px" left="100px" />
      <div>
        <BlurCircle bottom="0px" left="600px" />
      </div>
      <h1 className='text-lg font-semibold mb-4'>My Bookings</h1>

      {bookings.length > 0 ? (
        bookings.map((item, index) => (
          <div key={index} className='flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-4 max-w-3xl'>
            <div className='flex flex-col md:flex-row gap-4'>
              <img 
                src={item.show?.movie?.poster_path ? `${imgBaseUrl}${item.show.movie.poster_path}` : ""} 
                alt={item.show?.movie?.title || "Movie Poster"} 
                className='md:w-36 aspect-video h-auto object-cover object-center rounded bg-gray-800' 
              />
              <div className='flex flex-col justify-between'>
                <div>
                  <p className='text-lg font-semibold'>{item.show?.movie?.title}</p>
                  <p className='text-gray-400 text-sm'>
                    {item.show?.movie?.runtime ? timeFormat(item.show.movie.runtime) : ""}
                  </p>
                </div>
                <p className='text-gray-400 text-sm mt-2'>
                  {item.show?.showDateTime ? dateFormat(item.show.showDateTime) : ""}
                </p>
              </div>
            </div>

            <div className='flex flex-col md:items-end md:text-right justify-between mt-4 md:mt-0'>
              <div className='flex items-center gap-4'>
                <p className='text-2xl font-semibold mb-3'>{currency}{item.amount}</p>
                {!item.isPaid && (
                  <button className='bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer hover:bg-primary-dull transition'>
                    Pay Now
                  </button>
                )}
              </div>
              <div className='text-sm'>
                <p><span className='text-gray-400'>Total Tickets:</span> {item.bookedSeats?.length || 0}</p>
                <p><span className='text-gray-400'>Seat Number:</span> {item.bookedSeats?.join(", ")}</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
          <p className='text-lg'>No bookings found.</p>
        </div>
      )}
    </div>
  ) : (
    <Loading />
  );
}

// 'use client'
// import { dummyBookingData } from '@/assets/assets';
// import BlurCircle from '@/components/BlurCircle';
// import Loading from '@/components/Loading';
// import { dateFormat } from '@/lib/dateFormat';
// import timeFormat from '@/lib/timeFormat';
// import React, { useEffect, useState } from 'react'

// function page() {
//   const currency = process.env.VITE_CURRENCY || '$'
//   const [bookings, setBookings] = useState([]);
// const [isLoading, setIsLoading] = useState(true);

// const getMyBookings = async () => {
//   setBookings(dummyBookingData);
//   setIsLoading(false);
// }

// useEffect(() => {
//   getMyBookings();
// }, []);
//   return !isLoading ? (
// <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]'>
//   <BlurCircle top="100px" left="100px" />
//   <div>
//     <BlurCircle bottom="0px" left="600px" />
//   </div>
//   <h1 className='text-lg font-semibold mb-4'>My Bookings</h1>

//   {bookings.map((item, index) => (
//     <div key={index} className='flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl'>
//       <div className='flex flex-col md:flex-row'>
//         <img src={item.show.movie.poster_path} alt="" className='md:max-w-45 aspect-video h-auto object-cover object-bottom rounded' />
//         <div className='flex flex-col p-4'>
//           <p className='text-lg font-semibold'>{item.show.movie.title}</p>
//           <p className='text-gray-400 text-sm'>{timeFormat(item.show.movie.runtime)}</p>
// <p className='text-gray-400 text-sm mt-auto'>{dateFormat(item.show.showDateTime)}</p>
//         </div>
//       </div>

// <div className='flex flex-col md:items-end md:text-right justify-between p-4'>
//   <div className='flex items-center gap-4'>
//     <p className='text-2xl font-semibold mb-3'>{currency}{item.amount}</p>
//     {!item.isPaid && <button className='bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer'>Pay Now</button>}
//   </div>
//   <div className='text-sm'>
//     <p><span className='text-gray-400'>Total Tickets:</span> {item.bookedSeats.length}</p>
//     <p><span className='text-gray-400'>Seat Number:</span> {item.bookedSeats.join(", ")}</p>
//   </div>
// </div>
//     </div>


//   ))}
// </div>
//   ):<Loading/>
// }

// export default page