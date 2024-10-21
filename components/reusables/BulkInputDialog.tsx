"use client"
import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Revalidate } from '@/lib/Revalidate';
import { useDispatch, useSelector } from 'react-redux';
import { handleBulk, handleDelete, handleExcelData, handleLoading } from '@/redux/DatatbaleSlice';
import { RootState } from '@/redux/store';
import toast from 'react-hot-toast';
import { useState, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader, Save, UploadIcon } from 'lucide-react'
import * as XLSX from 'xlsx'
import { createBulkInventory, Inventory } from '../Inventory/InventoryActions';
import { revalidatePath } from 'next/cache';


const BulkUpload = () => {
    const dispatch = useDispatch()
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {

        fileInputRef.current && fileInputRef.current.click()
    };

    const data = useSelector((state: RootState) => state.datatable.exceldata)
    const isbulk = useSelector((state: RootState) => state.datatable.isbulk)
    const isbulkloading = useSelector((state: RootState) => state.datatable.isbulkloading)
    const page = useSelector((state: RootState) => state.datatable.page)

    const [fileName, setFileName] = useState<string>('')

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFileName(file.name)
            const reader = new FileReader()
            reader.onload = (evt) => {
                const bstr = evt.target?.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = XLSX.utils.sheet_to_json(ws)
                dispatch(handleExcelData(data as any[][]))
            }
            reader.readAsBinaryString(file)
        }
    }, [])


    const save = async () => {
        dispatch(handleLoading())
        try {
            if (data.length > 0) {
                console.log(data)
                await createBulkInventory(data as Inventory[])
                toast.success("data uploaded successfully")
            }

        } catch (error: any) {
            toast.error(error?.message)
        }
        dispatch(handleLoading())


    }


    return (
        <Dialog open={isbulk} onOpenChange={() => {
            dispatch(handleBulk({
                page: "",
                isbulk: false,

            }))
            dispatch(handleExcelData([]))
        }}>
            <DialogContent className="overflow-x-scroll">
                <DialogHeader>
                    <DialogTitle></DialogTitle>

                    <DialogDescription>
                        <div className="flex flex-col space-y-4 w-full mx-auto">
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileUpload}
                                    className="sr-only"
                                    id="excel-upload"
                                    ref={fileInputRef}
                                />
                                <label htmlFor="excel-upload" className="cursor-pointer">
                                    <Button variant="outline" className="w-full" onClick={handleButtonClick}>
                                        <UploadIcon className="mr-2 h-4 w-4" />
                                        Upload Excel File
                                    </Button>
                                </label>
                                {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
                            </div>

                            {data.length > 0 && (
                                <ScrollArea className="h-[300px] w-full rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {Object.keys(data[0]).map((header: any, index: number) => (
                                                    <TableHead key={index}>{header}</TableHead>
                                                ))}
                                            </TableRow>


                                        </TableHeader>
                                        <TableBody>
                                            {data.slice(1, 6).map((row: any, rowIndex: number) => (
                                                <TableRow key={rowIndex}>
                                                    {Object.values(row).map((cell: any, cellIndex: number) => (
                                                        <TableCell key={cellIndex}>{cell}</TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            )}

                            {data.length > 5 && (
                                <p className="text-sm text-muted-foreground text-center">
                                    Showing preview of first 5 rows. Total rows: {data.length - 1}
                                </p>
                            )}

                            {data.length > 0 && (
                                <Button disabled={isbulkloading} size="sm" className="h-8 gap-1" onClick={save}>
                                    {isbulkloading ? (
                                        <Loader className='animate animate-spin text-primary600 w-3.5 h-3.5' />) : (
                                        <>
                                            <Save className="h-3.5 w-3.5" />
                                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                                Save Data
                                            </span>
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>

    )
}

export default BulkUpload
