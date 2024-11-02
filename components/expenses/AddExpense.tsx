"use client"
import React, { Suspense } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { ArrowUpRight, Loader } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFormik } from "formik"
import * as Yup from "yup"

import { redirect, useRouter } from 'next/navigation'

import { Revalidate } from '@/lib/Revalidate'
import toast from 'react-hot-toast'
import { createExpense } from './ExpenseActions'


const payments =[
    {
        id:"CASH",
        name:"cash"
    },
    {
        id:"Mpesa",
        name:"mpesa"
    }
]


const AddExpense = ({categories}:{categories:any}) => {
    const router = useRouter()


    // setup our form initial values as well as validation schema
    const formik = useFormik({
        initialValues: {
            name: "",
            amount: 0,
            description: "",
            categoryId: "",
            paymentType:"" as "CASH" | "Mpesa"
        },
        validationSchema: Yup.object().shape({
            name: Yup.string().required(),
            paymentType: Yup.string().required(),
            description: Yup.string().required(),
            amount: Yup.number().required(),
            categoryId: Yup.string().required()

        }),
        onSubmit: async (values, formikHelpers) => {

            try {
                const res = await createExpense({ ...values });

                if (res instanceof Error) {
                    throw res;
                }

                Revalidate("/expenses");
                toast.success("expense created successfully!");
            } catch (error) {
                toast.error("Failed to create expense. Please try again.");
            }

        },

    })
    return (



        <form className="grid gap-6 my-4" method='POST' onSubmit={formik.handleSubmit}>
            <div className="grid gap-2">
                <Label htmlFor="name mb-2">Name</Label>
                {formik.touched.name && formik.errors.name && (
                    <p className='text-sm text-red-600 tracking-tight leading-tight'>{formik.errors.name}</p>
                )}
                <Input
                    id="name"
                    name='name'
                    type="name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    defaultValue={formik.values.name}
                    disabled={formik.isSubmitting}

                    placeholder=""
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="buyingamount mb-2">Expense Amount</Label>
                {formik.touched.amount && formik.errors.amount && (
                    <p className='text-sm text-red-600 tracking-tight leading-tight'>{formik.errors.amount}</p>
                )}
                <Input
                    id="amount"
                    name='amount'
                    type="number"
                    onChange={formik.handleChange}
                    defaultValue={formik.values.amount}
                    onBlur={formik.handleBlur}
                    disabled={formik.isSubmitting}

                    placeholder=""
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="categoryId mb-2">ExpenseCategory</Label>
                {formik.touched.categoryId && formik.errors.categoryId && (
                    <p className='text-sm text-red-600 tracking-tight leading-tight'>{formik.errors.categoryId}</p>
                )}
                <select id="categoryId" name='categoryId' defaultValue={formik.values.categoryId} onChange={formik.handleChange} onBlur={formik.handleBlur} disabled={formik.isSubmitting} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option value="">select expense category</option>
                    {
                        categories?.map((cat: any, idx: number) => (
                            <option key={idx} value={cat.id}>{cat.name}</option>
                        ))}

                </select>



            </div>

            <div className="grid gap-2">
                <Label htmlFor="buyingamount mb-2">Expense Description</Label>
                {formik.touched.description && formik.errors.description && (
                    <p className='text-sm text-red-600 tracking-tight leading-tight'>{formik.errors.description}</p>
                )}
                <textarea
                    rows={6}
                    id="description"
                    name='description'
                    className='rounded-md border border-gray-500 p-4'
                    onChange={formik.handleChange}
                    defaultValue={formik.values.description}
                    onBlur={formik.handleBlur}
                    disabled={formik.isSubmitting}

                    placeholder=""
                    required
                />
            </div>


            <div className="grid gap-2">
                <Label htmlFor="categoryId mb-2">Payment Type</Label>
                {formik.touched.paymentType && formik.errors.paymentType && (
                    <p className='text-sm text-red-600 tracking-tight leading-tight'>{formik.errors.paymentType}</p>
                )}
                <select id="categoryId" name='paymentType' defaultValue={formik.values.paymentType} onChange={formik.handleChange} onBlur={formik.handleBlur} disabled={formik.isSubmitting} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option value="">select category</option>
                    {
                        payments?.map((cat: any, idx: number) => (
                            <option key={idx} value={cat.id}>{cat.name}</option>
                        ))}

                </select>



            </div>




            <Button type="submit" className="w-full flex  items-center justify-center" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? <Loader className='animate animate-spin text-primary500' /> : "create expense"}

            </Button>

        </form>


    )
}

export default AddExpense