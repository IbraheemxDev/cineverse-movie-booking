'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import BlurCircle from './BlurCircle'

interface DateSelectProps {
  dateTime?: Record<string, any[]>
  id: string
}

const DateSelect: React.FC<DateSelectProps> = ({ dateTime = {}, id }) => {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const onBookHandler = () => {
    if (!selectedDate) {
      return toast.error("Please select a date first")
    }
    router.push(`/movies/${id}/${selectedDate}`)
    scrollTo(0, 0)
  }

  const availableDates = Object.keys(dateTime || {})

  return (
    <div id='dateSelect' className='pt-30'>
      <div className='flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg'>
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle top="100px" right="0px" />

        <div>
          <p className='text-lg font-semibold'>Choose Date</p>
          <div className='flex items-center gap-6 text-sm mt-5'>
            <ChevronLeftIcon width={28} />
            <span className='grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4'>
              {availableDates.length > 0 ? (
                availableDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer transition ${
                      selectedDate === date
                        ? "bg-primary text-white"
                        : "border border-primary/70 hover:bg-primary/10"
                    }`}
                  >
                    <span>{new Date(date).getDate()}</span>
                    <span>{new Date(date).toLocaleDateString("en-US", { month: "short" })}</span>
                  </button>
                ))
              ) : (
                <span className="text-gray-400 text-xs">No shows available for this movie</span>
              )}
            </span>
            <ChevronRightIcon width={28} />
          </div>
        </div>

        <button
          disabled={availableDates.length === 0}
          className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onBookHandler}
        >
          Book Now
        </button>
      </div>
    </div>
  )
}

export default DateSelect

// 'use client'
// import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
// import React, { useState } from 'react'
// import toast from 'react-hot-toast'
// import BlurCircle from './BlurCircle'
// import { useRouter } from 'next/navigation'

// const DateSelect = ({dateTime,id }) => {
//     const router = useRouter();
//     const [selectedDate, setSelectedDate] = useState(null);
//     const onBookHandler = () => {
//         if(!selectedDate) {
//             return toast.error("Please select a date first");
//         }
//         router.push(`/movies/${id}/${selectedDate}`);
//         scrollTo(0,0);
//     };

//     return ( 
// <div id='dateSelect' className='pt-30'>
//   <div className='flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg'>
//     <BlurCircle top="-100px" left="-100px" />
//     <BlurCircle top="100px" right="0px" />
//     <div>
//       <p className='text-lg font-semibold'>Choose Date</p>
//       <div className='flex items-center gap-6 text-sm mt-5'>
//         <ChevronLeftIcon width={28} />
//         <span className='grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4'>
//   {Object.keys(dateTime).map((date) => (
//     <button 
//     onClick={() => setSelectedDate(date)}
//       key={date} 
//       className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer  ${selectedDate === date ? "bg-primary text-white":"border border-primary/70"}`}
//     >
//       <span>{new Date(date).getDate()}</span>
//       <span>{new Date(date).toLocaleDateString("en-US", { month: "short" })}</span>
//     </button>
//   ))}
// </span>
// <ChevronRightIcon width={28} />
//       </div>
//     </div>
   
// <button  className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer " onClick={onBookHandler}>
//   Book Now
// </button>
//   </div>
// </div>
//   )
// }

// export default DateSelect