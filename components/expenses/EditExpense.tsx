"use client"
import React, { Suspense, useEffect } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

import { Revalidate } from '@/lib/Revalidate'
import toast from 'react-hot-toast'
import { handleEdit } from '@/redux/DatatbaleSlice'
import { updateExpense } from './ExpenseActions'





const EditExpense = ({categories}:{categories:any}) => {

    // retireve redux states
    const isedit = useSelector((state: RootState) => state.datatable.edit)
    const page = useSelector((state: RootState) => state.datatable.page)
    const editdata = useSelector((state: RootState) => state.datatable.data)
    const dispatch = useDispatch()





    const router = useRouter()

    // setup our form initial values as well as validation schema
    const formik = useFormik({
        initialValues: {
            id: "",
            name: "",
            amount: 0,
            description: "",
            categoryId: ""
        },
        validationSchema: Yup.object().shape({
            name: Yup.string().required(),
            description: Yup.string().required(),
            amount: Yup.number().required(),
            categoryId: Yup.string().required()

        }),
        onSubmit: async (values, formikHelpers) => {

            try {
                const res = await updateExpense({ ...values });

                if (res instanceof Error) {
                    throw res;
                }

                Revalidate("/expenses");
                toast.success("expense updated successfully!");
            } catch (error) {
                toast.error("Failed to update expense. Please try again.");
            }

        },

    })

    // dynamically set update values from state
    useEffect(() => {
        if (isedit && page === "expenses") {
            formik.setValues({
                id: editdata.id,
                name: editdata.expensename as string,
                amount: editdata.amount as number,
                description: editdata.description,
                categoryId: editdata.category.id

            })
        }
    }, [isedit, page, editdata])




    return (
        <Dialog open={isedit && page === "expenses"} onOpenChange={() => {
            dispatch(handleEdit({
                edit: false,
                page: "",
                data: {}
            }))

        }}>

            <DialogContent>
                <Suspense fallback="...loading">

                    <DialogHeader>

                        <DialogTitle>Update Expense</DialogTitle>
                        <DialogDescription className='my-6'>
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



                                <Button type="submit" className="w-full flex  items-center justify-center" disabled={formik.isSubmitting}>
                                    {formik.isSubmitting ? <Loader className='animate animate-spin text-primary500' /> : "update expense"}

                                </Button>

                            </form>
                        </DialogDescription>
                    </DialogHeader>
                </Suspense>
            </DialogContent>
        </Dialog>

    )
}

export default EditExpense