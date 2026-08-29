'use client'

import AdminNavbar from "@/components/admin/AdminNavbar"
import AdminSidebar from "@/components/admin/AdminSidebar"

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AdminNavbar />
      <div className='flex'>
        <AdminSidebar />
        <div className='flex-1 px-4 py-10 md:px-10 h-[calc(100vh-64px)] overflow-y-auto'>
        {children}
        </div>
      </div>
    </>
  )
}

export default AdminLayout