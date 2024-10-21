import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import { Toaster } from 'react-hot-toast';
import { ReactQueryProvider } from "./QueryClientProvider";
import SideBar from "@/components/layout/SideBar";
import Navbar from "@/components/layout/NavBar";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";
import { KindeAuthProvider } from "./KindeAuthProvider";
import { ReduxProvider } from "./ReduxProvider";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prismaClient";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dantech solutions",
  description: "we offer cutting edging solutions as well a vast variety of technology products to suit your needs",
};

async function SalesCount(){
  let today = new Date()
  today.setHours(0,0,0)
  const salecount = await prisma.sales.aggregate({
      where: {
          created_at: {
              gte: today,
              lt: new Date(today.getTime() + 86400000)
          }
      },
      _count:{
          inventoryId:true
      }
  })


  // console.log(salecount?._count, 'sal')

  return salecount?._count || 0
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const salescount= await SalesCount() 


  
  return (
    <html lang="en">
      <body className={cn("min-h-screen relative bg-primary50", montserrat.className)}>
        <main className="text-bodyLarge">
          <KindeAuthProvider>
            <ReduxProvider>
              <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                  // Define default options
                  className: '',
                  duration: 5000,
                  style: {
                    background: '#EFF0FE',
                    color: '#000',
                  },

                  // Default options for specific types
                  success: {
                    duration: 3000,
                  },
                }}
              />
              <ReactQueryProvider>
                <div className="flex w-full">
                  <div className="">
                    <div className="fixed lg:w-[280px] md:w-[220px]">
                      <SideBar  salecount={salescount}/>
                    </div>
                  </div>

                  <Navbar>
                    {children}

                    <Footer />

                  </Navbar>

                </div>
              </ReactQueryProvider>
            </ReduxProvider>
          </KindeAuthProvider>
        </main>
      </body>
    </html>
  );
}
