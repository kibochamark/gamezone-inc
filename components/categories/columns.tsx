"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../reusables/ColumnHeader"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Category = {
    id: string
    name: string
    type: string
}

import { FilterFn } from "@tanstack/react-table";




export const columns: ColumnDef<Category>[] = [
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
        accessorKey: "type",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Type" />
            )
        },
        enableSorting:true
    },

];


