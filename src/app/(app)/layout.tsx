import LayoutContent from "@/components/LayoutContent";
import {Toaster} from "react-hot-toast";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <LayoutContent>{children}</LayoutContent>
    </div>
  );
}