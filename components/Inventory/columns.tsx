"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../reusables/ColumnHeader"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Product = {
    id: string
    name: string
    price: number
    buyingprice: number
    quantity: number
    threshold: number
    created_at: Date
}


export type LowStock ={
    inventory:Product
}

import { FilterFn } from "@tanstack/react-table";
import { Button } from "../ui/button"
import { useDispatch } from "react-redux"
import { handleSale } from "@/redux/DatatbaleSlice"

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
        enableSorting:true
    },
    {
        accessorKey: "quantity",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Quantity" />
            )
        },
        enableSorting:true
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
        enableSorting:true
    },
    {
        accessorKey: "buyingprice",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader className="text-justify" column={column} title="Buying Price" />
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("buyingprice"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "KES",
            }).format(amount)

            return <div className="text-justify font-medium">{formatted}</div>
        },
        enableSorting:true


    },
    {
        accessorKey: "price",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Selling Price" />
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
    {
        id:"Sale",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Sell" />
            )
        },
        cell: ({ row }) => {
    
            return <div className="text-justify font-medium">
                <HandleButtonSell row={row}/>
            </div>
        },
        enableSorting:true
        
         
    },    
];

export const lowstockcolumns: ColumnDef<LowStock>[] = [
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
        accessorKey: "inventory.quantity",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Quantity" />
            )
        },
        enableSorting:true
    },
    {
        accessorKey: "inventory.status",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Status" />
            )
        },
        cell: ({ row }) => {
            const quantity = row.original.inventory.quantity;
            const threshold = row.original.inventory.threshold;

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
        enableSorting:true
    },
    {
        accessorKey: "inventory.buyingprice",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader className="text-justify" column={column} title="Buying Price" />
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat((row.original.inventory.buyingprice).toString())
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "KES",
            }).format(amount)

            return <div className="text-justify font-medium">{formatted}</div>
        },
        enableSorting:true


    },
    {
        accessorKey: "inventory.price",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Selling Price" />
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.original.inventory.price.toString())
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "KES",
            }).format(amount)

            return <div className="text-justify font-medium">{formatted}</div>
        },

        enableSorting:true

    },
    {
        accessorKey: "inventory.created_at",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Created" />
            )
        },
        cell: ({ row }) => {
            const createdAt = new Date(row.original.inventory.created_at);
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
    {
        id:"Sale",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Sell" />
            )
        },
        cell: ({ row }) => {
    
            return <div className="text-justify font-medium">
                <HandleButtonSellLowStock row={row}/>
            </div>
        },
        enableSorting:true
         
    },    
];


const HandleButtonSell = ({row}:{row:{original:any}})=>{
    const dispatch =useDispatch()
    return(
        <Button onClick={()=>{
            dispatch(handleSale({
                data:row.original,
                issale:true,
                page:"inventory"
            }))
        }}
        disabled={row.original.quantity == 0}
        size={"sm"} className="text-green-500 bg-white disabled:bg-gray-300 disabled:text-black hover:bg-green-500 transition-all duration-300 hover:text-white border border-green-500 text-titleSmall">sell</Button>
    )
}

const HandleButtonSellLowStock = ({row}:{row:{original:any}})=>{
    const dispatch =useDispatch()
    return(
        <Button onClick={()=>{
            dispatch(handleSale({
                data:row.original.inventory,
                issale:true,
                page:"inventory"
            }))
        }}
        disabled={row.original.quantity == 0}
        size={"sm"} className="text-green-500 bg-white disabled:bg-gray-300 disabled:text-black hover:bg-green-500 transition-all duration-300 hover:text-white border border-green-500 text-titleSmall">sell</Button>
    )
}

