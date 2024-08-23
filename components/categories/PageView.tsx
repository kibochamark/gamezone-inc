import Link from "next/link"
import {
    Activity,
    ArrowUpRight,
    CircleUser,
    CreditCard,
    DollarSign,
    Menu,
    Package2,
    PieChart,
    Search,
    ShoppingBasketIcon,
    ShoppingCart,
    Users,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DataTable } from "../reusables/DataGrid"

import AddCategory from "./AddCategory"
import { columns } from "./columns"
import EditCategory from "./EdirCategory"
import DeleteItems from "../reusables/DeleteItems"
import { deleteCategory } from "./CategoryActions"

export default function PageView({category, permissions}:{category:any; permissions:any}) {
    const totalcategory = category?.length ?? 0
    const expensecategories = category.filter((category:{type:string})=> category.type === "expense".toUpperCase()).length ?? 0
    const inventorycategories = category.filter((category:{type:string})=> category.type !== "expense".toUpperCase()).length ?? 0

    return (
        <div className="flex min-h-screen w-full flex-col p-4 gap-2">
            <h2 className="text-titleLarge font-bold mb-4">Categories</h2>
            <main className="flex flex-1 flex-col gap-4 w-full md:gap-8">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Card x-chunk="dashboard-01-chunk-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Expense Categories
                            </CardTitle>
                            <PieChart className="h-4 w-4 text-primary500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary600">{expensecategories}</div>
                            <p className="text-xs text-muted-foreground">
                               as of today
                            </p>
                        </CardContent>
                    </Card>
                    <Card x-chunk="dashboard-01-chunk-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Inventory Categories
                            </CardTitle>
                            <PieChart className="h-4 w-4 text-primary500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary600">{inventorycategories}</div>
                            <p className="text-xs text-muted-foreground">
                                as of today
                            </p>
                        </CardContent>
                    </Card>
                    <Card x-chunk="dashboard-01-chunk-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                            <PieChart className="h-4 w-4 text-primary500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary600">{totalcategory}</div>
                            <p className="text-xs text-muted-foreground">
                                as of today
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
                                    <CardTitle>All Categories</CardTitle>
                                    <CardDescription>
                                        manage your categories
                                    </CardDescription>
                                </div>
                                <div className="ml-auto">

                                </div>
                                <AddCategory />
                                <EditCategory/>
                                <DeleteItems path={"/managecategories"} deletefunc={deleteCategory} />
                                
                            </CardHeader>
                            <CardContent>

                                <DataTable data={category} columns={columns} props={
                                    {
                                        edit:permissions?.includes("edit:access") || false,
                                        delete:permissions?.includes("delete:access") || true,
                                        page:"category"
                                    }
                                } />
                            </CardContent>
                        </Card>
                    </div>

                </div>


            </main>
        </div>
    )
}
