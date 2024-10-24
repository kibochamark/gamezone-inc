'use client'

import { useState, useRef, useEffect, Key } from 'react'
import { FileDown, FileSpreadsheet, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { DatePickerWithRange } from '../ui/date-picker-with-range'
import toast from 'react-hot-toast'


type ReportType = 'inventory' | 'sales' | 'expenses';


// Mock data for reports
const mockReportData = {
  'inventory': [
    { id: 1, name: 'Product A', quantity: 100, price: 19.99 },
    { id: 2, name: 'Product B', quantity: 50, price: 29.99 },
    { id: 3, name: 'Product C', quantity: 75, price: 14.99 },
  ],
  'sales': [
    { id: 1, date: '2023-06-01', product: 'Product A', quantity: 5, total: 99.95 },
    { id: 2, date: '2023-06-02', product: 'Product B', quantity: 2, total: 59.98 },
    { id: 3, date: '2023-06-03', product: 'Product C', quantity: 10, total: 149.90 },
  ],
  'expenses': [
    { id: 1, date: '2023-06-01', description: 'Rent', amount: 1000 },
    { id: 2, date: '2023-06-02', description: 'Utilities', amount: 200 },
    { id: 3, date: '2023-06-03', description: 'Supplies', amount: 150 },
  ],
}

const reportTitles = {
  'inventory': 'Inventory Report',
  'sales': 'Sales Report',
  'expenses': 'Expense Report',
}

export default function ShopReports() {
  const [download, setDownload] = useState(false)
  const [reportType, setReportType] = useState('inventory')
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() })
  const [reportData, setReportData] = useState<any[]>(mockReportData[reportType as ReportType])
  const tableRef = useRef(null)

  useEffect(() => {
    // In a real application, this would fetch data based on the selected report type and date range
    setReportData(mockReportData[reportType as ReportType])
  }, [reportType, dateRange])

  const handleDownloadPDF = () => {
    // setDownload(true)
    if (tableRef.current) {
      html2canvas(tableRef.current).then((canvas) => {
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF()
        const imgProps = pdf.getImageProperties(imgData)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`${reportType}-report.pdf`)
        
      })
      // setDownload(false)
    }

    toast.success(`Your ${reportType} report PDF is being generated and will download shortly.`)
  }

  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(reportData)
    XLSX.utils.book_append_sheet(wb, ws, reportType)
    XLSX.writeFile(wb, `${reportType}-report.xlsx`)

    toast.success(`Your ${reportType} report Excel file is being generated and will download shortly.`)
  }

  const renderTableHeaders = () => {
    if (reportData.length === 0) return null
    return Object.keys(reportData[0]).map((key) => (
      <TableHead key={key} className="font-bold text-primary800 text-md">{key.charAt(0).toUpperCase() + key.slice(1)}</TableHead>
    ))
  }

  const renderTableRows = () => {
    return reportData.map((row: any, index: number) => (
      <TableRow key={index}>
        {Object.values(row).map((value:any, cellIndex) => (
          <TableCell key={cellIndex}>{value}</TableCell>
        ))}
      </TableRow>
    ))
  }

  return (
    <div  className="container mx-auto p-4">
      <Card className="border-2 border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between border-b-2 border-gray-200 pb-4">
          <div className="flex items-center space-x-2">
            <img src="/placeholder.svg" alt="Shop Logo" className="h-8 w-8" />
            <CardTitle>MyShop</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleDownloadPDF} size="sm">
              <FileDown className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button onClick={handleDownloadExcel} size="sm">
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-8">
          <h2 className="text-2xl font-bold mb-4">{reportTitles[reportType as ReportType]}</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inventory">Inventory Report</SelectItem>
                <SelectItem value="sales">Sales Report</SelectItem>
                <SelectItem value="expenses">Expense Report</SelectItem>
              </SelectContent>
            </Select>
            <DatePickerWithRange
            //   dateRange={dateRange}
            //   setDateRange={setDateRange}
            />
          </div>
          <div ref={tableRef} className="border-2 border-primary500 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {renderTableHeaders()}
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderTableRows()}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <div className="border-t-2 border-gray-200 p-4 flex justify-center items-center">
          <div className="flex items-center space-x-2">
            <img src="/placeholder.svg" alt="Shop Logo" className="h-6 w-6" />
            <span>© 2023 MyShop. All rights reserved.</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

