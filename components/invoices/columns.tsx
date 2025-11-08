"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../reusables/ColumnHeader"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Invoice = {
  id: string
  invoiceNo: string
  customerName: string
  customerContact: string
  createdBy: string
  dueDate: Date
  status: string
  subtotal: number
  tax: number
  total: number
  paidAt: Date | null
  notes: string | null
  created_at: Date
  updated_at: Date
}

import { FilterFn } from "@tanstack/react-table";
import clsx from "clsx"
import Link from "next/link"

// date filter
const dateFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const rowValue = new Date(row.getValue(columnId))

  if (filterValue.start && filterValue.end) {
    const startDate = new Date(filterValue.start)
    const endDate = new Date(filterValue.end)
    return rowValue >= startDate && rowValue <= endDate
  }

  const filterDate = new Date(filterValue)
  return rowValue.toDateString() === filterDate.toDateString()
}

export const invoicecolumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoiceNo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Invoice No" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer Name" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "customerContact",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer Contact" />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created By" />
    ),
     cell: ({ row }) => {
        const name = row.getValue("createdBy") as string
        const formatted = name.split("-")[0]; // get name before hyphen

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    enableSorting: true,
    cell: ({ row }) => {
        const status = row.getValue("status") as string
    const formatted =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()

    const id = row.original.id // assumes each row has an `id` field

    return (
      <Link
        href={`/invoice/edit/${id}`}
        className={clsx(
          "font-semibold hover:underline cursor-pointer",
          status.toLowerCase() === "pending"
            ? "text-primary600"
            : status.toLowerCase() === "paid"
            ? "text-green-600"
            : "text-red-600"
        )}
      >
        {formatted}
      </Link>
    )
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Amount" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "KES",
      }).format(amount)

      return <div className="font-medium">{formatted}</div>
    },
    enableSorting: true,
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
    cell: ({ row }) => {
      const dueDate = new Date(row.getValue("dueDate"))
      const formattedDate = dueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      return <div>{formattedDate}</div>
    },
    sortingFn: "datetime",
    filterFn: dateFilterFn,
    enableSorting: true,
  },
//   {
//     accessorKey: "created_at",
//     header: ({ column }) => (
//       <DataTableColumnHeader column={column} title="Created At" />
//     ),
//     cell: ({ row }) => {
//       const createdAt = new Date(row.getValue("created_at"))
//       const formattedDate = createdAt.toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       })
//       return <div>{formattedDate}</div>
//     },
//     sortingFn: "datetime",
//     filterFn: dateFilterFn,
//     enableSorting: true,
//   },
]