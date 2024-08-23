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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { createCategory } from './CategoryActions'
import { Revalia } from 'next/font/google'
import { Revalidate } from '@/lib/Revalidate'
import toast from 'react-hot-toast'




const AddCategory = () => {
    const router = useRouter()


    // setup our form initial values as well as validation schema
    const formik = useFormik({
        initialValues: {

            name: "",

            type: ""

        },
        validationSchema: Yup.object().shape({

            name: Yup.string().required().max(10),
            type: Yup.string().required()

        }),
        onSubmit: async (values, formikHelpers) => {
            try {
                const res = await createCategory({ name: values.name, type: values.type });
                console.log(JSON.stringify(res));

                if (res instanceof Error) {
                    throw res;
                }

                Revalidate("/managecategories");
                toast.success("Category created successfully!");
            } catch (error) {
                // console.error("Error creating category:", error);
                toast.error("Failed to create category. Please try again.");
            }


        }

    })
    return (
        <Dialog>
            <DialogTrigger>
                <Button asChild size="sm" className="flex items-center justify-between bg-white text-primary600 border border-primary600 hover:bg-primary600 hover:text-white transition-all duration-300 gap-1">
                    <p>
                        Add Category
                        <ArrowUpRight className="h-4 w-4" />
                    </p>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <Suspense fallback="...loading">

                    <DialogHeader>

                        <DialogTitle>Add Category</DialogTitle>
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
                                        disabled={formik.isSubmitting}

                                        placeholder=""
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="type mb-2">Category Type</Label>
                                    {formik.touched.type && formik.errors.type && (
                                        <p className='text-sm text-red-600 tracking-tight leading-tight'>{formik.errors.type}</p>
                                    )}
                                    <select id="type" name='type' defaultValue={formik.values.type} onChange={formik.handleChange} onBlur={formik.handleBlur} disabled={formik.isSubmitting} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                        <option value="">select category</option>

                                        <option value={"expense"}>expense</option>
                                        <option value={"inventory"}>inventory</option>


                                    </select>



                                </div>


                                <Button type="submit" className="w-full flex items-center justify-center" disabled={formik.isSubmitting}>
                                    {formik.isSubmitting ? <Loader className='animate animate-spin text-primary500'/> : "create category"} 
                             
                                </Button>

                            </form>
                        </DialogDescription>
                    </DialogHeader>
                </Suspense>
            </DialogContent>
        </Dialog>

    )
}

export default AddCategory