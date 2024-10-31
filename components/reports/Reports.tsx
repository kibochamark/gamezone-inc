'use client'

import { useState, useRef, useEffect, Key } from 'react'
import { FileDown, FileSpreadsheet, Calendar, Loader } from 'lucide-react'
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
import { useMutation } from '@tanstack/react-query'
import { getReportData } from './ReportActions'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'


type ReportType = 'inventory' | 'sales' | 'expenses' |'creditsales';

export type Reports = 'inventory' | 'lowstock' | 'creditsales'

const reportTitles = {
    'inventory': 'Inventory Report',
    'sales': 'Sales Report',
    'expenses': 'Expense Report',
    'lowstock': 'Low stock Report',
    'creditsales':'Credit sales report'
}

export default function ShopReports() {
    const [download, setDownload] = useState(false)
    const [reportType, setReportType] = useState<Reports>('inventory')
    const [dateRange, setDateRange] = useState({ from: new Date(Date.now()), to: new Date() })
    const [reportData, setReportData] = useState<any>()
    const tableRef = useRef(null)

    // get date range
    const date= useSelector((state:RootState)=> state.report.dateRange)

    useEffect(() => {
        reportmutation.mutateAsync({ report: reportType, from:date?.from, to:date?.to }).then((value) => {

            if(reportType === "lowstock"){
                let formatteddata = value.map((inv:any, index:number)=>{
                    return {
                        id:index+1,
                        ...inv,
                        category:inv?.category?.name || "",
                        created_at:new Date(inv?.created_at).toLocaleDateString(),
                        report_date:new Date().toLocaleDateString()
                    }
                })
                setReportData(formatteddata)
            }else if( reportType === "creditsales"){
                let formatteddata = value.map((inv:any, index:number)=>{
                    return {
                        id:index+1,
                        "Customer Name": inv?.accountName,
                        "Balance": (inv?._sum.creditTotal as number) - (inv?._sum.debitTotal as number)
                    }
                })
                setReportData(formatteddata)
            }
            

            // console.log(formatteddata)
            
            // console.log(reportData)

        })
    }, [reportType, date])


    //   get report mutation
    const reportmutation = useMutation({
        mutationFn: async (values: { report: Reports, from?: Date; to?: Date }) => {
            const res = await getReportData(values.report as Reports, values.from as Date, values.to as Date)
            return res
        }
    })

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
        if (reportData?.length > 0) {
            return Object.keys(reportData[0])?.map((key) => (
                <TableHead key={key} className="font-bold text-primary800 text-md">{key.charAt(0).toUpperCase() + key.slice(1)}</TableHead>
            ))
        } else {
            return null
        }
    }

    const renderTableRows = () => {
        return reportData?.map((row: any, index: number) => (
            <TableRow key={index}>
                {Object.values(row)?.map((value: any, cellIndex) => (
                    <TableCell key={cellIndex}>{value}</TableCell>
                ))}
            </TableRow>
        ))
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="border-2 border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between border-b-2 border-gray-200 pb-4">
                    <div className="flex items-center space-x-2">
                        <img src="/logo.jpg" alt="Shop Logo" className="h-8 w-8" />
                        <CardTitle>Dantech Solutions</CardTitle>
                    </div>
                    <div className="flex space-x-2">
                        <Button onClick={handleDownloadPDF} size="sm" className="bg-white border hover:bg-primary800 hover:text-white animate-bounce animate transition-all duration-300 cursor-pointer border-primary700 text-primary900">
                            <FileDown className="mr-2 h-4 w-4" /> PDF
                        </Button>
                        <Button onClick={handleDownloadExcel} size="sm" className="bg-primary700 hover:bg-background animate animate-out hover:text-primary600 transition-all duration-300 text-white">
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 pb-8">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <Select value={reportType} onValueChange={(value) => setReportType(value as Reports)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select report type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="inventory">Inventory Report</SelectItem>
                                <SelectItem value="sales">Sales Report</SelectItem>
                                <SelectItem value="expenses">Expense Report</SelectItem>
                                <SelectItem value="lowstock">Low stock products</SelectItem>
                                <SelectItem value="creditsales">Sales on credit with vendor associated</SelectItem>
                            </SelectContent>
                        </Select>
                        <DatePickerWithRange
                        />
                    </div>
                    {reportData?.length > 0 ? (
                        <div ref={tableRef} className="felx- flex-col gap-4">
                            <h2 className="text-2xl text-center font-bold mb-4">{reportTitles[reportType as ReportType]}</h2>
                            <div className="border-2 border-primary500 rounded-lg mt-6 overflow-hidden">
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
                        </div>
                    ) : (
                        <div className="flex justify-center items-center my-4 space-x-3">
                            {reportmutation.isPending ? (
                                <Loader className='text-primary600 animate text-2xl animate-spin' />
                            ) : (
                                "Data is not available yet"
                            )}

                        </div>
                    )}

                </CardContent>
                <div className="border-t-2 border-gray-200 p-4 flex justify-center items-center">
                    <div className="flex items-center space-x-2">
                        <img src="/logo.jpg" alt="Shop Logo" className="h-6 w-6" />
                        <span>© {new Date().getFullYear()} Gamezone. All rights reserved.</span>
                    </div>
                </div>
            </Card>
        </div>
    )
}

