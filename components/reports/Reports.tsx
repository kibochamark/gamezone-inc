'use client'

import { useState } from 'react'
import { Download, FileDown, AlertCircle, DollarSign, ShoppingCart, Package, Briefcase } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import toast from 'react-hot-toast'

// Mock data for charts
const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 4500 },
  { name: 'May', sales: 6000 },
  { name: 'Jun', sales: 5500 },
]

const expenseData = [
  { name: 'Jan', expenses: 3000 },
  { name: 'Feb', expenses: 2800 },
  { name: 'Mar', expenses: 3200 },
  { name: 'Apr', expenses: 3100 },
  { name: 'May', expenses: 3500 },
  { name: 'Jun', expenses: 3300 },
]

const serviceData = [
  { name: 'Jan', revenue: 2000 },
  { name: 'Feb', revenue: 2200 },
  { name: 'Mar', revenue: 2400 },
  { name: 'Apr', revenue: 2600 },
  { name: 'May', revenue: 2800 },
  { name: 'Jun', revenue: 3000 },
]

export default function ShopReports() {
  const [dateRange, setDateRange] = useState('last-30-days')

  const reports = [
    { 
      title: 'Inventory Report', 
      description: 'Full list of current inventory',
      icon: Package,
      filename: 'inventory-report',
      hasChart: false
    },
    { 
      title: 'Low Stock Products', 
      description: 'Products that need restocking',
      icon: AlertCircle,
      filename: 'low-stock-report',
      hasChart: false
    },
    { 
      title: 'Sales Transactions', 
      description: 'Detailed report of all sales',
      icon: ShoppingCart,
      filename: 'sales-transactions',
      hasChart: true,
      chartData: salesData,
      dataKey: 'sales'
    },
    { 
      title: 'Expense Transactions', 
      description: 'List of all expenses',
      icon: DollarSign,
      filename: 'expense-transactions',
      hasChart: true,
      chartData: expenseData,
      dataKey: 'expenses'
    },
    { 
      title: 'Service Transactions', 
      description: 'Report of all service-related revenue',
      icon: Briefcase,
      filename: 'service-transactions',
      hasChart: true,
      chartData: serviceData,
      dataKey: 'revenue'
    }
  ]

  const handleDownload = (reportType: string, filename: string) => {
    // In a real application, this would trigger an API call to generate and download the PDF report
    toast.success("Download Started")

    // Simulating PDF download
    setTimeout(() => {
      const link = document.createElement('a')
      link.href = `/api/reports/${filename}.pdf` // This would be your actual API endpoint
      link.download = `${filename}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }, 2000)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Shop Reports</h1>
      <div className="mb-6">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-7-days">Last 7 days</SelectItem>
            <SelectItem value="last-30-days">Last 30 days</SelectItem>
            <SelectItem value="last-90-days">Last 90 days</SelectItem>
            <SelectItem value="year-to-date">Year to date</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.filename}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <report.icon className="h-5 w-5" />
                {report.title}
              </CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {report.hasChart && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mb-4">View Chart</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{report.title} Chart</DialogTitle>
                      <DialogDescription>
                        Chart showing {report.description.toLowerCase()}
                      </DialogDescription>
                    </DialogHeader>
                    <ChartContainer
                      config={{
                        [report.dataKey as string]: {
                          label: report.title,
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={report.chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey={report.dataKey as string} fill="var(--color-chart-1)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleDownload(report.title, report.filename)} className="w-full">
                <FileDown className="mr-2 h-4 w-4" /> Download PDF ({dateRange.replace('-', ' ')})
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}