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
import { createInventory, createSale } from './InventoryActions'
import { Revalidate } from '@/lib/Revalidate'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'




const MakeSale = () => {
    const router = useRouter()

    const data= useSelector((state:RootState)=> state.datatable.data)
    const issale= useSelector((state:RootState)=> state.datatable.issale)
    const page= useSelector((state:RootState)=> state.datatable.page)


    // setup our form initial values as well as validation schema
    const formik = useFormik({
        initialValues: {
            inventoryId:"",
            price: 0,
            quantity: 1,
            threshold:0
        },
        validationSchema: Yup.object().shape({
            price: Yup.number().required(),
            quantity: Yup.number().required().min(1),
           
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

    useEffect(()=>{
        if(issale && page === "inventory"){
            formik.setFieldValue("inventoryId", data?.id)
            formik.setFieldValue("threshold", data?.threshold)
        }
    }, [data, issale, page])
    return (



        <form className="grid gap-4 my-4" method='POST' onSubmit={formik.handleSubmit}>
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

                    <span className='text-green-300 ml-2'>(suggested:{formik.values.quantity * data.price})</span>
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
           
            
            

            <Button type="submit" className="w-full flex  items-center justify-center" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? <Loader className='animate animate-spin text-primary500' /> : "create sale"}

            </Button>

        </form>


    )
}

export default MakeSale