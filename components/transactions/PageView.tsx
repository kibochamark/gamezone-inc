'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CalendarIcon, FileDown, Printer } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import * as XLSX from 'xlsx'
import { jsPDF } from "jspdf"
import "jspdf-autotable"

const accounts = [
  { id: 'revenue', name: 'Revenue Account' },
  { id: 'sales', name: 'Sales Account' },
  { id: 'expenses', name: 'Expenses Account' },
  { id: 'main', name: 'Main Account' },
  { id: 'service', name: 'Service Account' },
  { id: 'inventory', name: 'Inventory Account' },
  { id: 'customer', name: 'Customer Account' },
]

export default function TransactionsReport() {
  const [account, setAccount] = useState('')
  const [date, setDate] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  })
  const [previewData, setPreviewData] = useState<any[]>([])

  const generateMockData = (account: string, startDate: Date, endDate: Date) => {
    const data = []
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const debit = Math.random() * 1000
      const credit = Math.random() * 1000
      data.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        debit: debit.toFixed(2),
        credit: credit.toFixed(2),
        balance: (debit - credit).toFixed(2)
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return data
  }

  const generateReport = () => {
    if (!account || !date?.from || !date?.to) {
      alert('Please select an account and date range')
      return
    }

    const data = generateMockData(account, date.from, date.to)
    setPreviewData(data)
  }

  const downloadCSV = () => {
    const csvContent = [
      ['Date', 'Debit', 'Credit', 'Balance'],
      ...previewData.map(row => [row.date, row.debit, row.credit, row.balance])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${account}_report_${format(date.from as Date, 'yyyyMMdd')}_${format(date.to as Date, 'yyyyMMdd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(previewData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Report")
    XLSX.writeFile(wb, `${account}_report_${format(date.from, 'yyyyMMdd')}_${format(date.to, 'yyyyMMdd')}.xlsx`)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.text(`${account} Account Report`, 14, 15)
    doc.text(`From: ${format(date.from, 'yyyy-MM-dd')} To: ${format(date.to, 'yyyy-MM-dd')}`, 14, 25)
    
    doc.autoTable({
      head: [['Date', 'Debit', 'Credit', 'Balance']],
      body: previewData.map(row => [row.date, row.debit, row.credit, row.balance]),
      startY: 30,
    })

    doc.save(`${account}_report_${format(date.from, 'yyyyMMdd')}_${format(date.to, 'yyyyMMdd')}.pdf`)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Account Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account">Select Account</Label>
            <Select onValueChange={setAccount}>
              <SelectTrigger id="account">
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Select Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button type="button" onClick={generateReport}>Generate Report</Button>
        </form>

        {previewData.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold">Preview</h2>
            <div className="border rounded-md max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Debit</TableHead>
                    <TableHead>Credit</TableHead>
                    <TableHead>Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.debit}</TableCell>
                      <TableCell>{row.credit}</TableCell>
                      <TableCell>{row.balance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex space-x-2">
              <Button onClick={downloadCSV}>
                <FileDown className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
              <Button onClick={downloadExcel}>
                <FileDown className="mr-2 h-4 w-4" />
                Download Excel
              </Button>
              <Button onClick={downloadPDF}>
                <Printer className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}