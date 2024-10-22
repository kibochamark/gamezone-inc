"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../reusables/ColumnHeader"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Product = {
    id: string
    inventory:{
        name:string
    };
    priceSold:number;
    quantitySold: number;
    created_at: Date,
    status:string,
    vendor:string,
    type:string

}

import { FilterFn } from "@tanstack/react-table";

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



export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "inventory.name",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Product name" />
            )
        },
        enableSorting:true
    },
    {
        accessorKey: "quantitySold",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Quantity" />
            )
        },
        enableSorting:true
    },
    
    {
        accessorKey: "priceSold",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader className="text-justify" column={column} title="Amount" />
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("priceSold"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "KES",
            }).format(amount)

            return <div className="text-justify font-medium">{formatted}</div>
        },

        enableSorting:true

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
        enableSorting:true
    },    
];





