"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTable } from "../reusables/DataGrid"
import { invoicecolumns } from "./columns"
import { DollarSign, Filter } from "lucide-react"
import { InvoiceSummary } from "@/app/invoice/page"
import { converttocunrrency } from "@/lib/utils"
import { Dialog } from "@radix-ui/react-dialog"
import DeleteItems from "../reusables/DeleteItems"
import { deleteInvoice } from "@/serverfunctions/invoice"

// Mock invoice data
const MOCK_INVOICES = [
  { id: "INV001", clientName: "Acme Corp", total: 2500, status: "paid", date: "2024-10-15" },
  { id: "INV002", clientName: "Tech Solutions", total: 1800, status: "pending", date: "2024-10-20" },
  { id: "INV003", clientName: "Global Ventures", total: 3200, status: "paid", date: "2024-10-22" },
  { id: "INV004", clientName: "StartUp Inc", total: 950, status: "overdue", date: "2024-09-15" },
]

export default function InvoicesPage({permissions, invoicesummary,invoices}: {permissions:string[] | undefined; invoicesummary:InvoiceSummary; invoices:any[]}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredInvoices = MOCK_INVOICES.filter((inv) => {
    const matchesSearch =
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const analytics = {
    totalInvoices: MOCK_INVOICES.length,
    totalRevenue: MOCK_INVOICES.reduce((sum, inv) => sum + inv.total, 0),
    paidAmount: MOCK_INVOICES.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.total, 0),
    pendingAmount: MOCK_INVOICES.filter((inv) => inv.status === "pending").reduce((sum, inv) => sum + inv.total, 0),
    overdueAmount: MOCK_INVOICES.filter((inv) => inv.status === "overdue").reduce((sum, inv) => sum + inv.total, 0),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // return (
  //   <div className="flex min-h-screen w-full flex-col p-4 gap-2">
  //     <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-4">
  //       <header className="border-b border-border bg-card  rounded-md my-4">
  //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
  //         <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
  //         <Link href="/invoice/create">
  //           <Button>Create Invoice</Button>
  //         </Link>
  //       </div>
  //     </header>
  //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
  //         <Card>
  //           <CardHeader className="pb-2">
  //             <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <div className="text-2xl font-bold">{invoicesummary.invoicecount}</div>
  //           </CardContent>
  //         </Card>

  //         <Card>
  //           <CardHeader className="pb-2">
  //             <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <div className="text-2xl font-bold">{converttocunrrency(invoicesummary.innvoicerevenue)}</div>
  //           </CardContent>
  //         </Card>

  //         <Card>
  //           <CardHeader className="pb-2">
  //             <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <div className="text-2xl font-bold text-green-600">{converttocunrrency(invoicesummary.invoicesummarytypes.find((inv)=> inv.status.toLowerCase() === "paid")?._sum.total)}</div>
  //           </CardContent>
  //         </Card>

  //         <Card>
  //           <CardHeader className="pb-2">
  //             <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <div className="text-2xl font-bold text-yellow-600">{converttocunrrency(invoicesummary.invoicesummarytypes.find((inv)=> inv.status.toLowerCase() === "pending")?._sum.total)}</div>
  //           </CardContent>
  //         </Card>

  //         <Card>
  //           <CardHeader className="pb-2">
  //             <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <div className="text-2xl font-bold text-red-600">{converttocunrrency(invoicesummary.invoicesummarytypes.find((inv)=> inv.status.toLowerCase() === "overdue")?._sum.total)}</div>
  //           </CardContent>
  //         </Card>
  //       </div>

  //       <Card>
  //         <CardHeader>
  //           <CardTitle>Invoice List</CardTitle>
  //           <CardDescription>Manage and view all your invoices</CardDescription>
  //         </CardHeader>
  //         <CardContent className="space-y-4">
  //           <div className="">
  //             <DataTable columns={invoicecolumns} data={invoices ?? []} filtername="invoices" props={
  //                 {
  //                   edit: permissions?.includes("edit:access") || false,
  //                   delete: permissions?.includes("delete:access") || false,
  //                   page: "invoices"
  //                 }
  //             }/>
  //           </div>

  //           {filteredInvoices.length === 0 && (
  //             <div className="text-center py-8 text-muted-foreground">
  //               <p>
  //                 No invoices found.{" "}
  //                 {searchTerm || statusFilter !== "all"
  //                   ? "Try adjusting your filters."
  //                   : "Create your first invoice to get started."}
  //               </p>
  //             </div>
  //           )}
  //         </CardContent>
  //       </Card>
  //     </main>
  //   </div>
  // )


  return (
        <div>
            {invoices.length > 0 ? (
                <div className="flex min-h-screen w-full flex-col p-4 gap-2">
                    <h2 className="text-titleLarge font-bold mb-4">Invoices</h2>
                    <main className="flex flex-1 flex-col gap-4 w-full md:gap-8">
                        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">

                            <Card x-chunk="dashboard-01-chunk-0">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        No of Invoices
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-primary500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary600">{invoicesummary.invoicecount}</div>
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
                                    <div className="text-2xl font-bold">{converttocunrrency(invoicesummary.innvoicerevenue)}</div>
                                    <p className="text-xs text-muted-foreground">
                                       till today
                                    </p>
                                </CardContent>
                            </Card>


                          <Card x-chunk="dashboard-01-chunk-0">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Paid
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-primary500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary600">{converttocunrrency(invoicesummary.invoicesummarytypes.find((inv)=> inv.status.toLowerCase() === "paid")?._sum.total)}</div>
                                    <p className="text-xs text-muted-foreground">
                                       till today
                                    </p>
                                </CardContent>
                            </Card>
                          
                          <Card x-chunk="dashboard-01-chunk-0">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Pending
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-primary500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary600">{converttocunrrency(invoicesummary.invoicesummarytypes.find((inv)=> inv.status.toLowerCase() === "pending")?._sum.total)}</div>
                                    <p className="text-xs text-muted-foreground">
                                       till today
                                    </p>
                                </CardContent>
                            </Card>

                        <Card x-chunk="dashboard-01-chunk-0">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Overdue
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-primary500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">{converttocunrrency(invoicesummary.invoicesummarytypes.find((inv)=> inv.status.toLowerCase() === "overdue")?._sum.total)}</div>
                                    <p className="text-xs text-muted-foreground">
                                       till today
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
                                            <CardTitle>All Invoices</CardTitle>
                                            <CardDescription>
                                                manage invoices
                                            </CardDescription>
                                        </div>
                                        <div className="ml-auto">
                                            <Link href="/invoice/create">
                                                    <Button className="mt-4 bg-primary500 hover:bg-primary800 transition-all duration-300 text-white">Create Invoice</Button>
                                             </Link>  
                                        </div>
                                        {/* <EditExpense categories={category} />
                                        <DeleteItems path={"/expenses"} deletefunc={deleteExpense} /> */}
                                        <DeleteItems path={"/invoices"} deletefunc={deleteInvoice} /> 

                                    </CardHeader>
                                    <CardContent>

                                        <DataTable data={invoices} columns={invoicecolumns} props={
                                            {
                                                edit: false,
                                                delete: permissions?.includes("delete:access") || false,
                                                page: "invoices",
                                                
                                            }
                                        } filtername="invoices"/>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </main>
                </div>
            ) : (


                <div
                    className="flex flex-1 bg-background p-6 items-center mt-6 justify-center rounded-lg h-[] border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
                >
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">
                            You have no Invoices
                        </h3>
                        <Link href="/invoice/create">
                         <Button className="mt-4 bg-primary500 hover:bg-primary800 transition-all duration-300 text-white">create invoice</Button>
                        </Link>    
                    </div>
                </div>

            )}

        </div>

    )
}
