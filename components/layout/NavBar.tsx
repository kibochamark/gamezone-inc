"use client"
import React, { ReactNode } from 'react'
import Link from "next/link"
import {
  Bell,
  CircleDollarSign,
  CircleUser,
  HandCoins,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  PieChart,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { usePathname } from 'next/navigation'
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components'
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import Image from 'next/image'

const Navbar = ({ children }: { children: ReactNode }) => {
  const path = usePathname()
  const {
    isLoading,
    user,
    permissions,
    organization,
    userOrganizations,
    accessToken,
    getBooleanFlag,
    getClaim,
    getFlag,
    getIntegerFlag,
    getPermission,
    getStringFlag,
    isAuthenticated,
    error
  } = useKindeAuth();

  // if (isLoading) return <div>Loading...</div>;


  return (
    <div className='w-full lg:ml-[280px] md:ml-[220px]'>

      <div className="flex flex-col w-full min-h-screen">
        <header className="fixed top-0 w-full h-16 py-2 flex items-center backdrop-blur-lg gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                                      <SheetClose asChild>

              <nav className="grid space-y-4 py-4 gap-2 text-lg font-medium">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-3 ${path.includes("dashboard") && "dark:bg-primary100 text-primary bg-primary50 "} rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary`}
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/sales"
                  className={`flex items-center gap-3 ${path.includes("sales") && "dark:bg-primary100 text-primary bg-primary50 "} rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Sales
                  <Badge className="ml- bg-primary800 text-background flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    6
                  </Badge>
                </Link>
                <Link
                  href="/inventory"
                  className={`flex items-center gap-3 ${path.includes("inventory") && "dark:bg-primary100 text-primary bg-primary50 "}rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary`}
                >
                  <Package className="h-4 w-4" />
                  Inventory{" "}
                </Link>

                <Link
                  href="/services"
                  className={`flex items-center gap-3 rounded-lg ${path.includes("services") && "dark:bg-primary100 text-primary bg-primary50 "} px-3 py-2 text-muted-foreground transition-all hover:text-primary`}
                >
                  <HandCoins className="h-4 w-4" />
                  Services
                </Link>
                <Link
                  href="/expenses"
                  className={`flex items-center gap-3 rounded-lg ${path.includes("expenses") && "dark:bg-primary100 text-primary bg-primary50 "} px-3 py-2 text-muted-foreground transition-all hover:text-primary`}
                >
                  <CircleDollarSign className="h-4 w-4" />
                  Expenses
                </Link>
                <Link
                  href="/managecategories"
                  className={`flex items-center gap-3 rounded-lg ${path.includes("managecategories") && "dark:bg-primary100 text-primary bg-primary50 "} px-3 py-2 text-muted-foreground transition-all hover:text-primary`}
                >
                  <PieChart className="h-4 w-4" />
                  Manage categories
                </Link>
                <Link
                  href="#"
                  className={`flex items-center gap-3 ${path.includes("reports") && "dark:bg-primary100 text-primary bg-primary50 "} rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary`}
                >
                  <LineChart className="h-4 w-4" />
                  Reports
                </Link>
              </nav>
              <div className="mt-auto">
                <Button size="sm" className="w-full bg-primary800 hover:bg-primary700">
                  Logout
                </Button>
              </div>
                                      </SheetClose>

            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full md:mr-[280px]">
                {user?.family_name ? (
                  <p className='text-titleLarge capitalize font-semibold'>{user?.family_name.charAt(0)}</p>
                ) : (
                  <CircleUser className="h-5 w-5" />
                )}

                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="bg-primary800 text-white"><LogoutLink>Log out</LogoutLink></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="pt-16 my-6 w-full  md:p-4 lg:pt-[60px] lg:p-6">
          <div className='flex md:justify-end md:items-end justify-center items-center my-2'>
            <p className='font-semibold'>👋 Welcome back {user?.given_name} </p>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Navbar
