"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../reusables/ColumnHeader"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Service = {
    id: string
    kindeId: string
    kindeName: string
    name: String
    price: number
    paymenttype: "CASH" | "Mpesa"
    created_at: Date
}

import { FilterFn } from "@tanstack/react-table";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"

type PaymentType = "CASH" | "MPESA";

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
        enableSorting: true
    },
    {
        accessorKey: "kindeName",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Offered By" />
            )
        },
        cell: ({ row }) => {
            return (
                <div className="text-justify font-medium">{row.original.kindeName}</div>
            )
        },
        enableSorting: true
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
        enableSorting: true


    },

    {
        accessorKey: "paymenttype",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Payment Type" />
            )
        },
        cell: ({ row }) => {
         

            const styles: Record<PaymentType | "DEFAULT", string> = {
                CASH: "bg-green-100 text-green-700 border-green-300",
                MPESA: "bg-blue-100 text-blue-700 border-blue-300",
                DEFAULT: "bg-gray-100 text-gray-700 border-gray-300"
            };

            const type = row.original.paymenttype?.toUpperCase() as PaymentType;

            const badgeStyle = styles[type] || styles.DEFAULT;

            return (
                <span
                    className={`px-2 py-1 rounded-md text-xs font-semibold border ${badgeStyle}`}
                >
                    {type}
                </span>
            );
        },
        enableSorting: true
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
        enableSorting: true
    },
];



