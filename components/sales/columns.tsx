"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../reusables/ColumnHeader"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Product = {
    id: string
    name: string
    unit_price: number
    buying_price: number
    quantity: number
    threshold: number
    created_at: Date
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
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Product name" />
            )
        },
    },
    {
        accessorKey: "quantity",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Quantity" />
            )
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Status" />
            )
        },
        cell: ({ row }) => {
            const quantity = row.getValue("quantity") as number;
            const threshold = row.original.threshold;

            const status = quantity < threshold ? "Low on Stock" : "In Stock";

            return (
                <div
                    className={`text-justify font-medium ${
                        status === "Low on Stock" ? "text-red-500" : "text-green-500"
                    }`}
                >
                    {status}
                </div>
            );
        },
    },
    {
        accessorKey: "buying_price",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader className="text-justify" column={column} title="Buying Price" />
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("buying_price"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "KES",
            }).format(amount)

            return <div className="text-justify font-medium">{formatted}</div>
        },


    },
    {
        accessorKey: "unit_price",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Selling Price" />
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("unit_price"))
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



export const products: Product[] = [
    {
        id: "1",
        name: "Smartphone",
        unit_price: 45000,
        buying_price: 40000,
        quantity: 30,
        threshold: 10,
        created_at: new Date("2024-01-15T09:00:00Z"),
    },
    {
        id: "2",
        name: "Laptop",
        unit_price: 150000,
        buying_price: 140000,
        quantity: 15,
        threshold: 5,
        created_at: new Date("2024-02-10T11:30:00Z"),
    },
    {
        id: "3",
        name: "Headphones",
        unit_price: 5000,
        buying_price: 4000,
        quantity: 10,
        threshold: 20,
        created_at: new Date("2024-03-05T14:45:00Z"),
    },
    {
        id: "4",
        name: "Smartwatch",
        unit_price: 20000,
        buying_price: 18000,
        quantity: 50,
        threshold: 15,
        created_at: new Date("2024-04-20T08:15:00Z"),
    },
    {
        id: "5",
        name: "Bluetooth Speaker",
        unit_price: 7500,
        buying_price: 6500,
        quantity: 80,
        threshold: 25,
        created_at: new Date("2024-05-30T10:00:00Z"),
    },
];

