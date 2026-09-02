'use client'

import AdminNavbar from "@/components/admin/AdminNavbar"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Yeh line add karein taake browser console mein session check ho sake
  console.log("FULL SESSION DATA:", session);

  useEffect(() => {
    if (!isPending) {
      console.log("User Role:", session?.user?.role);
      if (!session || session.user.role !== "admin") {
        router.push('/');
      }
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

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