import Footer from "@/components/Footer";
import LayoutContent from "@/components/LayoutContent";
import Navbar from "@/components/Navbar";
import {Toaster} from "react-hot-toast";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {children}
      <Footer/>
    </div>
  );
}