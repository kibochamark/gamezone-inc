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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import AddInventory from './AddInventory'
import EditInventory from './EditInventory'
import DeleteItems from '../reusables/DeleteItems'
import { deleteInventory } from './InventoryActions'
import MakeSale from './MakeSale'
import { handleSale } from '@/redux/DatatbaleSlice'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'



const PageView = ({ inventory, permissions, category, lowStockSummary, revenue }: { inventory: any; permissions: any; category: any; lowStockSummary: any, revenue: any }) => {
    const dispatch=useDispatch()
    const issale = useSelector((state:RootState)=>state.datatable.issale)

    return (
        <>
            {inventory?.length > 0 ? (
                <div className="flex min-h-screen w-full flex-col p-4 gap-2">
                    <h2 className="text-titleLarge font-bold mb-4">Inventory</h2>
                    <main className="flex flex-1 flex-col gap-4 w-full md:gap-8">
                        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                            <Card x-chunk="dashboard-01-chunk-0">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        No Products
                                    </CardTitle>
                                    <ShoppingCart className="h-4 w-4 text-primary500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary600">{inventory?.length ?? 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        till today
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
                                    <div className="text-2xl font-bold text-primary600">{revenue[0]?.totalSales ?? 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        till today
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
                                    <div className="text-2xl font-bold text-primary600">{revenue[0]?.totalProfit ?? 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        till today
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
                                    <div className="text-2xl font-bold text-primary600">{lowStockSummary["_count"]?.id ?? 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        as of today
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
                                            <CardTitle>Available Stock</CardTitle>
                                            <CardDescription>
                                                manage products in store
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
                                                    <Dialog>
                                                        <DialogTrigger>

                                                            <Button size="sm" className="h-8 gap-1">
                                                                <PlusCircle className="h-3.5 w-3.5" />
                                                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                                                    Add Product
                                                                </span>
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>

                                                                <DialogDescription>
                                                                    <AddInventory categories={category} />
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                        </DialogContent>
                                                    </Dialog>

                                                    <EditInventory categories={category} />
                                                    <DeleteItems path={'/invenrtory'} deletefunc={deleteInventory} />

                                                    <Dialog open={issale} onOpenChange={()=>{
                                                        dispatch(handleSale({
                                                            page:"",
                                                            data:{},
                                                            issale:false

                                                        }))
                                                    }}>
                                                        
                                                        <DialogContent>
                                                            <DialogHeader>

                                                                <DialogDescription>
                                                                    <MakeSale />


                                                                </DialogDescription>
                                                            </DialogHeader>
                                                        </DialogContent>
                                                    </Dialog>
                                                    
                                                </div>
                                            </div>
                                            <TabsContent value={'all'} >

                                                <DataTable data={inventory} columns={columns} props={
                                                    {
                                                        edit: permissions?.includes("edit:access") || false,
                                                        delete: permissions?.includes("delete:access") || true,
                                                        page: "inventory"
                                                    }
                                                } />
                                            </TabsContent>
                                            <TabsContent value={'lowstock'} >

                                                <DataTable data={inventory.filter((product: any) => {
                                                    return product.quantity < product.threshold
                                                }) ?? []} columns={columns} props={
                                                    {
                                                        edit: permissions?.includes("edit:access") || false,
                                                        delete: permissions?.includes("delete:access") || true,
                                                        page: "inventory"
                                                    }
                                                } />



                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </main>
                </div>
            ) : (

                <div
                    className="flex flex-1 p-6 items-center mt-6 justify-center rounded-lg h-[] border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
                >
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">
                            You have no products
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            You can start selling as soon as you add a product.
                        </p>
                        <Dialog>
                            <DialogTrigger>
                                <Button className="mt-4 bg-primary500 hover:bg-primary800 transition-all duration-300 text-white">Add Product</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>

                                    <DialogDescription>
                                        <AddInventory categories={category} />
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>

                    </div>
                </div>
            )}
        </>
    )
}

export default PageView



