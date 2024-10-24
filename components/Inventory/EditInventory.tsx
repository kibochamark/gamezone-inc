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
import { createInventory, updateInventory } from './InventoryActions'
import { Revalidate } from '@/lib/Revalidate'
import toast from 'react-hot-toast'
import { handleEdit } from '@/redux/DatatbaleSlice'




const EditInventory = ({ categories }: { categories: any }) => {

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
            price: 0,
            buyingprice: 0,
            threshold: 1,
            quantity: 1,
            categoryId: "",
        },
        validationSchema: Yup.object().shape({

            name: Yup.string().required(),
            buyingprice: Yup.number().required(),
            price: Yup.number().required().test("is-greater-than-quantity", "selling price should be greater than buying price", function (value) {
                const { buyingprice } = this.parent;
                return value > parseFloat(buyingprice);
            }),

            quantity: Yup.number().required().min(0),
            threshold: Yup.number().required().test('is-less-than-quantity', 'Threshold must be less than the quantity by at least one', function (value) {
                const { quantity } = this.parent;
                return value <= quantity;
            }).min(1),
            categoryId: Yup.string().required(),
        }),
        onSubmit: async (values, formikHelpers) => {
            try {
                const res = await updateInventory({ ...values });
                console.log(JSON.stringify(res));

                if (res instanceof Error) {
                    throw res;
                }

                Revalidate("/inventory");
                toast.success("Inventory updated successfully!");
            } catch (error) {
                // console.error("Error creating category:", error);
                toast.error("Failed to update inventory. Please try again.");
            }
        },

    })


    // dynamically set update values from state
    useEffect(() => {
        if (isedit && page === "inventory") {
            formik.setValues({
                id: editdata.id,
                name: editdata.name as string,
                buyingprice:editdata.buyingprice as number,
                price: editdata.price as number,
                threshold:editdata.threshold as number,
                quantity: editdata.quantity as number,
                categoryId: editdata.categoryId as string
            })
        }
    }, [isedit, page, editdata])


    console.log(isedit, page, editdata)


    return (
        <Dialog open={isedit && page === "inventory"} onOpenChange={() => {
            dispatch(handleEdit({
                edit: false,
                page: "",
                data: {}
            }))

        }}>

            <DialogContent>
                <Suspense fallback="...loading">

                    <DialogHeader>

                        <DialogTitle>Update product</DialogTitle>
                        <DialogDescription className='my-6'>

                            <form className="grid gap-4 my-4" method='POST' onSubmit={formik.handleSubmit}>
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
                                    <Label htmlFor="buyingprice mb-2">Buying Price</Label>
                                    {formik.touched.buyingprice && formik.errors.buyingprice && (
                                        <p className='text-sm text-red-600 tracking-tight leading-tight'>{formik.errors.buyingprice}</p>
                                    )}
                                    <Input
                                        id="buyingprice"
                                        name='buyingprice'
                                        type="number"
                                        onChange={formik.handleChange}
                                        defaultValue={formik.values.buyingprice}
                                        onBlur={formik.handleBlur}
                                        disabled={formik.isSubmitting}

                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price mb-2">Selling Price</Label>
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
                                    <Label htmlFor="threshold mb-2">Threshold</Label>
                                    {formik.touched.threshold && formik.errors.threshold && (
                                        <p className='text-sm text-red-600 tracking-tight leading-tight'>{formik.errors.threshold}</p>
                                    )}
                                    <Input
                                        id="threshold"
                                        name='threshold'
                                        type="number"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={formik.isSubmitting}
                                        defaultValue={formik.values.threshold}
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="categoryId mb-2">Category</Label>
                                    {formik.touched.categoryId && formik.errors.categoryId && (
                                        <p className='text-sm text-red-600 tracking-tight leading-tight'>{formik.errors.categoryId}</p>
                                    )}
                                    <select id="categoryId" name='categoryId' defaultValue={formik.values.categoryId} onChange={formik.handleChange} onBlur={formik.handleBlur} disabled={formik.isSubmitting} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                        <option value="">select category</option>
                                        {
                                            categories?.map((cat: any, idx: number) => (
                                                <option key={idx} value={cat.id}>{cat.name}</option>
                                            ))}

                                    </select>



                                </div>

                                <Button type="submit" className="w-full flex  items-center justify-center" disabled={formik.isSubmitting}>
                                    {formik.isSubmitting ? <Loader className='animate animate-spin text-primary500' /> : "Update Inventory"}

                                </Button>

                            </form>
                        </DialogDescription>
                    </DialogHeader>
                </Suspense>
            </DialogContent>
        </Dialog>

    )
}

export default EditInventory
