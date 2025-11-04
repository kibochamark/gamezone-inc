"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTable } from "../reusables/DataGrid"
import { invoicecolumns } from "./columns"
import { Filter } from "lucide-react"

// Mock invoice data
const MOCK_INVOICES = [
  { id: "INV001", clientName: "Acme Corp", total: 2500, status: "paid", date: "2024-10-15" },
  { id: "INV002", clientName: "Tech Solutions", total: 1800, status: "pending", date: "2024-10-20" },
  { id: "INV003", clientName: "Global Ventures", total: 3200, status: "paid", date: "2024-10-22" },
  { id: "INV004", clientName: "StartUp Inc", total: 950, status: "overdue", date: "2024-09-15" },
]

export default function InvoicesPage({permissions}: {permissions:string[] | undefined}) {
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

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-4">
        <header className="border-b border-border bg-card  rounded-md my-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <Link href="/invoice/create">
            <Button>Create Invoice</Button>
          </Link>
        </div>
      </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalInvoices}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${analytics.paidAmount.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">${analytics.pendingAmount.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${analytics.overdueAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice List</CardTitle>
            <CardDescription>Manage and view all your invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="">
              <DataTable columns={invoicecolumns} data={[]} filtername="invoices" props={
                  {
                    edit: permissions?.includes("edit:access") || false,
                    delete: permissions?.includes("delete:access") || false,
                    page: "invoices"
                  }
              }/>
            </div>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>
                  No invoices found.{" "}
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters."
                    : "Create your first invoice to get started."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
