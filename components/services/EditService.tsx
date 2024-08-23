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
import { updateService } from './ServiceActions'




const Editservice = () => {

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

        },
        validationSchema: Yup.object().shape({
            name: Yup.string().required(),
            price: Yup.number().required(),

        }),
        onSubmit: async (values, formikHelpers) => {

            try {
                const res = await updateService({ ...values });

                if (res instanceof Error) {
                    throw res;
                }

                Revalidate("/services");
                toast.success("service created successfully!");
            } catch (error) {
                toast.error("Failed to create service. Please try again.");
            }

        },

    })

    // dynamically set update values from state
    useEffect(() => {
        if (isedit && page === "services") {
            formik.setValues({
                id: editdata.id,
                name: editdata.name as string,
                price: editdata.price as number,

            })
        }
    }, [isedit, page, editdata])




    return (
        <Dialog open={isedit && page === "services"} onOpenChange={() => {
            dispatch(handleEdit({
                edit: false,
                page: "",
                data: {}
            }))

        }}>

            <DialogContent>
                <Suspense fallback="...loading">

                    <DialogHeader>

                        <DialogTitle>Update Service</DialogTitle>
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
                                    <Label htmlFor="buyingprice mb-2">Service Price</Label>
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
                                    {formik.isSubmitting ? <Loader className='animate animate-spin text-primary500' /> : "update service"}

                                </Button>

                            </form>
                        </DialogDescription>
                    </DialogHeader>
                </Suspense>
            </DialogContent>
        </Dialog>

    )
}

export default Editservice