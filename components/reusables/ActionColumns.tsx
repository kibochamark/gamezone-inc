import React from 'react'
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColumnDef } from '@tanstack/react-table'
import { Delete, Edit, MoreHorizontal } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { handleDelete, handleEdit } from '@/redux/DatatbaleSlice'


// action columns
export const actioncolumns: ColumnDef<any>[] = [

    {
        id: "actions",
        cell: ({ row }) => {
            const item = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(item.id)}
                        >
                            Copy item ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View customer</DropdownMenuItem>
                        <DropdownMenuItem>View payment details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },

]



export const DropDownComponent = ({ row, props }: { row: { original: any }; props: { edit: boolean; delete: boolean; page:string } }) => {
    const item = row.original
    const dispatch = useDispatch()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {props?.edit && (
                    <DropdownMenuItem
                        className="flex items-center justify-center cursor-pointer gap-2"
                        onClick={()=>{
                            dispatch(handleEdit({
                                edit:true,
                                page:props.page,
                                data:item
                            }))
                        }}
                    >
                        <Edit className="text-primary600 " /> edit
                    </DropdownMenuItem>
                )}

                {props?.delete && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center justify-center cursor-pointer gap-2"  onClick={()=>{
                            dispatch(handleDelete({
                                delete:true,
                                page:props.page,
                                data:item
                            }))
                        }}><Delete className="text-red-600" /> delete</DropdownMenuItem>

                    </>
                )}


            </DropdownMenuContent>
        </DropdownMenu>
    )
}