"use client"
import React, { useEffect, useState } from 'react'
import Link from "next/link"
import {
    Bell,
    CircleDollarSign,
    CircleUser,
    HandCoins,
    Home,
    LineChart,
    Loader,
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { usePathname } from 'next/navigation'
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components'
import { prisma } from '@/lib/prismaClient'
import { useQuery } from '@tanstack/react-query'


const SideBar = () => {
    const path = usePathname()
    // const [sales, setSales]= useState(0)
    // useEffect(()=>{
    //     const number = async()=>{
    //         const count = await prisma.sales.count()
    //         setSales(count ?? 0)
    //     }

    //     number()

    // },[path])

    const { data, isLoading: Loading, error: queryError } = useQuery({
        queryKey: ["getsalescount"],
        queryFn: async () => {
            let today = new Date()
            today.setHours(0,0,0)
            const salecount = await prisma.sales.count({
                where: {
                    created_at: {
                        gte: today,
                        lt: new Date(today.getTime() + 86400000)
                    }
                }
            })

            return salecount
        }
    })
    return (
        <>
            <div className="hidden h-screen bg-background shadow-md border-r-2 md:block ">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center  px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Package2 className="h-6 w-6" />
                            <span className="text-titleLarge text-primary900">Dantech Inc</span>
                        </Link>
                        <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                            <Bell className="h-4 w-4" />
                            <span className="sr-only">Toggle notifications</span>
                        </Button>
                    </div>
                    <div className="flex-1">
                        <nav className=" space-y-4 py-4 grid items-start px-2 text-sm font-medium lg:px-4">
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
                                {Loading ? (<Loader className="text-white animate animate-spin rounded-full" />) : (
                                    <Badge className="ml- bg-primary800 text-white flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                                        {data ? data : ""}
                                    </Badge>
                                )}
                                {/* <Badge className="ml- bg-primary800 text-background flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                                    {sales}
                                </Badge> */}
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
                    </div>
                    <div className="mt-auto p-4">

                        <Button size="sm" className="w-full bg-primary800 hover:bg-primary700">
                            <LogoutLink>Log out</LogoutLink>
                        </Button>

                    </div>
                </div>
            </div>
        </>
    )
}

export default SideBar
