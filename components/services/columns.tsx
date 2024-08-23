"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../reusables/ColumnHeader"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Service = {
    id: string
    kindeId: string
    kindeName:string
    name: String
    price: number
    created_at:Date
}

import { FilterFn } from "@tanstack/react-table";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"

const dateFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
    const rowValue = row.getValue(columnId) as Date;

    // Assuming filterValue is an object with start and end dates for range filtering
    if (filterValue.start && filterValue.end) {
        const startDate = new Date(filterValue.start);
        const endDate = new Date(filterValue.end);

        return rowValue >= startDate && rowValue <= endDate;
    }

    // For exact date filtering
    const filterDate = new Date(filterValue);
    return rowValue.toDateString() === filterDate.toDateString();
};



export const columns: ColumnDef<Service>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Service name" />
            )
        },
    },
    {
        accessorKey: "kindeName",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Offered By" />
            )
        },
        cell:({row})=>{
            return (
                <div className="text-justify font-medium">{row.original.kindeName}</div>
            )
        },
    },
   
    {
        accessorKey: "price",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader className="text-justify" column={column} title="Amount" />
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "KES",
            }).format(amount)

            return <div className="text-justify font-medium">{formatted}</div>
        },


    },
    
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Created" />
            )
        },
        cell: ({ row }) => {
            const createdAt = new Date(row.getValue("created_at"));
            const formattedDate = createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            return <div className="text-justify font-medium">{formattedDate}</div>
        },
        sortingFn: "datetime",
        filterFn: dateFilterFn, // or another appropriate filter function
    },
];



