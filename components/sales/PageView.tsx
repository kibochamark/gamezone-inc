"use client"
import React, { useState } from 'react'
import Link from "next/link"
import Image from "next/image"
import {
    DollarSign,
    File,
    Home,
    LineChart,
    ListFilter,
    MoreHorizontal,
    Package,
    Package2,
    PanelLeft,
    PieChart,
    PlusCircle,
    Search,
    Settings,
    ShoppingCart,
    Users2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DataTable } from '../reusables/DataGrid'
import { columns } from './columns'
import DeleteItems from '../reusables/DeleteItems'
import { deleteSale } from './SalesActions'



const PageView = ({sales, permissions}:{sales:any; permissions:any}) => {


    return (
        <div>
            {sales?.length > 0 ? (
                <div className="flex min-h-screen w-full flex-col p-4 gap-2">
                    <h2 className="text-titleLarge font-bold mb-4">Sales</h2>
                    <main className="flex flex-1 flex-col gap-4 w-full md:gap-8">
                        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">

                            <Card x-chunk="dashboard-01-chunk-0">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Revenue
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-primary500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary600">$45,231.89</div>
                                    <p className="text-xs text-muted-foreground">
                                        today
                                    </p>
                                </CardContent>
                            </Card>
                            <Card x-chunk="dashboard-01-chunk-0">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Profit
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-primary500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary600">$45,231.89</div>
                                    <p className="text-xs text-muted-foreground">
                                        today
                                    </p>
                                </CardContent>
                            </Card>


                        </div>
                        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
                            <div className="overflow-x-scroll md:overflow-hidden col-span-2">
                                <Card
                                    className="xl:col-span-2" x-chunk="dashboard-01-chunk-4"
                                >
                                    <CardHeader className="flex flex-row items-center">
                                        <div className="grid gap-2">
                                            <CardTitle>All Sales</CardTitle>
                                            <CardDescription>
                                                manage your sales
                                            </CardDescription>
                                        </div>
                                        <div className="ml-auto">

                                        </div>
                                        {/* <AddCategory />
                                     <EditCategory/> */}
                                     <DeleteItems path={"/sales"} deletefunc={deleteSale} />

                                    </CardHeader>
                                    <CardContent>

                                        <DataTable data={sales} columns={columns} props={
                                            {
                                                edit: permissions?.includes("edit:access") || false,
                                                delete: permissions?.includes("delete:access") || false,
                                                page: "sales"
                                            }
                                        } />
                                    </CardContent>
                                </Card>
                            </div>

                        </div>

                    </main>
                </div>
            ) : (


                <div
                    className="flex flex-1 p-6 items-center mt-6 bg-background justify-center rounded-lg h-[] border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
                >
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">
                            You have no sales
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            You can start selling as soon as you add a product.
                        </p>
                        <Link  href="/inventory" className="mt-4 bg-primary500 p-2 rounded-md hover:bg-primary800 transition-all duration-300 text-white">make a sale</Link>
                    </div>
                </div>

            )}

        </div>

    )
}

export default PageView



