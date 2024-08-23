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
import { columns, products } from './columns'


const PageView = () => {


    return (
        // <div>
        //     {products.length > 0 ? (
        //         <main className="flex flex-1 flex-col gap-4 w-full md:gap-8">
        //             <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        //                 <Card x-chunk="dashboard-01-chunk-0">
        //                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        //                         <CardTitle className="text-sm font-medium">
        //                             Total Categories
        //                         </CardTitle>
        //                         <PieChart className="h-4 w-4 text-primary500" />
        //                     </CardHeader>
        //                     <CardContent>
        //                         <div className="text-2xl font-bold text-primary600">$45,231.89</div>
        //                         <p className="text-xs text-muted-foreground">
        //                             today
        //                         </p>
        //                     </CardContent>
        //                 </Card>
        //                 <Card x-chunk="dashboard-01-chunk-0">
        //                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        //                         <CardTitle className="text-sm font-medium">
        //                             Total Products
        //                         </CardTitle>
        //                         <ShoppingCart className="h-4 w-4 text-primary500" />
        //                     </CardHeader>
        //                     <CardContent>
        //                         <div className="text-2xl font-bold text-primary600">$45,231.89</div>
        //                         <p className="text-xs text-muted-foreground">
        //                             today
        //                         </p>
        //                     </CardContent>
        //                 </Card>
        //                 <Card x-chunk="dashboard-01-chunk-0">
        //                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        //                         <CardTitle className="text-sm font-medium">
        //                             Total Revenue
        //                         </CardTitle>
        //                         <DollarSign className="h-4 w-4 text-primary500" />
        //                     </CardHeader>
        //                     <CardContent>
        //                         <div className="text-2xl font-bold text-primary600">$45,231.89</div>
        //                         <p className="text-xs text-muted-foreground">
        //                             today
        //                         </p>
        //                     </CardContent>
        //                 </Card>

        //                 <Card x-chunk="dashboard-01-chunk-1">
        //                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        //                         <CardTitle className="text-sm font-medium">
        //                             Low stocks
        //                         </CardTitle>
        //                         <ShoppingCart className="h-4 w-4 text-primary500" />
        //                     </CardHeader>
        //                     <CardContent>
        //                         <div className="text-2xl font-bold text-primary600">2350</div>
        //                         <p className="text-xs text-muted-foreground">
        //                             last 7 days
        //                         </p>
        //                     </CardContent>
        //                 </Card>



        //             </div>
        //             <div className="grid items-start gap-4  md:gap-8">
        //                 <Tabs defaultValue="all">
        //                     <div className="flex items-center">
        //                         <TabsList>
        //                             <TabsTrigger value="all">All</TabsTrigger>
        //                             <TabsTrigger value="lowstock">low stock</TabsTrigger>

        //                         </TabsList>
        //                         <div className="ml-auto flex items-center gap-2">

        //                             <Button size="sm" className="h-8 gap-1">
        //                                 <PlusCircle className="h-3.5 w-3.5" />
        //                                 <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
        //                                     Add Product
        //                                 </span>
        //                             </Button>
        //                         </div>
        //                     </div>
        //                     <TabsContent value="all" className=''>

        //                         <Card className=''>
        //                             <CardHeader>
        //                                 <CardTitle>Products</CardTitle>
        //                                 <CardDescription className='flex items-center justify-between'>
        //                                     <div>
        //                                         Manage your products and view their sales performance.
        //                                     </div>
        //                                     <Button size="sm" variant="outline" className="h-8 gap-1">
        //                                         <File className="h-3.5 w-3.5" />
        //                                         <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
        //                                             Export
        //                                         </span>
        //                                     </Button>
        //                                 </CardDescription>
        //                             </CardHeader>
        //                             <CardContent>

        //                             </CardContent>
        //                             <CardFooter className='text-muted-foreground text-sm'>
        //                                 @dantech
        //                             </CardFooter>
        //                         </Card>
        //                     </TabsContent>
        //                     <TabsContent value="lowstock">
        //                         <Card>
        //                             <CardHeader>
        //                                 <CardTitle>Low stock Products</CardTitle>
        //                                 <CardDescription className='flex items-center justify-between'>
        //                                     <p>
        //                                         Manage low stock products
        //                                     </p>
        //                                     <Button size="sm" variant="outline" className="h-8 gap-1">
        //                                         <File className="h-3.5 w-3.5" />
        //                                         <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
        //                                             Export
        //                                         </span>
        //                                     </Button>
        //                                 </CardDescription>
        //                             </CardHeader>
        //                             <CardContent>
        //                                 {/* <DataTable data={products.filter((product)=>{
        //                                     return product.quantity <= product.threshold
        //                                 })} columns={columns} /> */}

        //                             </CardContent>
        //                             <CardFooter className='text-muted-foreground text-sm'>
        //                                 @dantech
        //                             </CardFooter>
        //                         </Card>
        //                     </TabsContent>
        //                 </Tabs>
        //             </div>
        //         </main>
        //     ) : (


        //         <div
        //             className="flex flex-1 p-6 items-center mt-6 justify-center rounded-lg h-[] border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
        //         >
        //             <div className="flex flex-col items-center gap-1 text-center">
        //                 <h3 className="text-2xl font-bold tracking-tight">
        //                     You have no products
        //                 </h3>
        //                 <p className="text-sm text-muted-foreground">
        //                     You can start selling as soon as you add a product.
        //                 </p>
        //                 <Button className="mt-4 bg-primary500 hover:bg-primary800 transition-all duration-300 text-white">Add Product</Button>
        //             </div>
        //         </div>

        //     )}

        // </div>
        <div className="flex min-h-screen w-full flex-col p-4 gap-2">
            <h2 className="text-titleLarge font-bold mb-4">Services</h2>
            <main className="flex flex-1 flex-col gap-4 w-full md:gap-8">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Card x-chunk="dashboard-01-chunk-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Categories
                            </CardTitle>
                            <PieChart className="h-4 w-4 text-primary500" />
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
                                Total Products
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-primary500" />
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

                    <Card x-chunk="dashboard-01-chunk-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Low stocks
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-primary500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary600">2350</div>
                            <p className="text-xs text-muted-foreground">
                                last 7 days
                            </p>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
                    <div className='overflow-x-scroll md:overflow-hidden col-span-2'>
                        <Card
                            className="col-span-2" x-chunk="dashboard-01-chunk-4"
                        >
                            <CardHeader className="flex flex-row items-center">
                                <div className="grid gap-2">
                                    <CardTitle>Top Selling Stock</CardTitle>
                                    <CardDescription>
                                        mode of sold stocks in the store.
                                    </CardDescription>
                                </div>

                            </CardHeader>
                            <CardContent>

                                <Tabs defaultValue="all">
                                    <div className="flex items-center">
                                        <TabsList>
                                            <TabsTrigger value="all">All</TabsTrigger>
                                            <TabsTrigger value="lowstock">low stock</TabsTrigger>

                                        </TabsList>
                                        <div className="ml-auto flex items-center gap-2">

                                            <Button size="sm" className="h-8 gap-1">
                                                <PlusCircle className="h-3.5 w-3.5" />
                                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                                    Add Product
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                    <TabsContent value={'all'} >

                                        <DataTable data={products} columns={columns} />
                                    </TabsContent>
                                    <TabsContent value={'lowstock'} >

                                        <DataTable data={products.filter((product) => {
                                            return product.quantity < product.threshold
                                        })} columns={columns} />



                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default PageView



