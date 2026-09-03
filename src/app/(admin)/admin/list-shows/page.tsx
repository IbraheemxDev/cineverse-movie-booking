'use client';

import Title from '@/components/admin/Title';
import Loading from '@/components/Loading';
import { dateFormat } from '@/lib/dateFormat';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Movie {
  _id: string;
  title: string;
  poster_path?: string;
  vote_average?: number;
}

interface Show {
  _id: string;
  movie?: Movie;
  showDateTime: string;
  showPrice: number;
  occupiedSeats?: Record<string, string>;
}

const Page = () => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || '$';

  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchShows = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/all-shows');
      const result = await res.json();

      if (res.ok && result.success) {
        setShows(result.data || []);
      } else {
        toast.error(result.message || 'Failed to fetch shows');
      }
    } catch (error) {
      console.error('Error fetching shows:', error);
      toast.error('Network error fetching shows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Title text1="List" text2="Shows" />
      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-3 font-medium pl-5">Movie Name</th>
              <th className="p-3 font-medium">Show Time</th>
              <th className="p-3 font-medium">Total Bookings</th>
              <th className="p-3 font-medium">Earnings</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {shows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-6 text-gray-400">
                  No upcoming shows found
                </td>
              </tr>
            ) : (
              shows.map((show) => {
                const totalBookings = Object.keys(show.occupiedSeats || {}).length;
                const earnings = totalBookings * (show.showPrice || 0);

                return (
                  <tr
                    key={show._id}
                    className="border-b border-primary/10 bg-primary/5 even:bg-primary/10 hover:bg-primary/20 transition"
                  >
                    <td className="p-3 min-w-45 pl-5 font-medium text-white">
                      {show.movie?.title || 'Unknown Movie'}
                    </td>
                    <td className="p-3 text-gray-300">
                      {show.showDateTime ? dateFormat(show.showDateTime) : 'N/A'}
                    </td>
                    <td className="p-3 text-gray-300 font-mono">
                      {totalBookings}
                    </td>
                    <td className="p-3 font-medium text-white">
                      {currency} {earnings}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Page;
// 'use client'

// import { dummyShowsData } from '@/assets/assets';
// import Title from '@/components/admin/Title';
// import Loading from '@/components/Loading';
// import { dateFormat } from '@/lib/dateFormat';
// import React, { useEffect, useState } from 'react';

// interface Movie {
//   _id: string;
//   title: string;
//   overview?: string;
//   poster_path?: string;
//   backdrop_path?: string;
//   release_date?: string;
//   original_language?: string;
//   tagline?: string;
//   genres?: { id: number; name: string }[];
//   casts?: unknown[];
//   vote_average?: number;
//   vote_count?: number;
//   runtime?: number;
// }

// interface Show {
//   movie: Movie;
//   showDateTime: string;
//   showPrice: number;
//   occupiedSeats: Record<string, string>;
// }

// const Page = () => {

//   const currency = process.env.NEXT_PUBLIC_CURRENCY || '$';

//   const [shows, setShows] = useState<Show[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   const getAllShows = async (): Promise<void> => {
//     try {
//       setShows([{
//         movie: dummyShowsData[0],
//         showDateTime: "2025-06-30T02:30:00.000Z",
//         showPrice: 59,
//         occupiedSeats: {
//           A1: "user_1",
//           B1: "user_2",
//           C1: "user_3"
//         }
//       }]);
//       setLoading(false);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     getAllShows();
//   }, []);

//   return !loading ? (
//     <>
//       <Title text1="List" text2="Shows" />
//       <div className="max-w-4xl mt-6 overflow-x-auto">
//         <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
//           <thead>
//             <tr className="bg-primary/20 text-left text-white">
//               <th className="p-2 font-medium pl-5">Movie Name</th>
//               <th className="p-2 font-medium">Show Time</th>
//               <th className="p-2 font-medium">Total Bookings</th>
//               <th className="p-2 font-medium">Earnings</th>
//             </tr>
//           </thead>
//           <tbody className="text-sm font-light">
//             {shows.map((show, index) => (
//               <tr key={index} className="border-b border-primary/10 bg-primary/5 even:bg-primary/10">
//                 <td className="p-2 min-w-45 pl-5">{show.movie.title}</td>
//                 <td className="p-2">{dateFormat(show.showDateTime)}</td>
//                 <td className="p-2">{Object.keys(show.occupiedSeats).length}</td>
//                 <td className="p-2">{currency} {Object.keys(show.occupiedSeats).length * show.showPrice}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </>
//   ) : (
//     <Loading />
//   );
// };

// export default Page;