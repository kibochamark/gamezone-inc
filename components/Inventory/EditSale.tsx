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
import { createInventory, createSale, updateInventory } from './InventoryActions'
import { Revalidate } from '@/lib/Revalidate'
import toast from 'react-hot-toast'
import { handleEdit } from '@/redux/DatatbaleSlice'




const EditSale = () => {

    // retireve redux states
    const isedit = useSelector((state: RootState) => state.datatable.edit)
    const page = useSelector((state: RootState) => state.datatable.page)
    const editdata = useSelector((state: RootState) => state.datatable.data)
    const dispatch = useDispatch()





    const router = useRouter()

    // const data = useSelector((state: RootState) => state.datatable.data)
    const issale = useSelector((state: RootState) => state.datatable.issale)



    // setup our form initial values as well as validation schema
    const formik = useFormik({
        initialValues: {
            inventoryId: "",
            price: 0,
            quantity: 1,
            threshold: 0,
            saletype: '',
            vendor: '',
            status:''

        },
        validationSchema: Yup.object().shape({
            price: Yup.number().required(),
            quantity: Yup.number().required().min(1),
            saletype: Yup.string().oneOf(["DEBIT", "CREDIT"]).required(),
            vendor: Yup.string().optional(),
            status:Yup.string().oneOf(["CREDITED", "RETURNED", "SOLD"]).required()
        }),
        onSubmit: async (values, formikHelpers) => {
            // console.log(values)
            try {

                const res = await createSale({ ...values });
                // console.log(JSON.stringify(res));

                if (res instanceof Error) {
                    throw res;
                }

                Revalidate("/inventory");
                Revalidate("/sales");
                toast.success("Sale created successfully!");
            } catch (error) {
                // console.error("Error creating category:", error);
                toast.error("Failed to create sale. Please try again.");
            }

        },

    })


    // dynamically set update values from state
    useEffect(() => {
        if (isedit && page === "sales") {
            formik.setValues({
                inventoryId: editdata?.inventory?.id,
                price: editdata?.priceSold,
                quantity: editdata?.quantitySold,
                threshold: editdata?.inventory?.threshold,
                saletype: editdata?.inventory?.type,
                vendor:editdata?.vendor,
                status:editdata?.status
            })
        }
    }, [isedit, page, editdata])



    console.log(editdata, "editdT")

    return (
        <Dialog open={isedit && page === "sales"} onOpenChange={() => {
            dispatch(handleEdit({
                edit: false,
                page: "",
                data: {}
            }))

        }}>

            <DialogContent>
                <Suspense fallback="...loading">

                    <DialogHeader>

                        <DialogTitle>Update Sale</DialogTitle>
                        <DialogDescription className='my-6'>

                            <form className="grid gap-4 my-4" method='POST' onSubmit={formik.handleSubmit}>
                                <div className="grid gap-2">
                                    <Label htmlFor="quantity mb-2">Sold By</Label>
                                    <Input
                                        type="text"
                                        readOnly
                                        className='bg-gray-200 text-black'
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="quantity mb-2">Quantity</Label>
                                    {formik.touched.quantity && formik.errors.quantity && (
                                        <p className='text-sm text-red-600 tracking-tight leading-tight'>{formik.errors.quantity}</p>
                                    )}
                                    <Input
                                        id="quantity"
                                        name='quantity'
                                        type="number"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={formik.isSubmitting}
                                        defaultValue={formik.values.quantity}
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="buyingprice mb-2">Price Sold
                                    </Label>
                                    {formik.touched.price && formik.errors.price && (
                                        <p className='text-sm text-red-600 tracking-tight leading-tight'>{formik.errors.price}</p>
                                    )}
                                    <Input
                                        id="price"
                                        name='price'
                                        type="number"
                                        onChange={formik.handleChange}
                                        defaultValue={formik.values.price}
                                        onBlur={formik.handleBlur}
                                        disabled={formik.isSubmitting}

                                        placeholder=""
                                        required
                                    />
                                </div>


                                <div>
                                    <Label htmlFor="categoryId mb-2">Sale Type</Label>
                                    {formik.touched.saletype && formik.errors.saletype && (
                                        <p className='text-sm text-red-600 tracking-tight leading-tight'>{formik.errors.saletype}</p>
                                    )}
                                    <select id="categoryId" name='categoryId' defaultValue={formik.values.saletype} onChange={formik.handleChange} onBlur={formik.handleBlur} disabled={formik.isSubmitting} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                        <option value="">select a sale type</option>

                                        <option value={"DEBIT"}>Debit</option>
                                        <option value={"CREDIT"}>CREDIT</option>


                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="categoryId mb-2">Sale Status</Label>
                                    {formik.touched.status && formik.errors.status && (
                                        <p className='text-sm text-red-600 tracking-tight leading-tight'>{formik.errors.status}</p>
                                    )}
                                    <select id="" name='status' defaultValue={formik.values.status} onChange={formik.handleChange} onBlur={formik.handleBlur} disabled={formik.isSubmitting} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                        <option value="">select a sale status</option>

                                        <option value={"CREDITED"}>Credited</option>
                                        <option value={"SOLD"}>Sold</option>
                                        <option value={"RETURNED"}>Returned</option>


                                    </select>
                                </div>


                                {formik.values.saletype === "CREDIT" && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="vendor">Vendor Name</Label>
                                        {formik.touched.vendor && formik.errors.vendor && (
                                            <p className='text-sm text-red-600 tracking-tight leading-tight'>{formik.errors.vendor}</p>
                                        )}
                                        <Input
                                            id="vendor"
                                            name='vendor'
                                            type="text"
                                            onChange={formik.handleChange}
                                            defaultValue={formik.values.vendor}
                                            className='space-x-2'
                                            onBlur={formik.handleBlur}
                                            disabled={formik.isSubmitting}

                                            placeholder=""
                                            required
                                        />
                                    </div>

                                )}




                                <Button type="submit" className="w-full flex  items-center justify-center" disabled={formik.isSubmitting}>
                                    {formik.isSubmitting ? <Loader className='animate animate-spin text-primary500' /> : "update sale"}

                                </Button>

                            </form>
                        </DialogDescription>
                    </DialogHeader>
                </Suspense>
            </DialogContent>
        </Dialog>

    )
}

export default EditSale