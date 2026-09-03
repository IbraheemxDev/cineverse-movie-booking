'use client'

import AdminNavbar from "@/components/admin/AdminNavbar"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Better-Auth user type mein custom role field ko type-safe banaya
  const user = session?.user as (typeof session extends { user: infer U } ? U : any) & { role?: string };

  useEffect(() => {
    if (!isPending) {
      if (!user || user.role !== "admin") {
        router.push('/');
      }
    }
  }, [user, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
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
  );
};

export default AdminLayout;